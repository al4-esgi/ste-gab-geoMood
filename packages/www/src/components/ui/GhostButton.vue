<script setup lang="ts">
import { RouteName } from '@/vars/RouteAttr';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = withDefaults(
    defineProps<{
        small?: boolean;
        fluid?: boolean;
        to?: RouteName;
        disabled?: boolean;
    }>(),
    {
        small: false,
        fluid: false,
        to: undefined,
        disabled: false,
    },
);

const emit = defineEmits<{
    (e: 'click'): void;
}>();

const router = useRouter();

const buttonClass = computed(() => {
    return {
        'ghost-button--small': props.small,
        'ghost-button--fluid': props.fluid,
        'ghost-button--disabled': props.disabled,
    };
});

const onClick = () => {
    if (props.to) {
        router.push({ name: props.to });
    } else {
        emit('click');
    }
};
</script>

<template>
    <button
        class="ghost-button"
        :class="buttonClass"
        type="button"
        @click="onClick"
    >
        <slot />
    </button>
</template>

<style lang="scss" scoped>
.ghost-button {
    background: transparent;
    color: var(--color-primary);
    cursor: pointer;
    font-size: 1rem;
    border: none;

    &--small {
        font-size: 0.875rem;
    }

    &--fluid {
        width: 100%;
    }

    &--disabled {
        color: var(--color-disabled);
        pointer-events: none;
    }

    &:hover {
        text-decoration: underline;
    }
}
</style>
