<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, useAttrs, ref } from 'vue';
import { FileUpload } from 'primevue';
import FormLabel from './FormLabel.vue';
import { useI18n } from 'vue-i18n';

type Props = {
    name: string;
    label?: string;
    rules?: string | Record<string, any>;
};

const props = withDefaults(defineProps<Props>(), {
    label: '',
    emptyTemplate: '',
});

type FileWithBase64 = {
    file: File;
    base64: string;
    name: string;
    type: string;
    size: number;
};

const emit = defineEmits<{
    (e: 'update:modelValue', value?: string | string[] | null): void;
}>();

const fileInfo = ref<FileWithBase64 | FileWithBase64[] | null>(null);

const attrs = useAttrs();
const { t } = useI18n();
const isConverting = ref(false);

const { value, errorMessage, validate } = useField<string | string[] | null>(
    props.name,
    props.rules,
    {
        initialValue: null,
    },
);

const required = computed(() => props.rules?.includes('required'));
const isDisabled = computed(() => {
    return attrs.multiple === false && !!fileInfo.value;
});
const fileTypeText = computed(() => {
    if (attrs.accept) {
        const fileTypes = attrs.accept as string;
        if (fileTypes.includes('image')) {
            return 'forms.upload.accepted_files.images';
        } else if (fileTypes.includes('application')) {
            return 'forms.upload.accepted_files.documents';
        }
    }
    return 'forms.upload.accepted_files.all';
});

const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const onSelectFile = async (event: { files: File[] }) => {
    const files = event.files;
    const isMultiple = attrs.multiple === true || attrs.multiple === '';

    isConverting.value = true;

    try {
        if (isMultiple) {
            const filesWithBase64: FileWithBase64[] = await Promise.all(
                files.map(async (file) => {
                    const base64 = await convertToBase64(file);
                    return {
                        file,
                        base64,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    };
                }),
            );

            fileInfo.value = filesWithBase64;

            const base64Strings = filesWithBase64.map((f) => f.base64);
            value.value = base64Strings;
            emit('update:modelValue', base64Strings);
        } else {
            const file = files[0];
            const base64 = await convertToBase64(file);

            const fileWithBase64: FileWithBase64 = {
                file,
                base64,
                name: file.name,
                type: file.type,
                size: file.size,
            };
            fileInfo.value = fileWithBase64;

            value.value = base64;
            emit('update:modelValue', base64);
        }
        validate();
    } finally {
        isConverting.value = false;
    }
};

const onRemoveFile = () => {
    fileInfo.value = null;
    value.value = null;
    emit('update:modelValue', null);
    validate();
};
</script>

<template>
    <div class="field">
        <FormLabel v-if="$slots.label" :required="required">
            <slot name="label">{{ label }}</slot>
        </FormLabel>
        <div :class="['field__input', { 'field__input--error': errorMessage }]">
            <FileUpload
                :name="name"
                @select="onSelectFile($event)"
                @remove="onRemoveFile"
                v-bind="attrs"
                :disabled="isDisabled || isConverting"
            >
                <template #empty>
                    <slot name="empty" />
                    <p
                        v-if="attrs.accept"
                        class="field__accepted-files text-sm"
                    >
                        {{
                            t(fileTypeText, {
                                size: (attrs.maxFileSize as number) / 1000000,
                            })
                        }}
                    </p>
                </template>
            </FileUpload>
        </div>

        <div v-if="isConverting" class="field__converting">
            <span>{{ t('forms.upload.converting_file') }}</span>
        </div>
        <span v-if="errorMessage" class="field__error">
            {{ errorMessage }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: var(--scale-2r);

    &__input {
        &--error {
            ::v-deep(.p-fileupload-advanced) {
                border: 1px solid var(--color-error) !important;
            }
        }
    }

    &__error {
        font-size: 0.75em;
        color: var(--color-error);
        margin-top: 0.25em;
    }

    &__accepted-files {
        color: var(--color-description);
        margin-top: 0.25em;
    }

    &__converting {
        font-size: 0.85em;
        color: var(--color-description);
        margin-top: 0.25em;
    }
}
</style>

<i18n lang="json">
{
    "fr": {
        "forms": {
            "upload": {
                "accepted_files": {
                    "images": "PNG ou JPG (máx. {size}MB)",
                    "documents": "PDF, DOCX ou TXT (máx. {size}MB)",
                    "all": "Todos os arquivos (máx. {size}MB)"
                },
                "converting_file": "Convertendo arquivo..."
            }
        }
    }
}
</i18n>
