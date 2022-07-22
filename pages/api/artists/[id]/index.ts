import type {NextApiRequest, NextApiResponse} from 'next';
import ms from 'ms';
import {stringifyUrl} from 'query-string';

import type {ItunesAlbum, ItunesArtist} from '../../../../types';

type ApiResults = {
    results: [ItunesArtist, ...ItunesAlbum[]];
};

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<NextApiResponse> => {
    const {id = ''} = request.query;

    if (!id.length) {
        response.status(400);
        response.json({error: 'No `id` provided.'});

        return response;
    }

    const url = stringifyUrl({
        query: {
            entity: 'album',
            id,
        },
        url: 'https://itunes.apple.com/lookup',
    });
    const result = await fetch(url);

    if (!result.ok) {
        response.status(500);
        response.json({error: 'Error getting artist albums.'});

        return response;
    }

    const data = (await result.json()) as ApiResults;
    const [artist, ...albums] = data.results;

    response.setHeader('Cache-Control', `public, s-maxage=${ms('12h')}, stale-while-revalidate=${ms('11h')}`);
    response.status(200);
    response.json({
        albums: albums.map((album: ItunesAlbum) => ({
            artworkUrl: album.artworkUrl100,
            id: album.collectionId,
            name: album.collectionName,
            releaseDate: album.releaseDate,
            url: album.collectionViewUrl,
        })),
        id,
        name: artist.artistName,
        url: artist.artistLinkUrl,
    });

    return response;
};

export default handler;
