<script setup lang="ts">
withDefaults(
    defineProps<{
        tag?: string;
        small?: boolean;
        public?: boolean;
        centralized?: boolean;
        noPadding?: boolean;
    }>(),
    {
        tag: 'div',
    },
);
</script>

<template>
    <div v-if="centralized" class="centralized-wrapper">
        <Component
            :is="tag"
            class="container"
            :class="{
                'container--small': small,
                'container--no-padding': noPadding,
                'container--public': public,
                'container--centralized': centralized,
            }"
        >
            <router-view />
        </Component>
    </div>
    <Component
        v-else
        :is="tag"
        class="container"
        :class="{
            'container--small': small,
            'container--no-padding': noPadding,
            'container--public': public,
        }"
    >
        <router-view />
    </Component>
</template>

<style scoped lang="scss">
@use '@/libs/sass/vars.scss';

.centralized-wrapper {
    background: var(--bg-default);
}

.container {
    max-width: vars.$container-width;
    width: 100%;
    margin: 0 auto;
    padding: 0 0.75em;
    height: 100vh;

    &--with-aside-nav {
        padding: 0 var(--scale-6r);
    }

    &--small {
        max-width: vars.$container-width--small;
    }

    &--no-padding {
        padding: 0;
    }

    &--public {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &--centralized {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1;
        background: transparent;
        height: 100vh;
    }
}
</style>
