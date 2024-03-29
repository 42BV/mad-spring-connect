import merge from 'lodash.merge';
import { default as queryString } from 'query-string';

import { QueryParams } from './types';

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
 *
 * @deprecated A resource provides basic functions that might not be defined in
 * your API, and detail responses often provide more/other properties, which
 * could cause type confusion or unnecessary checks for optional properties.
 * We recommend using explicit functions for calls to your API that provide
 * specific typing.
 */
export function makeInstance<T>(
  Class: { new (): T },
  properties: Record<string, unknown>
): T {
  const instance = new Class();
  return merge(instance, properties);
}

// Helpers
export function buildUrl(url: string, queryParams?: QueryParams): string {
  if (queryParams) {
    const params = queryString.stringify(queryParams);
    return `${url}?${params}`;
  } else {
    return url;
  }
}
