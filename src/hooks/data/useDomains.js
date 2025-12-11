import useSWR from 'swr';

const useDomains = (slug) => {
  const apiRoute = `/api/branch/${slug}/domains`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useDomains;
