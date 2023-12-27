export const API_URL = 'http://movies-api';

// eslint-disable-next-line default-param-last
export function getAllMovies(page = 1, abortController) {
  if (!(page instanceof URLSearchParams || abortController instanceof AbortController)) {
    return Promise.reject(
      new Error('type(s) incorrect(s) pour getAllMovies'),
    );
  }
  const urlMovies = `${API_URL}/movies?${page.toString()}`;
  // eslint-disable-next-line no-use-before-define
  return fetch(urlMovies, { signal: abortController.signal }).then(extractCollectionAndPagination);
}

export function posterUrl(imagePath, size = 'original') {
  return `${API_URL}${imagePath}/${size}`;
}

export function extractPaginationFromHeaders(response) {
  return {
    current: parseInt(response.headers.get('Pagination-Current-Page'), 10),
    last: parseInt(response.headers.get('Pagination-Last-Page'), 10),
  };
}

export function extractCollectionAndPagination(response) {
  return response.json().then((collection) => ({
    pagination: extractPaginationFromHeaders(response),
    collection,
  }));
}

export function getAllKeywords(text, abortController) {
  if (!(abortController instanceof AbortController)) {
    return Promise.reject(
      new Error('le paramètre abortController doit être une instance de AbortController'),
    );
  }
  const urlKeywords = `${API_URL}/keywords?name=${text}`;
  // eslint-disable-next-line max-len
  return fetch(urlKeywords, { signal: abortController.signal }).then(extractCollectionAndPagination);
}
