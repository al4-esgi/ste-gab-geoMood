<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Button, Card } from 'primevue';
import { RouteName } from '@/vars/RouteAttr';

const router = useRouter();
const { t } = useI18n();
</script>

<template>
    <Card class="not-found">
        <template #title>
            <h3>{{ t('errors.not_found.title') }}</h3>
        </template>
        <template #subtitle>
            <p class="text-sm">{{ t('errors.not_found.description') }}</p>
        </template>
        <template #content>
            <div class="not-found__illustration">
                <span class="not-found__code">404</span>
            </div>
            <p class="not-found__message text-sm">
                {{ t('errors.not_found.message') }}
            </p>
        </template>
        <template #footer>
            <Button
                class="not-found__button"
                :label="t('errors.go_home')"
                fluid
                @click="router.push({ name: RouteName.HOME })"
            />
        </template>
    </Card>
</template>

<style lang="scss" scoped>
@use '@/libs/sass/mixins.scss';
@use '@/libs/sass/animations.scss';

.not-found {
    @include animations.slideUp;

    &__illustration {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: var(--scale-6r) 0;
    }

    &__code {
        font-size: 6rem;
        font-weight: bold;
        color: var(--color-primary);
        line-height: 1;
        margin-bottom: var(--scale-4r);
    }

    &__icon {
        font-size: 3.5rem;
        color: var(--color-primary);
    }

    &__message {
        text-align: center;
        margin-bottom: var(--scale-6r);
    }

    &__button {
        margin-bottom: var(--scale-4r);
    }

    &__footer {
        display: flex;
        justify-content: center;
        margin-top: var(--scale-2r);
    }
}
</style>

<i18n lang="json">
{
    "fr": {
        "errors": {
            "not_found": {
                "title": "Page non trouvée",
                "description": "Il semble que vous ayez suivi un lien brisé ou entré une URL qui n'existe pas sur ce site.",
                "message": "Il semble que vous ayez suivi un lien brisé ou entré une URL qui n'existe pas sur ce site."
            },
            "go_home": "Retour à l'accueil"
        }
    }
}
</i18n>
