<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import Card from 'primevue/card';
import Button from 'primevue/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useUserPhoto } from '@/composables/useUserPhoto';
import { useGeolocation } from '@/composables/useGeolocation';
import { useMood } from '@/composables/useMood';
import { groupMoodsByLocation, calculateGroupCenter } from '@/utils/moodClustering';
import {
    createUserMarkerIcon,
    createMoodMarkerIcon,
    createClusterIcon,
    createSingleMoodPopup,
    createMultiMoodPopup,
} from '@/utils/mapIcons';

const { t } = useI18n();
const { userPhoto } = useUserPhoto();
const { getCurrentPosition, isLoadingPosition, geolocationError } =
    useGeolocation();
const { moods, refetch: refetchMoods } = useMood();
const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<L.Map | null>(null);
const currentMarker = ref<L.Marker | null>(null);
const moodMarkers = ref<L.Marker[]>([]);
const hasUserLocation = ref(false);
const userPosition = ref<{ lat: number; lng: number } | null>(null);

onMounted(() => {
    if (!mapContainer.value) {
        return;
    }

    requestGeolocation();
    initPermissionWatcher();

    if (moods.value?.moods) {
        displayMoodMarkers();
    }
});

onUnmounted(() => {
    clearMoodMarkers();
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

    const icon = createUserMarkerIcon(userPhoto.value);
    const markerOptions = icon ? { icon } : {};

    currentMarker.value = L.marker([lat, lng], markerOptions).addTo(
        mapInstance.value as L.Map,
    );

    hasUserLocation.value = isUserLocation;
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

    const icon = createUserMarkerIcon(userPhoto.value);
    const markerOptions = icon ? { icon } : {};

    currentMarker.value = L.marker([lat, lng], markerOptions).addTo(
        mapInstance.value as L.Map,
    );

    hasUserLocation.value = isUserLocation;
};

const requestGeolocation = async () => {
    try {
        const position = await getCurrentPosition();
        userPosition.value = position;

        if (mapInstance.value) {
            updateMapLocation(position.lat, position.lng, true);
        } else {
            initMap(position.lat, position.lng, true);
        }

        await refetchMoods();
        if (moods.value?.moods) {
            displayMoodMarkers();
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Geolocation not supported') {
                toast.error(t('map.geolocationNotSupported'));
            } else {
                toast.error(t('map.geolocationError'));
            }
        } else if (geolocationError.value) {
            if (
                geolocationError.value.code ===
                geolocationError.value.PERMISSION_DENIED
            ) {
                toast.error(t('map.geolocationDenied'));
            } else {
                toast.error(t('map.geolocationError'));
            }
        }

        if (!mapInstance.value) {
            initMap(48.8566, 2.3522, false);
        }
    }
};

const recenterMap = () => {
    if (!userPosition.value || !mapInstance.value) {
        toast.warning(t('map.noUserLocation'));
        return;
    }

    mapInstance.value.setView(
        [userPosition.value.lat, userPosition.value.lng],
        13,
    );
    toast.success(t('map.recentered'));
};

const initPermissionWatcher = async () => {
    if ('permissions' in navigator) {
        try {
            const permission = await navigator.permissions.query({
                name: 'geolocation',
            });
            permission.addEventListener('change', () => {
                if (permission.state === 'granted' && !hasUserLocation.value) {
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

const clearMoodMarkers = () => {
    moodMarkers.value.forEach((marker) => marker.remove());
    moodMarkers.value = [];
};

const displayMoodMarkers = () => {
    if (!mapInstance.value || !moods.value?.moods) return;

    clearMoodMarkers();

    const moodGroups = groupMoodsByLocation(moods.value.moods);

    moodGroups.forEach((group) => {
        const { lat, lng } = calculateGroupCenter(group);

        let icon;
        let popupContent;

        if (group.length === 1) {
            icon = createMoodMarkerIcon(group[0]);
            popupContent = createSingleMoodPopup(group[0]);
        } else {
            icon = createClusterIcon(group.length);
            popupContent = createMultiMoodPopup(group);
        }

        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(popupContent, { maxWidth: 350 });
        marker.addTo(mapInstance.value as L.Map);
        moodMarkers.value.push(marker);
    });
};

watch(userPhoto, (newPhoto) => {
    if (currentMarker.value && mapInstance.value) {
        const position = currentMarker.value.getLatLng();
        currentMarker.value.remove();

        const icon = createUserMarkerIcon(newPhoto);
        const markerOptions = icon ? { icon } : {};

        currentMarker.value = L.marker(position, markerOptions).addTo(
            mapInstance.value as L.Map,
        );
    }
});

watch(
    () => moods.value?.moods,
    () => {
        displayMoodMarkers();
    },
    { deep: true },
);
</script>

<template>
    <div class="map-view">
        <Card v-if="isLoadingPosition" class="map-view__loading">
            <template #content>
                <div class="map-view__loading-content">
                    <LoadingSpinner />
                    <p class="map-view__loading-text">{{ t('map.loading') }}</p>
                </div>
            </template>
        </Card>

        <Button
            v-if="userPosition"
            class="map-view__recenter-btn"
            icon="pi pi-compass"
            rounded
            @click="recenterMap"
            :title="t('map.recenter')"
        />

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
            "geolocationNotSupported": "Géolocalisation non supportée par votre navigateur",
            "recenter": "Recentrer sur ma position",
            "noUserLocation": "Position utilisateur non disponible",
            "recentered": "Carte recentrée sur votre position"
        }
    }
}
</i18n>

<style lang="scss" scoped>
@use '@/libs/sass/vars';

.map-view {
    width: 100%;
    height: 100%;
    position: relative;

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

    &__recenter-btn {
        position: fixed !important;
        top: var(--scale-8r) !important;
        right: var(--scale-8r) !important;
        z-index: 500 !important;
    }
}
</style>
