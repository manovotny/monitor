import type {NextApiRequest, NextApiResponse} from 'next';
import {stringifyUrl} from 'query-string';
import ms from 'ms';

import type {Artist} from '../../../types';

type iTunesSearchApiResults = {
    results: Artist[];
};

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<NextApiResponse> => {
    const url = stringifyUrl({
        query: {
            attribute: 'artistTerm',
            entity: 'musicArtist',
            limit: 25,
            media: 'music',
            term: request.query.term,
        },
        url: 'https://itunes.apple.com/search',
    });
    const result = await fetch(url);

    if (!result.ok) {
        response.status(500);
        response.json({error: 'Error searching.'});

        return response;
    }

    const data = (await result.json()) as iTunesSearchApiResults;

    response.setHeader('Cache-Control', `public, s-maxage=${ms('12h')}, stale-while-revalidate=${ms('11h')}`);
    response.status(200);
    response.json({
        artists: data.results.filter(({artistType}: Artist) => artistType.toLowerCase() === 'artist'),
    });

    return response;
};

export default handler;
