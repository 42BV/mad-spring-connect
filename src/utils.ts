import merge from 'lodash.merge';
import { stringify } from 'query-string';

import { getMiddleware } from './config';
import { QueryParams, RequestInfo, Middleware } from './types';

/* eslint-disable @typescript-eslint/ban-types */
// Allow for object type as parameter to makeInstance

/**
 * Takes a class definition and an object of JSON properties, and
 * creates an instance of the provided and sets the JSON properties
 * as the properties of the class.
 *
 * @example
 * ```js
 * class Person {
 *   id: number?;
 *   name: string?;
 * }
 *
 * const person: Person = makeInstance(Person, { id: 1, name: "Maarten" });
 * ```
 *
 * @export*
 * @param { Class<T : { id: ?number }> } Class A class definition.
 * @param {JSON} properties The properties you want the instance which will be created to have.
 * @template T A class definition
 * @returns An instance of the Class with the properties set.
 */
export function makeInstance<T>(Class: { new (): T }, properties: Record<string, unknown>): T {
  const instance = new Class();
  return merge(instance, properties);
}

// Helpers
export function buildUrl(url: string, queryParams?: QueryParams): string {
  if (queryParams) {
    const params = stringify(queryParams);
    return `${url}?${params}`;
  } else {
    return url;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMiddleware(promise: Promise<any>, requestInfo: RequestInfo): Promise<any> {
  const middleware: Middleware[] = getMiddleware();

  let nextPromise = promise;

  middleware.forEach((fn) => {
    nextPromise = fn(nextPromise, requestInfo);
  });

  return nextPromise;
}
