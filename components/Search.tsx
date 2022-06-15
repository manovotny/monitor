import {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import {stringifyUrl} from 'query-string';
import type {SWRResponse} from 'swr';
import type {ReactElement} from 'react';
import useSWR from 'swr';

import fetcher from '../lib/fetcher';

type Artist = {
    artistId: number;
    artistName: string;
    artistType: string;
};

type Artists = {
    results: Artist[];
};

const Search = (): ReactElement => {
    const [inputText, setText] = useState('');
    const [term] = useDebounce(inputText, 500);
    const [artists, setArtists] = useState<Artist[]>([]);
    const {data}: SWRResponse = useSWR(
        () =>
            term.length
                ? stringifyUrl({
                      query: {
                          attribute: 'artistTerm',
                          entity: 'musicArtist',
                          limit: 25,
                          media: 'music',
                          term,
                      },
                      url: 'https://itunes.apple.com/search',
                  })
                : undefined,
        fetcher
    );

    useEffect(() => {
        const results = data ? (data as Artists).results : [];

        if (results.length) {
            setArtists(results.filter(({artistType}: Artist) => artistType.toLowerCase() === 'artist'));
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
            <p>{`Results: ${artists.length}`}</p>
            {artists.length && (
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
