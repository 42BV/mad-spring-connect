import { default as queryString } from 'query-string';

import { QueryParams } from './types.js';

// Helpers
export function buildUrl(url: string, queryParams?: QueryParams): string {
  if (queryParams) {
    const params = queryString.stringify(queryParams);
    return `${url}?${params}`;
  } else {
    return url;
  }
}
