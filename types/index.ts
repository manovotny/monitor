type Artist = {
    artistId: number;
    artistName: string;
    artistType: string;
};

type Artists = {
    artists: Artist[];
};

type User = {
    id: number;
    name: string;
};

export type {Artist, Artists, User};
