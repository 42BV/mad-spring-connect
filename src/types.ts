import { StringifiableRecord } from 'query-string';

/**
 * The HTTP request method
 */
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Represents valid QueryParams.
 */
export type QueryParams = StringifiableRecord;

/**
 * Represents a payload to be sent as the body on a PATCH, PUT or
 * POST request. Is either a FormData or some other object.
 */
export type Payload<T> = Record<string, unknown> | FormData | T;

/**
 * Contains all the info of the request that was made. This way when
 * a request fails in the middleware the request can be retried again
 * with this info.
 */
export type RequestInfo = {
  url: string;
  method: Method;
  queryParams?: QueryParams;
  payload?: any;
};

/**
 * Middleware is a function which takes a Promise, and optionally
 * the url and options of the request and returns a new promise and
 * an object containing the necessary information to repeat the request.
 * What happens in the middle is what the middleware actually does.
 *
 * There are a couple of rules to define your own middleware:
 *
 *   1. You must keep the chain alive, so you must either then or catch
 *      or do both with the incoming promise.
 *   2. When doing a 'catch' you must return a rejected promise.
 *
 * @example
 * ```js
 * function displayError(promise) {
 *   return promise.catch((error) => {
 *     if (error.response.status === 400) {
 *       window.alert(error.message);
 *     }
 *
 *     // Keep the chain alive.
 *     return Promise.reject(error);
 *   });
 * }
 * ```
 */
export type Middleware = (
  middleware: Promise<any>,
  options: RequestInfo
) => Promise<any>;
