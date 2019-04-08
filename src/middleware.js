// @flow

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
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type MiddlewareDetailInfo = { url: string, method: Method, queryParams?: ?Object, payload?: ?Object };
export type Middleware = (Promise<*>, MiddlewareDetailInfo) => Promise<*>;

/**
 * Represents an error which arose from handling a Response.
 * 
 * @export
 * @class ErrorWithResponse
 * @extends {Error}
 */
export class ErrorWithResponse extends Error {
  response: Response;

  constructor(response: Response) {
    super(response.statusText);

    this.response = response;
  }
}

/**
 * Takes a Promise which resolves to a Response and returns a Promise which
 * either resolves back to the Response in case of 2xx status code, 
 * or rejects with an ErrorWithResponse in case of a non 2xx status code.
 * 
 * In other words checkStatus creates a fork in the road. All 2xx
 * responses will end up in the 'then' chain, and all non 2xx responses
 * will end up in the 'catch' chains.
 * 
 * @export
 * @param {Response} response https://developer.mozilla.org/en-US/docs/Web/API/Response
 * @returns {Response} The response if it was in the 2xx range.
 * @throws {ErrorWithResponse} An ErrorWithResponse instance.
 */
export function checkStatus(promise: Promise<Response>): Promise<Response> {
  return promise.then((response: Response) => {
    const status = response.status;

    if (status >= 200 && status <= 299) {
      return response;
    } else {
      return Promise.reject(new ErrorWithResponse(response));
    }
  });
}

/**
 * Takes a Promise which resolves to a Response and returns a Promise
 * which resolves to the JSON representation of the Response.
 * 
 * If the response has a 204 No Content no response is parsed and instead
 * a Promise which resolves to an empty object is returned.
 * 
 * Throws an error when the json cannot be parsed, or when the Content-Type
 * does not include application/json.
 * 
 * @param {Promise<Response>} Promise resolving to a Response
 * @return {Promise<any>} the JSON representation of the response body.
 * @throws {Error} An Error indicating that the JSON could not be parsed. 
 */
export function parseJSON(promise: Promise<Response>): Promise<any> {
  return promise.then((response: Response) => {
    if (response.status === 204) {
      return Promise.resolve({});
    }

    const contentType = response.headers.get('Content-Type');

    if (
      contentType === null ||
      contentType.includes('json') === false
    ) {
      throw new Error(
        'mad-spring-connect: Content-Type is not json, will not parse.'
      );
    }

    return response.json();
  });
}
