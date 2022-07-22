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

type Movie = {
    artworkUrl: string;
    bundle: boolean;
    description?: string;
    duration?: string;
    id: number;
    name: string;
    price: number;
    rating: string;
    releaseDate: Date;
    url: string;
};

type ItunesMovie = {
    artworkUrl100: string;
    collectionId?: number;
    collectionName?: string;
    collectionHdPrice?: number;
    collectionViewUrl?: string;
    contentAdvisoryRating: string;
    longDescription: string;
    releaseDate: Date;
    trackId: number;
    trackName: string;
    trackHdPrice: number;
    trackTimeMillis: number;
    trackViewUrl: string;
};

type ItunesMovieBundle = {
    artworkUrl100: string;
    collectionId: number;
    collectionName: string;
    collectionHdPrice: number;
    collectionViewUrl: string;
    contentAdvisoryRating: string;
    releaseDate: Date;
};

type User = {
    id: number;
    name: string;
};

export type {Album, Artist, ItunesAlbum, ItunesArtist, ItunesMovie, ItunesMovieBundle, Movie, User};
