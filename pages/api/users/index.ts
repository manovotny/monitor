import type {NextApiRequest, NextApiResponse} from 'next';

import {sampleUserData} from '../../../utils/sample-data';

const handler = (_req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!Array.isArray(sampleUserData)) {
            throw new TypeError('Cannot find user data');
        }

        res.status(200).json(sampleUserData);
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : '`getStaticProps` error',
            statusCode: 500,
        });
    }
};

export default handler;
