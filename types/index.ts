type Album = {
    artworkUrl: string;
    id: number;
    name: string;
    releaseDate: Date;
    url: string;
};

type ItunesAlbum = {
    artworkUrl100: string;
    collectionId: number;
    collectionName: string;
    collectionViewUrl: string;
    releaseDate: Date;
};

type Artist = {
    id: number;
    name: string;
    url: string;
    albums?: Album[];
};

type ItunesArtist = {
    artistId: number;
    artistName: string;
    artistLinkUrl: string;
    artistType: string;
};

type User = {
    id: number;
    name: string;
};

export type {Album, Artist, ItunesAlbum, ItunesArtist, User};
