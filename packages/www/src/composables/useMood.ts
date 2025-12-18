import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { moodService } from '@/services/mood.service';
import type { CreateMoodPayload } from '@/types/Mood.type';

export const useMood = () => {
    const queryClient = useQueryClient();

    const { data: moodsData, isLoading, error, refetch } = useQuery({
        queryKey: ['moods'],
        queryFn: () => moodService.getTodaysMoods(),
        refetchInterval: 30000,
    });

    const createMoodMutation = useMutation({
        mutationFn: (payload: CreateMoodPayload) => moodService.createMood(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moods'] });
        },
    });

    return {
        moods: moodsData,
        isLoading,
        error,
        refetch,
        createMood: createMoodMutation.mutateAsync,
        isCreating: createMoodMutation.isPending,
        createError: createMoodMutation.error,
    };
};
