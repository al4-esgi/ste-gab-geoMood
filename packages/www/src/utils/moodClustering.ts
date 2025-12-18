import type { Mood } from '@/types/Mood.type';

const PROXIMITY_THRESHOLD = 0.0001; // ~11 meters

export const groupMoodsByLocation = (moods: Mood[]): Mood[][] => {
    const groups: Mood[][] = [];

    moods.forEach((mood) => {
        let addedToGroup = false;

        for (const group of groups) {
            const firstMood = group[0];
            const latDiff = Math.abs(mood.location.lat - firstMood.location.lat);
            const lngDiff = Math.abs(mood.location.lng - firstMood.location.lng);

            if (latDiff < PROXIMITY_THRESHOLD && lngDiff < PROXIMITY_THRESHOLD) {
                group.push(mood);
                addedToGroup = true;
                break;
            }
        }

        if (!addedToGroup) {
            groups.push([mood]);
        }
    });

    return groups;
};

export const calculateGroupCenter = (
    group: Mood[],
): { lat: number; lng: number } => {
    const avgLat =
        group.reduce((sum, m) => sum + m.location.lat, 0) / group.length;
    const avgLng =
        group.reduce((sum, m) => sum + m.location.lng, 0) / group.length;
    return { lat: avgLat, lng: avgLng };
};
