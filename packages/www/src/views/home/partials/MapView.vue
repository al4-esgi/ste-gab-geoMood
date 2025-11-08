<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { t } = useI18n();
const mapContainer = ref<HTMLElement | null>(null);
const isLoadingLocation = ref(true);
const mapInstance = ref<L.Map | null>(null);
const currentMarker = ref<L.Marker | null>(null);
const hasUserLocation = ref(false);

const initMap = (lat: number, lng: number, isUserLocation = false) => {
    if (!mapContainer.value) return;

    mapInstance.value = L.map(mapContainer.value).setView([lat, lng], 13);

    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20,
        },
    ).addTo(mapInstance.value as L.Map);

    currentMarker.value = L.marker([lat, lng]).addTo(
        mapInstance.value as L.Map,
    );
    currentMarker.value
        .bindPopup(`<b>${t('map.yourLocation')}</b>`)
        .openPopup();

    hasUserLocation.value = isUserLocation;
    isLoadingLocation.value = false;
};

const updateMapLocation = (
    lat: number,
    lng: number,
    isUserLocation = false,
) => {
    if (!mapInstance.value) return;

    mapInstance.value.setView([lat, lng], 13);

    if (currentMarker.value) {
        currentMarker.value.remove();
    }

    currentMarker.value = L.marker([lat, lng]).addTo(
        mapInstance.value as L.Map,
    );
    currentMarker.value
        .bindPopup(`<b>${t('map.yourLocation')}</b>`)
        .openPopup();

    hasUserLocation.value = isUserLocation;
    isLoadingLocation.value = false;
};

const requestGeolocation = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapInstance.value && !hasUserLocation.value) {
                    updateMapLocation(latitude, longitude, true);
                } else {
                    initMap(latitude, longitude, true);
                }
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error(t('map.geolocationDenied'));
                } else {
                    toast.error(t('map.geolocationError'));
                }
                isLoadingLocation.value = false;
                if (!mapInstance.value) {
                    initMap(48.8566, 2.3522, false);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    } else {
        toast.error(t('map.geolocationNotSupported'));
        isLoadingLocation.value = false;
        if (!mapInstance.value) {
            initMap(48.8566, 2.3522, false);
        }
    }
};

const initPermissionWatcher = async () => {
    if ('permissions' in navigator) {
        try {
            const permission = await navigator.permissions.query({
                name: 'geolocation',
            });
            permission.addEventListener('change', () => {
                if (permission.state === 'granted' && !hasUserLocation.value) {
                    isLoadingLocation.value = true;
                    requestGeolocation();
                } else if (
                    permission.state === 'denied' &&
                    hasUserLocation.value
                ) {
                    hasUserLocation.value = false;
                    toast.error(t('map.geolocationDenied'));
                    if (mapInstance.value && currentMarker.value) {
                        updateMapLocation(48.8566, 2.3522, false);
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao monitorar permissões:', error);
        }
    }
};

onMounted(() => {
    if (!mapContainer.value) {
        return;
    }

    requestGeolocation();
    initPermissionWatcher();
});

onUnmounted(() => {
    if (mapInstance.value) {
        mapInstance.value.remove();
        mapInstance.value = null;
    }
});
</script>

<template>
    <div class="map-view">
        <div v-if="isLoadingLocation" class="map-view__loading">
            <div class="map-view__spinner" />
            <p class="map-view__loading-text">{{ t('map.loading') }}</p>
        </div>
        <div ref="mapContainer" class="map-view__container" />
    </div>
</template>

<i18n lang="json">
{
    "fr": {
        "map": {
            "loading": "Obtention de votre position...",
            "yourLocation": "Votre position",
            "geolocationError": "Impossible d'obtenir votre position",
            "geolocationDenied": "Accès à la géolocalisation refusé",
            "geolocationNotSupported": "Géolocalisation non supportée par votre navigateur"
        }
    }
}
</i18n>

<style lang="scss" scoped>
@use '@/libs/sass/animations';
@use '@/libs/sass/vars';

.map-view {
    width: 100%;
    height: 100%;

    &__container {
        width: 100%;
        height: 100%;
    }

    &__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: vars.$zIndex-modal;
        text-align: center;
        background: white;
        padding: var(--scale-8r);
        border-radius: var(--scale-2r);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &__loading-text {
        margin-top: var(--scale-4r);
        color: var(--color-description);
        font-size: var(--scale-4r);
    }

    &__spinner {
        border: 4px solid var(--blue-100);
        border-top: 4px solid var(--color-primary);
        border-radius: 50%;
        width: var(--scale-10r);
        height: var(--scale-10r);
        @include animations.spin;
        margin: 0 auto;
    }
}
</style>
