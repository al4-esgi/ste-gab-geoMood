<script setup lang="ts"></script>

<template>
    <div class="loading-spinner" />
</template>

<style lang="scss" scoped>
@use '@/libs/sass/animations';

.loading-spinner {
    border: var(--scale-1r) solid var(--blue-100);
    border-top: var(--scale-1r) solid var(--color-primary);
    border-radius: 50%;
    width: var(--scale-10r);
    height: var(--scale-10r);
    @include animations.spin;
}
</style>
