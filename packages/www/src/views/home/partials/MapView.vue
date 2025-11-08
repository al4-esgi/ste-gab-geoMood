<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import Card from 'primevue/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useUserPhoto } from '@/composables/useUserPhoto';

const { t } = useI18n();
const { userPhoto } = useUserPhoto();
const mapContainer = ref<HTMLElement | null>(null);
const isLoadingLocation = ref(true);
const mapInstance = ref<L.Map | null>(null);
const currentMarker = ref<L.Marker | null>(null);
const hasUserLocation = ref(false);

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

    const icon = createMarkerIcon(userPhoto.value);
    const markerOptions = icon ? { icon } : {};

    currentMarker.value = L.marker([lat, lng], markerOptions).addTo(
        mapInstance.value as L.Map,
    );

    hasUserLocation.value = isUserLocation;
    isLoadingLocation.value = false;
};

const createMarkerIcon = (photo?: string | null) => {
    if (photo) {
        return L.divIcon({
            html: `<div style="width: var(--scale-20r); height: var(--scale-20r); border-radius: 50%; overflow: hidden; border: var(--scale-1r) solid var(--color-primary); background: white;">
                <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>`,
            className: '',
            iconSize: [80, 80],
            iconAnchor: [40, 40],
        });
    }
    return undefined;
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

    const icon = createMarkerIcon(userPhoto.value);
    const markerOptions = icon ? { icon } : {};

    currentMarker.value = L.marker([lat, lng], markerOptions).addTo(
        mapInstance.value as L.Map,
    );

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
        } catch {}
    }
};

watch(userPhoto, (newPhoto) => {
    if (currentMarker.value && mapInstance.value) {
        const position = currentMarker.value.getLatLng();
        currentMarker.value.remove();

        const icon = createMarkerIcon(newPhoto);
        const markerOptions = icon ? { icon } : {};

        currentMarker.value = L.marker(position, markerOptions).addTo(
            mapInstance.value as L.Map,
        );
    }
});
</script>

<template>
    <div class="map-view">
        <Card v-if="isLoadingLocation" class="map-view__loading">
            <template #content>
                <div class="map-view__loading-content">
                    <LoadingSpinner />
                    <p class="map-view__loading-text">{{ t('map.loading') }}</p>
                </div>
            </template>
        </Card>
        <div ref="mapContainer" class="map-view__container" />
    </div>
</template>

<i18n lang="json">
{
    "fr": {
        "map": {
            "loading": "Obtention de votre position...",
            "geolocationError": "Impossible d'obtenir votre position",
            "geolocationDenied": "Accès à la géolocalisation refusé",
            "geolocationNotSupported": "Géolocalisation non supportée par votre navigateur"
        }
    }
}
</i18n>

<style lang="scss" scoped>
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
        z-index: vars.$zIndex-floating;
    }

    &__loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--scale-4r);
        padding: var(--scale-4r);
    }

    &__loading-text {
        color: var(--color-description);
    }
}
</style>
