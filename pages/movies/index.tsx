import type {ReactElement} from 'react';
import {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import type {SWRResponse} from 'swr';
import useSWR from 'swr';
import Link from 'next/link';
import {useRouter} from 'next/router';
import Image from 'next/image';
import type {GetServerSideProps} from 'next';

import Layout from '../../components/Layout';
import type {Movie} from '../../types';
import fetcher from '../../lib/fetcher';

type ApiResults = {
    movies?: Movie[];
};

type Props = {
    defaultTerm: string;
};

const MoviesPage = ({defaultTerm}: Props): ReactElement => {
    const router = useRouter();
    const [inputText, setText] = useState(defaultTerm);
    const [term] = useDebounce(inputText, 500);
    const [movies, setMovies] = useState<Movie[]>([]);
    const {data}: SWRResponse = useSWR(() => (term.length ? `/api/movies?term=${term}` : undefined), fetcher);

    useEffect(() => {
        setMovies((data as ApiResults | undefined)?.movies ?? []);
    }, [data]);

    useEffect(() => {
        if (term.length) {
            router.push(
                {
                    pathname: '/movies',
                    query: {term},
                },
                undefined,
                {shallow: true}
            );
        }
    }, [term]);

    return (
        <Layout title="Movies">
            <input
                onChange={(event): void => {
                    setText(event.target.value);
                    setMovies([]);
                }}
                value={inputText}
            />
            <p>{`Actual value: ${inputText}`}</p>
            <p>{`Debounce value: ${term}`}</p>
            <p>{`Count: ${movies.length}`}</p>
            {movies.length > 0 && (
                <ul>
                    {movies.map(({artworkUrl, bundle, id, name}) => (
                        <li key={id}>
                            <Link as={`/movies/${id}`} href="/movies/[id]">
                                <a>
                                    <Image alt={`${name} artwork`} height={250} src={artworkUrl} width={167} />
                                    <p>{`${name}${bundle ? ' [BUNDLE]' : ''}`}</p>
                                </a>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </Layout>
    );
};

export default MoviesPage;

// eslint-disable-next-line  @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => ({
    props: {
        defaultTerm: context.query.term ?? '',
    },
});
