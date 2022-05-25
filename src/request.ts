import { buildUrl } from './utils';
import { Payload, QueryParams } from './types';
import { AxiosResponse } from 'axios';
import { getApi } from './config';

/**
 * Does a GET request to the given url, with the query params if
 * they are provided. Then gives the result to the configured middleware
 * for processing.
 *
 * @example
 * ```js
 *  get('/api/pokemon', { page: 1 }).then((json) => {
 *   // Do something with the json here
 *  });
 * ```
 * @export
 * @param {string} url The url you want to send a GET request to.
 * @param {QueryParams} queryParams Optional query params as an object.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export async function get<T>(
  url: string,
  queryParams?: QueryParams
): Promise<T> {
  const finalUrl = buildUrl(url, queryParams);

  return getApi()
    .get<T>(finalUrl)
    .then((res) => res.data);
}

/**
 * Does a POST request to the given url, with the given payload.
 * Then gives the result to the configured middleware
 * for processing.
 *
 * @example
 * ```js
 *  post('/api/pokemon', { name: "bulbasaur" }).then((json) => {
 *    // Do something with the json here
 *  });
 * ```
 *
 * @export
 * @param {string} url The url you want to send a POST request to.
 * @param {Payload} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function post<T, D = Payload<T>>(url: string, payload: D): Promise<T> {
  return getApi()
    .post<T, AxiosResponse<T>, D>(url, payload)
    .then((res) => res.data);
}

/**
 * Does a PUT request to the given url, with the given payload.
 * Then gives the result to the configured middleware
 * for processing.
 *
 * @example
 * ```js
 *  put('/api/pokemon/1', { id: 1, name: "bulbasaur" }).then((json) => {
 *    // Do something with the json here
 *  });
 * ```
 *
 * @export
 * @param {string} url The url you want to send a PUT request to.
 * @param {Payload} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function put<T, D = Payload<T>>(url: string, payload: D): Promise<T> {
  return getApi()
    .put<T, AxiosResponse<T>, D>(url, payload)
    .then((res) => res.data);
}

/**
 * Does a PATCH request to the given url, with the given payload.
 * Then gives the result to the configured middleware
 * for processing.
 *
 * @example
 * ```js
 *  patch('/api/pokemon/1', { id: 1, name: "bulbasaur" }).then((json) => {
 *    // Do something with the json here
 *  });;
 * ```
 *
 * @export
 * @param {string} url  The url you want to send a PATCH request to.
 * @param {Payload} payload The payload you want to send to the server.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function patch<T, D = Payload<T>>(url: string, payload: D): Promise<T> {
  return getApi()
    .patch<T, AxiosResponse<T>, D>(url, payload)
    .then((res) => res.data);
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
 *  remove('/api/pokemon/1').then(() => {
 *    // Do something here.
 *  });;
 * ```
 *
 * @export
 * @param {string} url  The url you want to send a DELETE request to.
 * @returns {Promise} Returns a Promise, the content of the promise depends on the configured middleware.
 */
export function remove<T>(url: string): Promise<T> {
  return getApi()
    .delete<T>(url)
    .then((res) => res.data);
}
