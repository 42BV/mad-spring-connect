/**
 * Represents an error which arose from handling a Response.
 *
 * @export
 * @class ErrorWithResponse
 * @extends {Error}
 */
export class ErrorWithResponse extends Error {
  public response: Response;

  // For some reason istanbul thinks the super call is untested.
  // https://github.com/gotwarlost/istanbul/issues/690
  /* istanbul ignore next */
  public constructor(response: Response) {
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
export async function checkStatus(
  promise: Promise<Response>
): Promise<Response> {
  const response = await promise;
  const status = response.status;
  if (status >= 200 && status <= 299) {
    return response;
  } else {
    return Promise.reject(new ErrorWithResponse(response));
  }
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
export async function parseJSON(promise: Promise<Response>): Promise<any> {
  const response = await promise;
  if (response.status === 204) {
    return Promise.resolve({});
  }
  const contentType = response.headers.get('Content-Type');
  if (contentType === null || contentType.includes('json') === false) {
    throw new Error(
      '@42.nl/spring-connect: Content-Type is not json, will not parse.'
    );
  }
  return response.json();
}
