<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useUserPhoto } from '@/composables/useUserPhoto';

const { t } = useI18n();
const { setUserPhoto } = useUserPhoto();

const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const capturedImage = ref<string | null>(null);
const isCameraActive = ref(false);
const isLoading = ref(false);
const showDialog = ref(false);

onUnmounted(() => {
    stopCamera();
});

const openCamera = () => {
    showDialog.value = true;
};

const startCamera = async () => {
    try {
        isLoading.value = true;
        await nextTick();

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
            audio: false,
        });

        mediaStream.value = stream;
        await nextTick();

        if (videoElement.value) {
            videoElement.value.srcObject = stream;
            videoElement.value.muted = true;
            videoElement.value.playsInline = true;

            await videoElement.value.play();
            isCameraActive.value = true;
            isLoading.value = false;
        } else {
            toast.error(t('camera.accessError'));
            isLoading.value = false;
            stopCamera();
            showDialog.value = false;
        }
    } catch (error) {
        toast.error(t('camera.accessError'));
        isLoading.value = false;
        isCameraActive.value = false;
        showDialog.value = false;
    }
};

const stopCamera = () => {
    if (mediaStream.value) {
        mediaStream.value.getTracks().forEach((track) => track.stop());
        mediaStream.value = null;
    }

    if (videoElement.value) {
        videoElement.value.srcObject = null;
    }

    isCameraActive.value = false;
    isLoading.value = false;
};

const capturePhoto = () => {
    if (!videoElement.value || !canvasElement.value) return;

    const video = videoElement.value;
    const canvas = canvasElement.value;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedImage.value = canvas.toDataURL('image/png');

    stopCamera();
    toast.success(t('camera.photoTaken'));
};

const retakePhoto = () => {
    capturedImage.value = null;
    startCamera();
};

const closeCamera = () => {
    if (capturedImage.value) {
        setUserPhoto(capturedImage.value);
    }
    capturedImage.value = null;
    stopCamera();
    showDialog.value = false;
};

watch(showDialog, (newVal) => {
    if (newVal && !capturedImage.value) {
        startCamera();
    } else if (!newVal) {
        stopCamera();
        capturedImage.value = null;
    }
});
</script>

<template>
    <div class="camera-capture">
        <Button
            class="camera-capture__trigger"
            icon="pi pi-camera"
            rounded
            @click="openCamera"
            :disabled="isLoading"
        />

        <Dialog
            v-model:visible="showDialog"
            modal
            :closable="true"
            :dismissableMask="true"
            header=""
            class="camera-capture__dialog"
        >
            <div v-if="isLoading" class="camera-capture__loading">
                <LoadingSpinner />
                <p class="camera-capture__loading-text">
                    {{ t('camera.loading') }}
                </p>
            </div>

            <div
                v-show="isCameraActive && !capturedImage && !isLoading"
                class="camera-capture__video-container"
            >
                <video
                    ref="videoElement"
                    class="camera-capture__video"
                    autoplay
                    playsinline
                    muted
                />
                <Button
                    :label="t('camera.takePhoto')"
                    icon="pi pi-camera"
                    @click="capturePhoto"
                />
            </div>

            <div v-if="capturedImage" class="camera-capture__preview">
                <img
                    :src="capturedImage"
                    :alt="t('camera.capturedPhoto')"
                    class="camera-capture__image"
                />
                <div class="camera-capture__actions">
                    <Button
                        :label="t('camera.retake')"
                        icon="pi pi-refresh"
                        @click="retakePhoto"
                        severity="secondary"
                    />
                    <Button
                        :label="t('camera.confirm')"
                        icon="pi pi-check"
                        @click="closeCamera"
                    />
                </div>
            </div>

            <canvas ref="canvasElement" class="camera-capture__canvas" />
        </Dialog>
    </div>
</template>

<style lang="scss" scoped>
@use '@/libs/sass/vars';

.camera-capture {
    &__trigger {
        position: fixed !important;
        bottom: var(--scale-8r) !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: vars.$zIndex-notification !important;
        width: var(--scale-16r) !important;
        height: var(--scale-16r) !important;
    }

    &__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
        padding: var(--scale-12r);
        min-height: var(--scale-20r);
    }

    &__loading-text {
        color: var(--color-description);
        font-size: var(--scale-4r);
    }

    &__video-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
    }

    &__video {
        width: 100%;
        max-height: 60vh;
        min-height: var(--scale-30r);
        object-fit: contain;
        border-radius: var(--scale-2r);
        background: black;
    }

    &__preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
    }

    &__image {
        width: 100%;
        max-height: 70vh;
        object-fit: contain;
        border-radius: var(--scale-2r);
    }

    &__actions {
        display: flex;
        gap: var(--scale-4r);
    }

    &__canvas {
        display: none;
    }
}
</style>

<i18n lang="json">
{
    "fr": {
        "camera": {
            "loading": "Chargement de la caméra...",
            "accessError": "Impossible d'accéder à la caméra",
            "photoTaken": "Photo prise avec succès",
            "close": "Fermer",
            "takePhoto": "Prendre une photo",
            "capturedPhoto": "Photo capturée",
            "retake": "Reprendre",
            "confirm": "Confirmer"
        }
    }
}
</i18n>
