<script setup lang="ts">
import ContainerLayout from './ContainerLayout.vue';
</script>

<template>
    <ContainerLayout centralized>
        <main>
            <RouterView />
        </main>
    </ContainerLayout>
</template>
