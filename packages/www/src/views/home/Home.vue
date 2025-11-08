<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { t } = useI18n();
const mapContainer = ref<HTMLElement | null>(null);
const isLoadingLocation = ref(true);
let mapInstance: L.Map | null = null;
let currentMarker: L.Marker | null = null;
let hasUserLocation = false;

const updateMapLocation = (lat: number, lng: number, isUserLocation = false) => {
    if (!mapInstance) return;

    mapInstance.setView([lat, lng], 13);

    if (currentMarker) {
        currentMarker.remove();
    }

    currentMarker = L.marker([lat, lng]).addTo(mapInstance);
    currentMarker.bindPopup(`<b>${t('map.yourLocation')}</b>`).openPopup();

    hasUserLocation = isUserLocation;
    isLoadingLocation.value = false;
};

const initMap = (lat: number, lng: number, isUserLocation = false) => {
    if (!mapContainer.value) return;

    mapInstance = L.map(mapContainer.value).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(mapInstance);

    currentMarker = L.marker([lat, lng]).addTo(mapInstance);
    currentMarker.bindPopup(`<b>${t('map.yourLocation')}</b>`).openPopup();

    hasUserLocation = isUserLocation;
    isLoadingLocation.value = false;
};

const requestGeolocation = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapInstance && !hasUserLocation) {
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
                if (!mapInstance) {
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
        if (!mapInstance) {
            initMap(48.8566, 2.3522, false);
        }
    }
};

const initPermissionWatcher = async () => {
    if ('permissions' in navigator) {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            permission.addEventListener('change', () => {
                if (permission.state === 'granted' && !hasUserLocation) {
                    isLoadingLocation.value = true;
                    requestGeolocation();
                } else if (permission.state === 'denied' && hasUserLocation) {
                    hasUserLocation = false;
                    toast.error(t('map.geolocationDenied'));
                    if (mapInstance && currentMarker) {
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
    if (!mapContainer.value) return;

    requestGeolocation();
    initPermissionWatcher();
});

onUnmounted(() => {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
});
</script>

<template>
    <div class="home-map">
        <div v-if="isLoadingLocation" class="home-map__loading">
            <div class="home-map__spinner" />
            <p class="home-map__loading-text">{{ t('map.loading') }}</p>
        </div>
        <div ref="mapContainer" class="home-map__container" />
    </div>
</template>

<style lang="scss" scoped>
.home-map {
    width: 100%;
    height: 100vh;
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
        z-index: 1000;
        text-align: center;
        background: rgba(255, 255, 255, 0.9);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &__loading-text {
        margin-top: 1rem;
        color: #333;
        font-size: 1rem;
    }

    &__spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: home-map-spin 1s linear infinite;
        margin: 0 auto;
    }
}

@keyframes home-map-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

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
