// @flow

import merge from 'lodash.merge';

import { 
  get,
  post,
  put,
  remove as requestRemove
} from './request';

import type { Page } from './spring-models';

import { makeInstance } from './utils';

/**
 * A Resource represents an Object which is returned from a REST API.
 * It knows how to save / update itself, and various means to retrieve
 * the Resource from the server.
 * 
 * @interface Resource
 * @template T Represents a Domain Entity.
 */
export interface Resource<T> {
  id: number;
  
  save(): Promise<T>;
  remove(): Promise<T>;

  static one(id: number, queryParams: ?Object): Promise<T>;
  static list(queryParams: ?Object): Promise<Array<T>>;
  static page(queryParams: ?Object): Promise<Page<T>>;
}

/**
 * Creates a new Resource which is a class definition which is a 
 * subclass of the given DomainClass which implements the Resource 
 * interface.
 * 
 * Adds the following instance methods: `save` and `remove`.
 * Adds the following static methdos: `one`, `list` and `page`.
 * 
 * It will not override instance, and static method if they are
 * already defined.
 * 
 * @example
 * ```js
 * class Pokemon {
 *   id: ?number;
 *   name: string;
 *   types: Array<string>;
 * }
 * 
 * export default makeResource(Pokemon, 'api/pokemon');
 * ```
 * 
 * @export
 * @param { Class<T : { id: ?number }> } DomainClass A class definition representing a domain entity. The entity must have an id field.
 * @param {string} baseUrl The part of the url which is constant, for example 'api/pokemon/';
 */
export function makeResource<T>(DomainClass: *, baseUrl: string) {
  if (DomainClass.prototype.save === undefined) {
    DomainClass.prototype.save = makeSave(DomainClass, baseUrl);
  }
  
  if (DomainClass.prototype.remove === undefined) {
    DomainClass.prototype.remove = makeRemove(DomainClass, baseUrl);
  }

  if (DomainClass.one === undefined) {
    DomainClass.one = makeOne(DomainClass, baseUrl);
  }

  if (DomainClass.list === undefined) {
    DomainClass.list = makeList(DomainClass, baseUrl);
  }

  if (DomainClass.page === undefined) {
    DomainClass.page = makePage(DomainClass, baseUrl);
  }
}

function makeSave<T: { id: ?number }>(DomainClass: Class<T>, baseUrl: string): () => Promise<T> {
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
  return function save(): Promise<T> {
    if (this.id) {
      return put(`${baseUrl}/${this.id}`, this).then((json: any) => {
        return merge(this, json);
      });
    } else {
      return post(`${baseUrl}`, this).then((json: any) => {
        return merge(this, json);
      });
    }
  };
}

function makeRemove<T: { id: ?number }>(DomainClass: Class<T>, baseUrl: string): () => Promise<T> {
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
  return function remove(): Promise<T> {
    if (this.id) {
      return requestRemove(`${baseUrl}/${this.id}`).then(() => {
        this.id = undefined;
        return this;
      });
    } else {
      throw new Error('Cannot remove a Resource which has no id, this is a programmer error.');
    }
  }
}

function makeOne<T>(DomainClass: Class<T>, baseUrl: string): (id: number, queryParams: ?Object) => Promise<T> {
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
  * @param {number} id The id of the Resource you want to retrieve
  * @param {Object} queryParams Optional query params for the url
  * @returns {Promise<T>} A Promise returning the Resource of type T.
  * 
  * @memberOf Resource
  */
  return function one(id: number, queryParams: ?Object = undefined): Promise<T> {
    return get(`${baseUrl}/${id}`, queryParams).then((json: any) => {
      return makeInstance(DomainClass, json);
    });
  };
}

function makeList<T>(DomainClass: Class<T>, baseUrl: string): (queryParams: ?Object) => Promise<Array<T>> {
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
    * @param {Object} queryParams Optional query params for the url
    * @returns {Promise<Array<T>>}  A Promise returning the Resource of type Array<T>.
    * 
    * @memberOf Resource
    */
  return function list(queryParams: ?Object = undefined): Promise<Array<T>> {
    return get(baseUrl, queryParams).then((list: any) => {
      return list.map((properties: JSON) => {
        return makeInstance(DomainClass, properties);
      });
    });
  };
}

function makePage<T>(DomainClass: Class<T>, baseUrl: string): (queryParams: ?Object) => Promise<Page<T>> {
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
    * @param {Object} queryParams Optional query params for the url
    * @returns {Promise<Page<T>>}  A Promise returning the Resource of type Page<T>.
    */
  return function page(queryParams: ?Object = undefined): Promise<Page<T>> {
    return get(baseUrl, queryParams).then((page: any) => {
      page.content = page.content.map((properties: JSON) => {
        return makeInstance(DomainClass, properties)
      });

      return page;
    });
  }
}