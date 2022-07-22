import type {NextApiRequest, NextApiResponse} from 'next';
import ms from 'ms';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<NextApiResponse> => {
    const id = request.query.id;
    const results = await fetch(`https://music.apple.com/us/artist/${id}`);

    if (!results.ok) {
        response.status(500);
        response.json({error: 'Error getting artist artwork.'});

        return response;
    }

    const html = await results.text();
    const artworkUrl = html
        .match(/<meta property=\"og:image\" content=\"(.*png)\"/)[1]
        ?.replace(/[\d]+x[\d]+cw.png/, '220x220bb.jpg');

    response.setHeader('Cache-Control', `public, s-maxage=${ms('30d')}, stale-while-revalidate=${ms('29d')}`);
    response.status(200);
    response.json({
        artworkUrl,
    });
    return response;
};

export default handler;
