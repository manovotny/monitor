const fetcher = async (url: string, init?: RequestInit): Promise<JSON> => {
    const response = await fetch(url, init);

    return response.json() as Promise<JSON>;
};

export default fetcher;
