<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Rating from 'primevue/rating';
import InputText from 'primevue/inputtext';
import { useMood } from '@/composables/useMood';
import { useGeolocation } from '@/composables/useGeolocation';
import { useUserPhoto } from '@/composables/useUserPhoto';
import type { CreateMoodPayload } from '@/types/Mood.type';

const { t } = useI18n();
const { createMood, isCreating } = useMood();
const { getCurrentPosition } = useGeolocation();
const { userPhoto } = useUserPhoto();

const showDialog = ref(false);
const textContent = ref('');
const rating = ref(3);
const email = ref('');

const openForm = () => {
    showDialog.value = true;
};

const closeForm = () => {
    showDialog.value = false;
    resetForm();
};

const resetForm = () => {
    textContent.value = '';
    rating.value = 3;
    email.value = '';
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

    try {
        const position = await getCurrentPosition();

        const payload: CreateMoodPayload = {
            textContent: textContent.value,
            rating: rating.value,
            email: email.value,
            location: position,
        };

        if (userPhoto.value) {
            payload.picture = dataURLtoFile(userPhoto.value, 'user-photo.png');
        }

        await createMood(payload);
        toast.success(t('form.success'));
        closeForm();
    } catch (error) {
        toast.error(t('form.error'));
    }
};

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
        >
            <form @submit.prevent="handleSubmit" class="mood-form__content">
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
        padding: var(--scale-4r);
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
            "emailPlaceholder": "votre@email.com",
            "rating": "Note",
            "textContent": "Comment vous sentez-vous ?",
            "textContentPlaceholder": "Partagez votre humeur...",
            "cancel": "Annuler",
            "submit": "Envoyer",
            "fillRequired": "Veuillez remplir tous les champs requis",
            "success": "Mood ajouté avec succès !",
            "error": "Erreur lors de l'ajout du mood"
        }
    }
}
</i18n>
