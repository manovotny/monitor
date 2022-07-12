import type {ReactElement} from 'react';

import Layout from '../components/Layout';

import {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import type {SWRResponse} from 'swr';
import type {ReactElement} from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {useRouter} from 'next/router';

import type {Artist} from '../types';
import fetcher from '../lib/fetcher';

type ApiResults = {
    artists?: Artist[];
};

const SearchPage = (): ReactElement => {
    const router = useRouter();
    const [inputText, setText] = useState('');
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
