import useSWR from 'swr';

const useInvitations = () => {
  const apiRoute = `/api/branches/invitations`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useInvitations;
