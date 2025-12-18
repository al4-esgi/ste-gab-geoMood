import L from 'leaflet';
import type { Mood } from '@/types/Mood.type';

export const createUserMarkerIcon = (
    photo?: string | null,
    isCurrentUser = true,
) => {
    if (!photo) return undefined;

    const borderColor = isCurrentUser ? 'var(--color-primary)' : '#6c757d';
    return L.divIcon({
        html: `<div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid ${borderColor}; background: white;">
            <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>`,
        className: '',
        iconSize: [80, 80],
        iconAnchor: [40, 40],
    });
};

const getMoodEmoji = (rating: number): string => {
    const ratingRounded = Math.round(rating);
    return ['😢', '😕', '😐', '🙂', '😄'][ratingRounded - 1] || '😐';
};

export const createMoodMarkerIcon = (mood: Mood) => {
    const emoji = getMoodEmoji(mood.rating);

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

export const createClusterIcon = (moodCount: number) => {
    return L.divIcon({
        html: `<div style="width: 70px; height: 70px; border-radius: 50%; background: var(--color-primary); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: white;">
            ${moodCount}
        </div>`,
        className: '',
        iconSize: [70, 70],
        iconAnchor: [35, 35],
    });
};

export const createSingleMoodPopup = (mood: Mood): string => {
    const emoji = getMoodEmoji(mood.rating);
    return `
        <div style="padding: 8px; min-width: 200px;">
            ${
                mood.picture
                    ? `<img src="${mood.picture}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
                    : ''
            }
            <p style="margin: 0 0 8px 0; font-weight: 600;">
                ${emoji} Note: ${mood.rating.toFixed(2)}/5
            </p>
            <p style="margin: 0 0 8px 0;">${mood.textContent}</p>
            <p style="margin: 0; color: #666; font-size: 12px;">
                ${new Date(mood.createdAt).toLocaleString('fr-FR')}
            </p>
        </div>
    `;
};

export const createMultiMoodPopup = (moodsGroup: Mood[]): string => {
    const moodItems = moodsGroup
        .map((mood) => {
            const emoji = getMoodEmoji(mood.rating);
            const picture = mood.picture
                ? `<img src="${mood.picture}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 12px;" />`
                : `<div style="width: 50px; height: 50px; border-radius: 8px; background: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-right: 12px;">${emoji}</div>`;

            return `
                <div style="display: flex; padding: 12px; border-bottom: 1px solid #eee; gap: 8px;">
                    ${picture}
                    <div style="flex: 1;">
                        <p style="margin: 0 0 4px 0; font-weight: 600;">
                            ${emoji} Note: ${mood.rating.toFixed(2)}/5
                        </p>
                        <p style="margin: 0 0 4px 0; font-size: 14px;">${mood.textContent}</p>
                        <p style="margin: 0; color: #666; font-size: 11px;">
                            ${new Date(mood.createdAt).toLocaleString('fr-FR')}
                        </p>
                    </div>
                </div>
            `;
        })
        .join('');

    return `
        <div style="max-width: 320px; max-height: 400px; overflow-y: auto;">
            <div style="padding: 8px 12px; background: var(--color-primary); color: white; font-weight: 600; position: sticky; top: 0; z-index: 1;">
                ${moodsGroup.length} mood${moodsGroup.length > 1 ? 's' : ''} à cet endroit
            </div>
            ${moodItems}
        </div>
    `;
};
