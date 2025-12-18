<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Rating from 'primevue/rating';
import InputText from 'primevue/inputtext';
import { useMood } from '@/composables/useMood';
import { useGeolocation } from '@/composables/useGeolocation';
import type { CreateMoodPayload } from '@/types/Mood.type';

const { t } = useI18n();
const { createMood, isCreating } = useMood();
const { getCurrentPosition } = useGeolocation();

const showDialog = ref(false);
const textContent = ref('');
const rating = ref(3);
const email = ref('');
const capturedPhoto = ref<string | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const isCameraActive = ref(false);
const isLoadingCamera = ref(false);

const openForm = async () => {
    showDialog.value = true;
    await nextTick();
    startCamera();
};

const closeForm = () => {
    stopCamera();
    showDialog.value = false;
    resetForm();
};

const resetForm = () => {
    textContent.value = '';
    rating.value = 3;
    email.value = '';
    capturedPhoto.value = null;
};

const startCamera = async () => {
    try {
        isLoadingCamera.value = true;
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

            try {
                await videoElement.value.play();
                isCameraActive.value = true;
                isLoadingCamera.value = false;
            } catch (playError) {
                console.error('Error playing video:', playError);
                toast.error(t('form.cameraError'));
            }
        } else {
            console.error('Video element not found');
            toast.error(t('form.cameraError'));
            isLoadingCamera.value = false;
        }
    } catch (error) {
        console.error('Camera access error:', error);
        toast.error(t('form.cameraError'));
        isLoadingCamera.value = false;
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

    capturedPhoto.value = canvas.toDataURL('image/png');
    stopCamera();
    toast.success(t('form.photoTaken'));
};

const retakePhoto = () => {
    capturedPhoto.value = null;
    startCamera();
};

const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const handleSubmit = async () => {
    if (!textContent.value || !email.value) {
        toast.error(t('form.fillRequired'));
        return;
    }

    if (!capturedPhoto.value) {
        toast.error(t('form.photoRequired'));
        return;
    }

    try {
        const position = await getCurrentPosition();

        const payload: CreateMoodPayload = {
            textContent: textContent.value,
            rating: rating.value,
            email: email.value,
            location: position,
            picture: dataURLtoFile(capturedPhoto.value, 'mood-photo.png'),
        };

        await createMood(payload);
        toast.success(t('form.success'));
        closeForm();
    } catch (error) {
        toast.error(t('form.error'));
    }
};

watch(showDialog, (newVal) => {
    if (!newVal) {
        stopCamera();
    }
});

defineExpose({ openForm });
</script>

<template>
    <div class="mood-form">
        <Button
            class="mood-form__trigger"
            icon="pi pi-plus"
            rounded
            @click="openForm"
            :disabled="isCreating"
            label="Add Mood"
        />

        <Dialog
            v-model:visible="showDialog"
            modal
            :closable="true"
            :dismissableMask="true"
            :header="t('form.title')"
            class="mood-form__dialog"
            :style="{ width: '90vw', maxWidth: '600px' }"
        >
            <form @submit.prevent="handleSubmit" class="mood-form__content">
                <!-- Camera Section -->
                <div class="mood-form__camera-section">
                    <div v-if="isLoadingCamera" class="mood-form__camera-loading">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                        <p>{{ t('form.cameraLoading') }}</p>
                    </div>

                    <div v-else-if="isCameraActive && !capturedPhoto" class="mood-form__camera-container">
                        <video
                            ref="videoElement"
                            class="mood-form__video"
                            autoplay
                            playsinline
                            muted
                        />
                        <Button
                            type="button"
                            :label="t('form.takePhoto')"
                            icon="pi pi-camera"
                            @click="capturePhoto"
                            class="mood-form__capture-btn"
                        />
                    </div>

                    <div v-else-if="capturedPhoto" class="mood-form__photo-preview">
                        <img :src="capturedPhoto" :alt="t('form.photoPreview')" />
                        <Button
                            type="button"
                            :label="t('form.retakePhoto')"
                            icon="pi pi-refresh"
                            @click="retakePhoto"
                            severity="secondary"
                            size="small"
                        />
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="mood-form__field">
                    <label for="email">{{ t('form.email') }}</label>
                    <InputText
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        :placeholder="t('form.emailPlaceholder')"
                    />
                </div>

                <div class="mood-form__field">
                    <label for="rating">{{ t('form.rating') }}</label>
                    <Rating id="rating" v-model="rating" :stars="5" />
                </div>

                <div class="mood-form__field">
                    <label for="textContent">{{ t('form.textContent') }}</label>
                    <Textarea
                        id="textContent"
                        v-model="textContent"
                        rows="5"
                        required
                        :placeholder="t('form.textContentPlaceholder')"
                        maxlength="1000"
                    />
                </div>

                <div class="mood-form__actions">
                    <Button
                        type="button"
                        :label="t('form.cancel')"
                        severity="secondary"
                        @click="closeForm"
                        :disabled="isCreating"
                    />
                    <Button
                        type="submit"
                        :label="t('form.submit')"
                        :loading="isCreating"
                    />
                </div>
            </form>

            <canvas ref="canvasElement" class="mood-form__canvas" />
        </Dialog>
    </div>
</template>

<style lang="scss" scoped>
@use '@/libs/sass/vars';

.mood-form {
    &__trigger {
        position: fixed !important;
        bottom: var(--scale-8r) !important;
        right: var(--scale-8r) !important;
        z-index: vars.$zIndex-notification !important;
    }

    &__content {
        display: flex;
        flex-direction: column;
        gap: var(--scale-6r);
        padding: var(--scale-2r) 0;
    }

    &__camera-section {
        width: 100%;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__camera-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
        padding: var(--scale-8r);

        p {
            margin: 0;
            color: var(--color-description);
        }
    }

    &__camera-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
    }

    &__video {
        width: 100%;
        max-height: 400px;
        border-radius: var(--scale-2r);
        background: black;
        object-fit: contain;
    }

    &__capture-btn {
        width: 100%;
    }

    &__photo-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
        padding: var(--scale-4r);
        background: var(--color-surface-50);
        border-radius: var(--scale-2r);
        border: 2px dashed var(--color-primary);

        img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--color-primary);
        }
    }

    &__canvas {
        display: none;
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: var(--scale-2r);

        label {
            font-weight: 600;
            color: var(--color-text);
        }
    }

    &__actions {
        display: flex;
        gap: var(--scale-4r);
        justify-content: flex-end;
        margin-top: var(--scale-4r);
    }
}
</style>

<i18n lang="json">
{
    "fr": {
        "form": {
            "title": "Ajouter un mood",
            "email": "Email",
            "emailPlaceholder": "votre{'@'}email.com",
            "rating": "Note",
            "textContent": "Comment vous sentez-vous ?",
            "textContentPlaceholder": "Partagez votre humeur...",
            "cancel": "Annuler",
            "submit": "Envoyer",
            "fillRequired": "Veuillez remplir tous les champs requis",
            "photoRequired": "Veuillez prendre une photo",
            "success": "Mood ajouté avec succès !",
            "error": "Erreur lors de l'ajout du mood",
            "photoPreview": "Aperçu de la photo",
            "takePhoto": "Prendre la photo",
            "retakePhoto": "Reprendre",
            "cameraLoading": "Chargement de la caméra...",
            "cameraError": "Impossible d'accéder à la caméra",
            "photoTaken": "Photo capturée avec succès !"
        }
    }
}
</i18n>
