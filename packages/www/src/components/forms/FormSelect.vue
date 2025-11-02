<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, useAttrs } from 'vue';
import { InputIcon, Select, IconField } from 'primevue';
import FormLabel from './FormLabel.vue';

type ModelValue = string | number | string[] | null;

type Props = {
    name: string;
    options: any[];
    placeholder?: string;
    iconLeft?: string;
    iconRight?: string;
    disabled?: boolean;
    fluid?: boolean;
    label?: string;
    rules?: string | Record<string, any>;
};

const props = withDefaults(defineProps<Props>(), {
    placeholder: '',
    options: () => [],
    iconLeft: '',
    iconRight: '',
    disabled: false,
    fluid: true,
    label: '',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value?: ModelValue): void;
    (e: 'iconLeftClick'): void;
    (e: 'iconRightClick'): void;
}>();

const attrs = useAttrs();

const { value, errorMessage, handleBlur, handleChange } = useField(
    props.name,
    props.rules,
    {
        initialValue: '',
    },
);

const hasLeftIcon = computed(() => !!props.iconLeft);
const hasRightIcon = computed(() => !!props.iconRight);
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
        <IconField v-if="hasLeftIcon || hasRightIcon">
            <InputIcon
                v-if="hasLeftIcon"
                :class="iconLeft"
                position="left"
                @click="$emit('iconLeftClick')"
            />
            <Select
                v-bind="fieldAttrs"
                class="field__input"
                :class="{ 'field__input--error': errorMessage }"
                :disabled="disabled"
                :options="options"
                :placeholder="placeholder"
            />
            <InputIcon
                v-if="hasRightIcon"
                :class="iconRight"
                position="right"
                @click="$emit('iconRightClick')"
            />
        </IconField>
        <Select
            v-else
            v-bind="fieldAttrs"
            class="field__input"
            :class="{ 'field__input--error': errorMessage }"
            :disabled="disabled"
            :options="options"
            :placeholder="placeholder"
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
