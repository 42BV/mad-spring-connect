
import merge from 'lodash.merge';

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
export function makeInstance<T>(Class: Class<T>, properties: JSON): T {
  const instance = new Class();
  return merge(instance, properties);
}