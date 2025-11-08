import { ref } from 'vue';

const userPhoto = ref<string | null>(null);

export const useUserPhoto = () => {
    const setUserPhoto = (photo: string | null) => {
        userPhoto.value = photo;
    };

    return {
        userPhoto,
        setUserPhoto,
    };
};
