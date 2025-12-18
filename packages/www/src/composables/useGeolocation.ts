import { ref } from 'vue';

export interface GeolocationPosition {
    lat: number;
    lng: number;
}

const currentPosition = ref<GeolocationPosition | null>(null);
const isLoadingPosition = ref(false);
const geolocationError = ref<GeolocationPositionError | null>(null);

export const useGeolocation = () => {
    const getCurrentPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            isLoadingPosition.value = true;
            geolocationError.value = null;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos: GeolocationPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    currentPosition.value = pos;
                    isLoadingPosition.value = false;
                    resolve(pos);
                },
                (error) => {
                    geolocationError.value = error;
                    isLoadingPosition.value = false;
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                },
            );
        });
    };

    const watchPosition = (
        onSuccess: (position: GeolocationPosition) => void,
        onError?: (error: GeolocationPositionError) => void,
    ) => {
        if (!('geolocation' in navigator)) {
            return null;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos: GeolocationPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                currentPosition.value = pos;
                onSuccess(pos);
            },
            (error) => {
                geolocationError.value = error;
                if (onError) {
                    onError(error);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );

        return watchId;
    };

    const clearWatch = (watchId: number) => {
        navigator.geolocation.clearWatch(watchId);
    };

    return {
        currentPosition,
        isLoadingPosition,
        geolocationError,
        getCurrentPosition,
        watchPosition,
        clearWatch,
    };
};
