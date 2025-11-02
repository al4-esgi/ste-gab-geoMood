<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, useAttrs } from 'vue';
import { InputMask } from 'primevue';
import FormLabel from './FormLabel.vue';

type ModelValue = string | number | string[] | null;

type Props = {
    name: string;
    mask: string;
    placeholder?: string;
    disabled?: boolean;
    fluid?: boolean;
    label?: string;
    rules?: string | Record<string, any>;
};

const props = withDefaults(defineProps<Props>(), {
    placeholder: '',
    disabled: false,
    fluid: true,
    label: '',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value?: ModelValue): void;
}>();

const attrs = useAttrs();

const { value, errorMessage, handleBlur, handleChange } = useField(
    props.name,
    props.rules,
    {
        initialValue: '',
    },
);

const required = computed(() => props.rules?.includes('required'));
const fieldAttrs = computed(() => ({
    value: value.value,
    onBlur: handleBlur,
    'onUpdate:modelValue': (val: any) => {
        value.value = val;
        emit('update:modelValue', val);
        handleChange(val);
    },
    ...attrs,
}));
</script>

<template>
    <div class="field">
        <FormLabel v-if="$slots.default" :required="required">
            <slot>{{ label }}</slot>
        </FormLabel>
        <InputMask
            v-bind="fieldAttrs"
            :mask="mask"
            :placeholder="placeholder"
            :class="{ 'field__input--error': errorMessage }"
            :disabled="disabled"
        />
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
            border-color: var(--color-error) !important;
            outline-color: var(--color-error) !important;
        }
    }

    &__error {
        font-size: 0.75em;
        color: var(--color-error);
        margin-top: 0.25em;
    }
}
</style>
