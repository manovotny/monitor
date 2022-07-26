import type {NextApiRequest, NextApiResponse} from 'next';
import ms from 'ms';
import {stringifyUrl} from 'query-string';

import type {Movie, ItunesMovie} from '../../../../types';

type ApiMovieResults = {
    resultCount: number;
    results: ItunesMovie[];
};

const modifyArtworkUrl = (url: string): string => url.replace(/\d+x\d+bb.jpg/u, '300x300bb.jpg');

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<NextApiResponse> => {
    const {id = ''} = request.query;

    if (!id.length) {
        response.status(400);
        response.json({error: 'No `id` provided.'});

        return response;
    }

    const lookupUrl = stringifyUrl({
        query: {
            entity: 'movie',
            id,
        },
        url: 'https://itunes.apple.com/lookup',
    });
    const lookupResults = await fetch(lookupUrl);
    const lookupData = (await lookupResults.json()) as ApiMovieResults;
    const isBundle = lookupData.resultCount > 1;
    const itunesMovie = lookupData.results[0];

    if (!itunesMovie) {
        response.status(404);
        response.json({error: 'Movie `id` not found.'});

        return response;
    }

    const movie: Movie = {
        artworkUrl: modifyArtworkUrl(itunesMovie.artworkUrl100),
        bundle: isBundle,
        id: isBundle && itunesMovie.collectionId ? itunesMovie.collectionId : itunesMovie.trackId,
        name: isBundle && itunesMovie.collectionName ? itunesMovie.collectionName : itunesMovie.trackName,
        price: isBundle && itunesMovie.collectionHdPrice ? itunesMovie.collectionHdPrice : itunesMovie.trackHdPrice,
        rating: itunesMovie.contentAdvisoryRating,
        releaseDate: itunesMovie.releaseDate,
        url: isBundle && itunesMovie.collectionViewUrl ? itunesMovie.collectionViewUrl : itunesMovie.trackViewUrl,
    };

    if (!isBundle) {
        movie.duration = ms(itunesMovie.trackTimeMillis, {long: true});
        movie.description = itunesMovie.longDescription;
    }

    response.setHeader('Cache-Control', `public, s-maxage=${ms('12h')}, stale-while-revalidate=${ms('11h')}`);
    response.status(200);
    response.json(movie);

    return response;
};

export default handler;
