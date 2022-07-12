import type {ReactElement} from 'react';
import {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import type {SWRResponse} from 'swr';
import useSWR from 'swr';
import Link from 'next/link';
import {useRouter} from 'next/router';
import type {GetServerSideProps} from 'next';

import Layout from '../components/Layout';
import type {Artist} from '../types';
import fetcher from '../lib/fetcher';

type ApiResults = {
    artists?: Artist[];
};

type Props = {
    defaultTerm: string;
};

const SearchPage = ({defaultTerm}: Props): ReactElement => {
    const router = useRouter();
    const [inputText, setText] = useState(defaultTerm);
    const [term] = useDebounce(inputText, 500);
    const [artists, setArtists] = useState<Artist[]>([]);
    const {data}: SWRResponse = useSWR(() => (term.length ? `/api/artists?term=${term}` : undefined), fetcher);

    useEffect(() => {
        setArtists((data as ApiResults | undefined)?.artists ?? []);
    }, [data]);

    useEffect(() => {
        if (term.length) {
            router.push(
                {
                    pathname: '/search',
                    query: {term},
                },
                undefined,
                {shallow: true}
            );
        }
    }, [term]);

    return (
        <Layout title="Search">
            <input
                onChange={(event): void => {
                    setText(event.target.value);
                    setArtists([]);
                }}
                value={inputText}
            />
            <p>{`Actual value: ${inputText}`}</p>
            <p>{`Debounce value: ${term}`}</p>
            <p>{`Count: ${artists.length}`}</p>
            {artists.length > 0 && (
                <ul>
                    {artists.map(({id, name}) => (
                        <li key={id}>
                            <Link as={`/artists/${id}`} href="/artists/[id]">
                                <a>{name}</a>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </Layout>
    );
};

export default SearchPage;

// eslint-disable-next-line  @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => ({
    props: {
        defaultTerm: context.query.term ?? '',
    },
});
