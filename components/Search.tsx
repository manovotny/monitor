import {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import type {SWRResponse} from 'swr';
import type {ReactElement} from 'react';
import useSWR from 'swr';

import type {Artist, Artists} from '../types';
import fetcher from '../lib/fetcher';

const Search = (): ReactElement => {
    const [inputText, setText] = useState('');
    const [term] = useDebounce(inputText, 500);
    const [artists, setArtists] = useState<Artist[]>([]);
    const {data}: SWRResponse = useSWR(() => (term.length ? `/api/search?term=${term}` : undefined), fetcher);

    useEffect(() => {
        const results = data ? (data as Artists).artists : [];

        if (results.length) {
            setArtists(results);
        }
    }, [data]);

    return (
        <>
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
                    {artists.map(({artistId, artistName}) => (
                        <li key={artistId}>{artistName}</li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default Search;
