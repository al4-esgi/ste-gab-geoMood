<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
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
import type { Mood } from '@/types/Mood.type';

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

    const icon = createMarkerIcon(userPhoto.value);
    const markerOptions = icon ? { icon } : {};

    currentMarker.value = L.marker([lat, lng], markerOptions).addTo(
        mapInstance.value as L.Map,
    );

    hasUserLocation.value = isUserLocation;
};

const createMarkerIcon = (photo?: string | null, isCurrentUser = true) => {
    if (photo) {
        const borderColor = isCurrentUser ? 'var(--color-primary)' : '#6c757d';
        return L.divIcon({
            html: `<div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid ${borderColor}; background: white;">
                <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>`,
            className: '',
            iconSize: [80, 80],
            iconAnchor: [40, 40],
        });
    }
    return undefined;
};

const createMoodMarkerIcon = (mood: Mood) => {
    const rating = Math.round(mood.rating);
    const emoji = ['😢', '😕', '😐', '🙂', '😄'][rating - 1] || '😐';

    if (mood.picture) {
        return L.divIcon({
            html: `<div style="position: relative; width: 80px; height: 80px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid var(--color-primary); background: white;">
                    <img src="${mood.picture}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div style="position: absolute; bottom: -10px; right: -10px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid var(--color-primary); font-size: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                    ${emoji}
                </div>
            </div>`,
            className: '',
            iconSize: [80, 80],
            iconAnchor: [40, 40],
        });
    }

    return L.divIcon({
        html: `<div style="position: relative; width: 70px; height: 70px;">
            <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--color-primary); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 32px;">
                ${emoji}
            </div>
        </div>`,
        className: '',
        iconSize: [70, 70],
        iconAnchor: [35, 35],
    });
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

    moods.value.moods.forEach((mood: Mood) => {
        const icon = createMoodMarkerIcon(mood);
        const marker = L.marker([mood.location.lat, mood.location.lng], {
            icon,
        });

        const ratingRounded = Math.round(mood.rating);
        const emoji = ['😢', '😕', '😐', '🙂', '😄'][ratingRounded - 1] || '😐';

        const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
                <p style="margin: 0 0 8px 0; font-weight: 600;">
                    ${emoji} Note: ${mood.rating.toFixed(2)}/5
                </p>
                <p style="margin: 0 0 8px 0;">${mood.textContent}</p>
                <p style="margin: 0; color: #666; font-size: 12px;">
                    ${new Date(mood.createdAt).toLocaleString('fr-FR')}
                </p>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapInstance.value as L.Map);
        moodMarkers.value.push(marker);
    });
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
