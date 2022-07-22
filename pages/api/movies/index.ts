import type {NextApiRequest, NextApiResponse} from 'next';
import ms from 'ms';
import {stringifyUrl} from 'query-string';

import type {Movie, ItunesMovie, ItunesMovieBundle} from '../../../types';

type ApiMovieResults = {
    results: ItunesMovie[];
};

type ApiMovieBundleResults = {
    results: ItunesMovieBundle[];
};

const modifyArtworkUrl = (url: string): string => url.replace(/\d+x\d+bb.jpg/u, '300x300bb.jpg');

const search = async (term: string[] | string): Promise<ItunesMovie[]> => {
    const searchUrl = stringifyUrl({
        query: {
            attribute: 'movieTerm',
            entity: 'movie',
            limit: 25,
            media: 'movie',
            term,
        },
        url: 'https://itunes.apple.com/search',
    });
    const searchResults = await fetch(searchUrl);
    const searchData = (await searchResults.json()) as ApiMovieResults;

    return searchData.results;
};

const lookup = async (bundleId: string): Promise<ItunesMovieBundle | undefined> => {
    const lookupUrl = stringifyUrl({
        query: {
            entity: 'movie',
            id: bundleId,
        },
        url: 'https://itunes.apple.com/lookup',
    });
    const lookupResults = await fetch(lookupUrl);
    const lookupData = (await lookupResults.json()) as ApiMovieBundleResults;

    // The bundle is always the first result.
    return lookupData.results[0];
};

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<NextApiResponse> => {
    const {term = ''} = request.query;

    if (!term.length) {
        response.status(400);
        response.json({error: 'No `term` provided.'});

        return response;
    }

    const movies: Movie[] = [];
    const bundleIds: Record<number, number> = {};
    const searchData = await search(term);

    searchData.forEach((movie, index) => {
        if (movie.collectionId && !Object.hasOwn(bundleIds, movie.collectionId)) {
            bundleIds[movie.collectionId] = index;
        }

        movies.push({
            artworkUrl: modifyArtworkUrl(movie.artworkUrl100),
            bundle: false,
            description: movie.longDescription,
            duration: ms(movie.trackTimeMillis, {long: true}),
            id: movie.trackId,
            name: movie.trackName,
            price: movie.trackHdPrice,
            rating: movie.contentAdvisoryRating,
            releaseDate: movie.releaseDate,
            url: movie.trackViewUrl,
        });
    });

    const lookupPromises = [];

    for (const bundleId of Object.keys(bundleIds)) {
        lookupPromises.push(lookup(bundleId));
    }

    const lookupData = await Promise.all(lookupPromises);

    lookupData.forEach((bundle) => {
        if (bundle) {
            const insertIndex = bundleIds[bundle.collectionId] ?? 0;

            movies.splice(insertIndex, 0, {
                artworkUrl: modifyArtworkUrl(bundle.artworkUrl100),
                bundle: true,
                id: bundle.collectionId,
                name: bundle.collectionName,
                price: bundle.collectionHdPrice,
                rating: bundle.contentAdvisoryRating,
                releaseDate: bundle.releaseDate,
                url: bundle.collectionViewUrl,
            });
        }
    });

    response.setHeader('Cache-Control', `public, s-maxage=${ms('12h')}, stale-while-revalidate=${ms('11h')}`);
    response.status(200);
    response.json({
        movies,
    });

    return response;
};

export default handler;
