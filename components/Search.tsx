import {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';
import {stringifyUrl} from 'query-string';
import type {SWRResponse} from 'swr';
import type {ReactElement} from 'react';
import useSWR from 'swr';

type Artist = {
    artistId: number;
    artistName: string;
    artistType: string;
};

const fetcher = async (url: string, init?: RequestInit): Promise<JSON> => {
    const response = await fetch(url, init);

    return response.json();
};
const Search = (): ReactElement => {
    const [inputText, setText] = useState('');
    const [term] = useDebounce(inputText, 500);
    const [results, setResults] = useState<Artist[]>([]);
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
        if (data?.results.length) {
            setResults(data.results.filter(({artistType}: Artist) => artistType.toLowerCase() === 'artist'));
        }
    }, [data]);

    return (
        <>
            <input
                onChange={(e): void => {
                    setText(e.target.value);
                    setResults([]);
                }}
                value={inputText}
            />
            <p>{`Actual value: ${inputText}`}</p>
            <p>{`Debounce value: ${term}`}</p>
            <p>{`Results: ${results.length}`}</p>
            {results.length && (
                <ul>
                    {results.map(({artistId, artistName}) => (
                        <li key={artistId}>{artistName}</li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default Search;
