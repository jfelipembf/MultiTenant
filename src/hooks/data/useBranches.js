import useSWR from 'swr';

// Fetcher com logs de performance
const fetcherWithLogs = async (url) => {
    const start = Date.now();
    console.log(`[PERF] Iniciando fetch: ${url}`);

    const res = await fetch(url);
    const json = await res.json();

    const duration = Date.now() - start;
    console.log(`[PERF] Fetch completo: ${url} - ${duration}ms`);
    console.log(`[PERF] Branches retornadas: ${json?.data?.branches?.length || 0}`);

    return json;
};

const useBranches = () => {
    const apiRoute = `/api/branches`;
    const { data, error } = useSWR(apiRoute, fetcherWithLogs);
    return {
        ...data,
        isLoading: !error && !data,
        isError: error,
    };
};

export default useBranches;
