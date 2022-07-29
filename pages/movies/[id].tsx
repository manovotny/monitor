import type {GetServerSideProps} from 'next';
import type {ReactElement} from 'react';
import type {SWRResponse} from 'swr';
import useSWR from 'swr';
import Image from 'next/image';
import {useRouter} from 'next/router';

import Layout from '../../components/Layout';
import fetcher from '../../lib/fetcher';
import type {Movie} from '../../types';

type Props = {
    id: string;
};

const ArtistPage = ({id}: Props): ReactElement => {
    const router = useRouter();
    const {data}: SWRResponse = useSWR(() => (id.length ? `/api/movies/${id}` : undefined), fetcher);

    if (!data) return <p>{'Loading...'}</p>;

    const movie: Movie = data as Movie;

    return (
        <Layout title={movie.name}>
            <button onClick={router.back} type="button">
                {'⬅️ Back to search results'}
            </button>
            <p>{'Movie page'}</p>
            <ul>
                <li>
                    <Image alt={`${movie.name} artwork`} height={250} src={movie.artworkUrl} width={167} />
                </li>
                <li>{`Id: ${movie.id}`}</li>
                <li>{`Name: ${movie.name}`}</li>
                {movie.description && <li>{`Description: ${movie.description}`}</li>}
                {movie.duration && <li>{`Duration: ${movie.duration}`}</li>}
                <li>{`Release Date: ${new Date(movie.releaseDate).toLocaleDateString()}`}</li>
                <li>{`Price: ${movie.price}`}</li>
                <li>{`Rating: ${movie.rating}`}</li>
                <li>{`Bundle: ${String(movie.bundle)}`}</li>
                <li>
                    {'Url: '}
                    <a href={movie.url} rel="noreferrer" target="_blank">
                        {movie.url}
                    </a>
                </li>
            </ul>
        </Layout>
    );
};

export default ArtistPage;

// eslint-disable-next-line  @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => ({
    props: {
        id: context.query.id,
    },
});
