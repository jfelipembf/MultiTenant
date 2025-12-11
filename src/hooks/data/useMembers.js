import useSWR from 'swr';

const useMembers = (slug) => {
  const apiRoute = `/api/branch/${slug}/members`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useMembers;
