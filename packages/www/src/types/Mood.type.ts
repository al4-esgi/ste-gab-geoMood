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
    _id: string;
    textContent: string;
    rating: number;
    picture?: string;
    location: Location;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetMoodsResponse {
    moods: Mood[];
}
