<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, useAttrs } from 'vue';
import { Checkbox } from 'primevue';
import FormLabel from './FormLabel.vue';

type Props = {
    name: string;
    label?: string;
    rules?: string | Record<string, any>;
    disabled?: boolean;
    binary?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    label: '',
    disabled: false,
    binary: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value?: boolean): void;
}>();

const attrs = useAttrs();

const { value, errorMessage, validate } = useField(props.name, props.rules, {
    initialValue: false,
});

const required = computed(() => props.rules?.includes('required'));

const onValueChange = (newValue: boolean) => {
    value.value = newValue;
    emit('update:modelValue', newValue);
    validate();
};
</script>

<template>
    <div class="field">
        <div class="field__checkbox">
            <Checkbox
                :id="name"
                v-model="value"
                :binary="binary"
                :disabled="disabled"
                @update:modelValue="onValueChange"
                v-bind="attrs"
                :class="{ 'field__input--error': errorMessage }"
            />
            <FormLabel
                v-if="$slots.default"
                :for="name"
                :required="required"
                class="field__label"
            >
                <slot>{{ label }}</slot>
            </FormLabel>
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
    gap: var(--scale-1r);

    &__checkbox {
        display: flex;
        align-items: center;
        gap: var(--scale-2r);
    }

    &__label {
        margin-bottom: 0 !important;
    }

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
