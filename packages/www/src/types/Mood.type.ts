export interface Location {
    lat: number;
    lng: number;
}

export interface CreateMoodPayload {
    textContent: string;
    rating: number;
    picture?: File;
    location: Location;
    email: string;
}

export interface Mood {
    textContent: string;
    rating: number;
    picture?: string;
    location: Location;
    createdAt: string;
    updatedAt: string;
}

export interface GetMoodsResponse {
    moods: Mood[];
}
