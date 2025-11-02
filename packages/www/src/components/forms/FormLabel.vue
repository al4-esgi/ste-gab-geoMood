<script setup lang="ts">
import { computed } from 'vue';

type Props = {
    required?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    required: false,
    margin: false,
});

const labelClasses = computed(() => ({
    'form-label--required': props.required,
}));
</script>

<template>
    <label class="text-sm" :class="labelClasses">
        <slot />
    </label>
</template>

<style lang="scss" scoped>
.form-label {
    display: block;

    &--required::after {
        content: '*';
        margin-left: 4px;
        color: var(--color-error);
    }

    &--margin {
        margin-bottom: var(--scale-4r);
    }
}
</style>
