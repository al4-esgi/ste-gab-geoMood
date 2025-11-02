<script setup lang="ts">
import { computed } from 'vue';
import ContainerLayout from './components/layout/ContainerLayout.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const layoutComponent = computed(() => {
    return route.meta.layout || ContainerLayout;
});
</script>

<template>
    <Component :is="layoutComponent" />
</template>
