import merge from 'lodash.merge';
import { get, post, put, remove as requestRemove, QueryParams } from './request';

import { Page } from './spring-models';
import { makeInstance } from './utils';

export declare class Resource<T> {
  public id?: number;
  public save(): Promise<T>;
  public remove(): Promise<T>;
  public static one<T>(id: number | string, queryParams?: QueryParams): Promise<T>;
  public static findOne<T>(queryParams: QueryParams): Promise<T | null>;
  public static list<T>(queryParams?: QueryParams): Promise<T[]>;
  public static page<T>(queryParams?: QueryParams): Promise<Page<T>>;
}

export function makeResource<T>(baseUrl: string): typeof Resource {
  /**
   * A Resource represents an Object which is returned from a REST API.
   * It knows how to save / update itself, and various means to retrieve
   * the Resource from the server.
   *
   * @decorator Resource
   * @template T Represents a Domain Entity.
   */
  return class Resource<T> {
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

        // @ts-ignore
        return this;
      } else {
        throw new Error('Cannot remove a Resource which has no id, this is a programmer error.');
      }
    }

    /**
     * Retrieves a single Resource of type T from the server.
     *
     * @example
     * ```js
     * Pokemon.get(1).then((pokemon: Pokemon) => {
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
    public static async one<T>(id: number | string, queryParams?: QueryParams): Promise<T> {
      const json = await get(`${baseUrl}/${id}`, queryParams);
      // @ts-ignore
      return makeInstance(this, json);
    }

    /**
     * Find a single optional Resource of type T from the server.
     *
     * @example
     * ```js
     * Pokemon.findOne({ name: 'Pickachu' }).then((pokemon: Pokemon) => {
     *   console.log(pokemon);
     * });
     * ```
     *
     * @static
     * @param {QueryParams} queryParams The query params for the url
     * @returns {Promise<T>} A Promise returning the Resource of type T or null.
     */
    public static async findOne<T>(queryParams: QueryParams): Promise<T | null> {
      const json = await get(baseUrl, queryParams);

      if (json.constructor === Object && Object.keys(json).length === 0) {
        return null;
      }

      // @ts-ignore
      return makeInstance(this, json);
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
    public static async list<T>(queryParams?: QueryParams): Promise<T[]> {
      const list = await get(baseUrl, queryParams);
      return list.map((properties: JSON) => makeInstance(this, properties));
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
    public static async page<T>(queryParams?: QueryParams): Promise<Page<T>> {
      const page = await get(baseUrl, queryParams);
      page.content = page.content.map((properties: JSON) => makeInstance(this, properties));
      return page;
    }
  };
}
