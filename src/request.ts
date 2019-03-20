import { buildUrl, applyMiddleware } from './utils';
import { getFetch } from './config';
import { Method } from './middleware';

export type QueryParams = object;

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
 * @param {QueryParams} queryParams Optional query params as an object.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function get(url: string, queryParams?: QueryParams): Promise<any> {
  const finalUrl = buildUrl(url, queryParams);

  return applyMiddleware(getFetch()(finalUrl), { url, queryParams, method: Method.GET });
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
 * @param {object} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function post(url: string, payload: object): Promise<any> {
  let method = Method.POST;

  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(payload),
  };

  return applyMiddleware(getFetch()(url, options), { url, payload, method });
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
export function put(url: string, payload: object): Promise<any> {
  let method = Method.PUT;

  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(payload),
  };

  return applyMiddleware(getFetch()(url, options), { url, payload, method });
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
export function patch(url: string, payload: object): Promise<any> {
  let method = Method.PATCH;

  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(payload),
  };

  return applyMiddleware(getFetch()(url, options), { url, payload, method });
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
  let method = Method.DELETE;

  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
  };

  return applyMiddleware(getFetch()(url, options), {
    url,
    method,
  });
}
