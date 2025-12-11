import useSWR from 'swr';

const useBranches = () => {
    const apiRoute = `/api/branches`;
    const { data, error } = useSWR(`${apiRoute}`);
    return {
        ...data,
        isLoading: !error && !data,
        isError: error,
    };
};

export default useBranches;
