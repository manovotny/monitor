import type {NextApiRequest, NextApiResponse} from 'next';
import ms from 'ms';
import {stringifyUrl} from 'query-string';

import type {Artist, ItunesArtist} from '../../../types';

type ApiResults = {
    results: ItunesArtist[];
};

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<NextApiResponse> => {
    const {term = ''} = request.query;

    if (!term.length) {
        response.status(400);
        response.json({error: 'No search `term` provided.'});

        return response;
    }

    const url = stringifyUrl({
        query: {
            attribute: 'artistTerm',
            entity: 'musicArtist',
            limit: 25,
            media: 'music',
            term,
        },
        url: 'https://itunes.apple.com/search',
    });
    const result = await fetch(url);

    if (!result.ok) {
        response.status(500);
        response.json({error: 'Error searching for artists.'});

        return response;
    }

    const data = (await result.json()) as ApiResults;
    const artists: Artist[] = [];

    for (const artist of data.results) {
        if (artist.artistType.toLowerCase() === 'artist') {
            artists.push({
                id: artist.artistId,
                name: artist.artistName,
                url: artist.artistLinkUrl,
            });
        }
    }

    response.setHeader('Cache-Control', `public, s-maxage=${ms('12h')}, stale-while-revalidate=${ms('11h')}`);
    response.status(200);
    response.json({
        artists,
    });

    return response;
};

export default handler;
