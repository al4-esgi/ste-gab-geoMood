import Http from '@/libs/axios/ApiClient';
import type { CreateMoodPayload, GetMoodsResponse, Mood } from '@/types/Mood.type';

export const moodService = {
    async createMood(payload: CreateMoodPayload): Promise<Mood> {
        const formData = new FormData();

        formData.append('textContent', payload.textContent);
        formData.append('rating', payload.rating.toString());
        formData.append('email', payload.email);
        formData.append('location', JSON.stringify(payload.location));

        if (payload.picture) {
            formData.append('picture', payload.picture);
        }

        const response = await Http.post<Mood>('/moods', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    async getTodaysMoods(): Promise<GetMoodsResponse> {
        const response = await Http.get<GetMoodsResponse>('/moods');
        return response.data;
    },
};
