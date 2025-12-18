<script setup lang="ts">
import MapView from './partials/MapView.vue';
import CameraCapture from './partials/CameraCapture.vue';
import MoodForm from './partials/MoodForm.vue';
</script>

<template>
    <div class="home">
        <MapView />
        <CameraCapture />
        <MoodForm />
    </div>
</template>

<style lang="scss" scoped>
.home {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>
