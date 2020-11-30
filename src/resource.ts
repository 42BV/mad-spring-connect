import merge from 'lodash.merge';
import { get, post, put, remove as requestRemove } from './request';

import { Page } from './spring-models';
import { QueryParams } from './types';
import { makeInstance } from './utils';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Allow for makeResource not to have a return type

/*
  Why use a `makeResource` function and why not simply export the
  Resource class which is defined inside of it, would that not be
  more efficient? The answer of course is yes that would be better
  because it would use less memory.

  The reason we cannot do that however is simple, TypeScript does
  not allow us to define a generic on the class level which can be 
  within the static instance methods such as `page` and `one`. 

  This means that class Resource<T> will not allow you to create
  a static method like this: `static one(id: number): Promise<T>`
  because TypeScript will not allow you to use T in that case. Which
  is regrettable...

  So we use a trick we dynamically create a class definition from within
  a function which has the generic T. This way the static methods can use
  the same T as the instance methods.

  Also as a bonus it allows us to define the `baseUrl` in a way
  that both the static and instance methods can easily access.
*/

/**
 * A Mapper takes JSON and converts it to type T.
 *
 * @template T
 * @param {any} json The JSON this mapper converts to type T.
 * @param {Class} Class The class definition of the Resource
 * @returns
 */
export type Mapper<T> = (json: any, Class: { new (): T }) => T;

/**
 * Config object to declare the Resource with. Is either a string
 * in which case it is a baseUrl, or an object containing the
 * baseUrl and a custom mapper.
 */
export type MakeResourceConfig<T> =
  | string
  | { baseUrl: string; mapper?: Mapper<T> };

/**
 * Creates a new Resource class definition for the user to extend.
 *
 * @export
 * @example
 * ```js
 * class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
 *  public id?: number;
 *  public name!: string;
 *  public types!: string[];
 * }
 * ```
 *
 * @template T
 * @param {string} baseUrl The baseUrl of the resource
 * @returns
 */
export function makeResource<T>(config: MakeResourceConfig<T>) {
  const baseUrl = typeof config === 'string' ? config : config.baseUrl;

  const mapper = getMapper(config);

  /**
   *  A Resource represents an Object which is returned from a REST API.
   * It knows how to save / update itself, and various means to retrieve
   * the Resource from the server.
   */
  return class {
    public id?: number;

    /**
     * Either creates a new Resource by performing a POST when the id is
     * empty, or updates an existing resource via a PUT request when the
     * id exists.
     *
     * @example
     * ```js
     * pokemon = new Pokemon();
     * pokemon.name = "bulbasaur";
     * pokemon.save();
     * ```
     *
     * @returns {Promise<T>} The instance updated with the id from the back-end.
     */
    public async save(): Promise<T> {
      let json: T;

      if (this.id) {
        json = await put(`${baseUrl}/${this.id}`, this);
      } else {
        json = await post(`${baseUrl}`, this);
      }

      return merge(this, json);
    }

    /**
     * Removes an existing Resource by performing a DELETE request.
     *
     * @example
     * ```js
     * const pokemon = Pokemon.one(1);
     * pokemon.remove().then(() => {
     *   // The pokemon is now removed from the back-end..
     * });
     * ```
     *
     * @returns {Promise<T>} The instance which was removed, but with an empty id.
     * @throws {Error} When the id is not defined it throws an error.
     */
    public async remove(): Promise<T> {
      if (this.id) {
        await requestRemove(`${baseUrl}/${this.id}`);
        this.id = undefined;

        // @ts-expect-error accept `this` as T
        return this;
      } else {
        throw new Error(
          'Cannot remove a Resource which has no id, this is a programmer error.'
        );
      }
    }

    /**
     * Retrieves a single Resource of type T from the server.
     *
     * @example
     * ```js
     * Pokemon.get(1).then((pokemon) => {
     *   console.log(pokemon);
     * });
     * ```
     *
     * @static
     * @param {number | string} id The id of the Resource you want to retrieve
     * @param {QueryParams} queryParams Optional query params for the url
     * @returns {Promise<T>} A Promise returning the Resource of type T.
     *
     */
    public static async one(
      id: number | string,
      queryParams?: QueryParams
    ): Promise<T> {
      const json = await get(`${baseUrl}/${id}`, queryParams);

      // @ts-expect-error accept `this` as T
      return mapper(json, this);
    }

    /**
     * Find a single optional Resource of type T from the server.
     *
     * @example
     * ```js
     * Pokemon.findOne({ name: 'Pikachu' }).then((pokemon) => {
     *   console.log(pokemon);
     * });
     * ```
     *
     * @static
     * @param {QueryParams} queryParams The query params for the url
     * @returns {Promise<T | void>} A Promise returning the Resource of type T or undefined.
     */
    public static async findOne(queryParams: QueryParams): Promise<T | void> {
      const json = await get(baseUrl, queryParams);

      if (json.constructor === Object && Object.keys(json).length === 0) {
        return undefined;
      }

      // @ts-expect-error accept `this` as T
      return mapper(json, this);
    }

    /**
     * Retrieves multiple Resources of type T from the server as an Array.
     *
     * @example
     * ```js
     * Pokemon.list().then((pokemon: Array<Pokemon>) => {
     *   console.log(pokemon);
     * });
     * ```
     *
     * @static
     * @param {QueryParams} queryParams Optional query params for the url
     * @returns {Promise<Array<T>>} A Promise returning the Resource of type Array<T>.
     *
     * @memberOf Resource
     */
    public static async list(queryParams?: QueryParams): Promise<T[]> {
      const list = await get(baseUrl, queryParams);
      return list.map((properties: JSON) => {
        // @ts-expect-error accept `this` as T
        return mapper(properties, this);
      });
    }

    /**
     * Retrieves multiple Resources of type T from the server as a Page.
     *
     * @example
     * ```js
     * Pokemon.page({ page: 1 }).then((pokemon: Page<Pokemon>) => {
     *   console.log(pokemon);
     * });
     * ```
     *
     * @static
     * @param {QueryParams} queryParams Optional query params for the url
     * @returns {Promise<Page<T>>} A Promise returning the Resource of type Page<T>.
     */
    public static async page(queryParams?: QueryParams): Promise<Page<T>> {
      const page = await get(baseUrl, queryParams);
      page.content = page.content.map((properties: JSON) => {
        // @ts-expect-error accept `this` as T
        return mapper(properties, this);
      });
      return page;
    }
  };
}

/**
 * Returns the mapper to be used for the Resource based on the config.
 */
function getMapper<T>(config: MakeResourceConfig<T>): Mapper<T> {
  if (typeof config === 'string') {
    return defaultMapper;
  } else {
    return config.mapper ? config.mapper : defaultMapper;
  }
}

/**
 * The default mapper uses `makeInstance` to convert the JSON
 * to a T.
 */
function defaultMapper<T>(json: JSON, Class: { new (): T }): T {
  return makeInstance(Class, json);
}
