const api = async (url, options = {}) => {
  const { body, headers, ...opts } = options;
  const requestBody = body ? JSON.stringify(body) : undefined;
  const response = await fetch(url, {
    body: requestBody,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...opts,
  });
  const result = await response.json();
  return { status: response.status, ...result, url };
};

export default api;
