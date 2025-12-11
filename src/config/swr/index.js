import fetcher from '@/lib/client/fetcher';

const handleOnError = (error) => {
  console.error('SWR Error:', error);
};

const swrConfig = () => ({
  fetcher,
  onError: handleOnError,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  // refreshInterval removido - dados atualizam ao focar a aba ou manualmente
});

export default swrConfig;
