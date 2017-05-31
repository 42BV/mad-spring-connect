// @flow

import { stringify } from 'query-string';

import { getFetch, getMiddleware } from './config';

import type { Middleware } from './middleware';

/**
 * Does a GET request to the given url, with the query params if
 * they are provided. Then gives the result to the configured middleware
 * for processing.
 * 
 * @example
 * ```js
 *  get('api/pokemon', { page: 1 }).then((json) => {
 *   // Do something with the json here
 *  });
 * ```
 * @export
 * @param {string} url The url you want to send a GET request to.
 * @param {Object} queryParams Optional query params as an object.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware. 
 */
export function get(url: string, queryParams: ?Object = undefined): Promise<any> {
  const finalUrl = buildUrl(url, queryParams);

  return applyMiddleware(getFetch()(finalUrl));
}

/**
 * Does a POST request to the given url, with the given payload.
 * Then gives the result to the configured middleware
 * for processing.
 * 
 * @example
 * ```js
 *  post('api/pokemon', { name: "bulbasaur" }).then((json) => {
 *    // Do something with the json here 
 *  });
 * ```
 * 
 * @export
 * @param {string} url  The url you want to send a POST request to.
 * @param {Object} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function post(url: string, payload: Object): Promise<any> {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(payload)
  };

  return applyMiddleware(getFetch()(url, options));
}

/**
 * Does a PUT request to the given url, with the given payload.
 * Then gives the result to the configured middleware
 * for processing.
 * 
 * @example
 * ```js
 *  put('api/pokemon/1', { id: 1, name: "bulbasaur" }).then((json) => {
 *    // Do something with the json here 
 *  });
 * ```
 * 
 * @export
 * @param {string} url  The url you want to send a PUT request to.
 * @param {Object} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function put(url: string, payload: Object): Promise<any> {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify(payload)
  };

  return applyMiddleware(getFetch()(url, options));
}

/**
 * Does a PATCH request to the given url, with the given payload.
 * Then gives the result to the configured middleware
 * for processing.
 * 
 * @example
 * ```js
 *  patch('api/pokemon/1', { id: 1, name: "bulbasaur" }).then((json) => {
 *    // Do something with the json here 
 *  });;
 * ```
 * 
 * @export
 * @param {string} url  The url you want to send a PATCH request to.
 * @param {Object} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function patch(url: string, payload: Object): Promise<any> {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify(payload)
  };

  return applyMiddleware(getFetch()(url, options));
}

/**
 * Does a DELETE request to the given url.
 * Then gives the result to the configured middleware
 * for processing.
 * 
 * Note: this function is called 'remove' and not 'delete' because
 * delete is a keyword in JavaScript.
 * 
 * @example
 * ```js
 *  remove('api/pokemon/1').then(() => {
 *    // Do something here.
 *  });;
 * ```
 * 
 * @export
 * @param {string} url  The url you want to send a DELETE request to.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function remove(url: string): Promise<any> {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'DELETE'
  };

  return applyMiddleware(getFetch()(url, options));
}

// Helpers

function buildUrl(url: string, queryParams: ?Object): string {
  if (queryParams) {
    const params = stringify(queryParams);
    return `${url}?${params}`;
  } else {
    return url;
  }
}

function applyMiddleware(promise: Promise<*>): Promise<*> {
  const middleware: Array<Middleware> = getMiddleware();

  let nextPromise = promise;

  middleware.forEach((fn) => {
    nextPromise = fn(nextPromise);
  });

  return nextPromise;
}
