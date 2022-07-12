import type {GetServerSideProps} from 'next';
import type {ReactElement} from 'react';
import type {SWRResponse} from 'swr';
import useSWR from 'swr';
import Image from 'next/image';
import {useRouter} from 'next/router';

import Layout from '../../components/Layout';
import fetcher from '../../lib/fetcher';
import type {Album, Artist} from '../../types';

type Props = {
    id: string;
};

const ArtistPage = ({id}: Props): ReactElement => {
    const router = useRouter();
    const {data}: SWRResponse = useSWR(() => (id.length ? `/api/artists/${id}` : undefined), fetcher);

    if (!data) return <p>{'Loading...'}</p>;

    const artist: Artist = data as Artist;

    return (
        <Layout title={artist.name}>
            <button onClick={router.back} type="button">
                {'⬅️ Back to search results'}
            </button>
            <p>{'Artist page'}</p>
            <ul>
                <li>{`Id: ${artist.id}`}</li>
                <li>{`Name: ${artist.name}`}</li>
                <li>
                    {'Url: '}
                    <a href={artist.url} rel="noreferrer" target="_blank">
                        {artist.url}
                    </a>
                </li>
                <li>
                    {'Albums: '}
                    {!artist.albums || !artist.albums.length ? (
                        <span>{'None'}</span>
                    ) : (
                        <ul>
                            {artist.albums.map((album: Album) => (
                                <li key={album.id}>
                                    <p>{album.name}</p>
                                    <Image
                                        alt={`${album.name} artwork`}
                                        height={100}
                                        src={album.artworkUrl}
                                        width={100}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
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
