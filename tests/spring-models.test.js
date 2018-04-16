// @flow

import { emptyPage } from '../src/spring-models';
import type { Page } from '../src/spring-models';

import { makeResource } from '../src/resource';

class Pokemon {
  id: number;
  name: string;
  types: Array<string>;

  save: () => Promise<Pokemon>;
  remove: () => Promise<Pokemon>;

  static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
  static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
  static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;
}

makeResource(Pokemon, 'api/pokemon');

class Bicycle {
  id: number;
  brand: string;

  save: () => Promise<Bicycle>;
  remove: () => Promise<Bicycle>;

  static one: (id: number, queryParams: ?Object) => Promise<Bicycle>;
  static list: (queryParams: ?Object) => Promise<Array<Bicycle>>;
  static page: (queryParams: ?Object) => Promise<Page<Bicycle>>;
}

makeResource(Bicycle, 'api/bicycle');

/* 
  This test is designed to trip flow, not to actually test any code.
  The emptyPage had a bug where it was not recognized as being a 
  Page<T>.
*/
describe('emptyPage', () => {
  it('should understand that emptyPage is of type Page<T>', () => {
    const pokemonPage: Page<Pokemon> = emptyPage();
    const bicyclePage: Page<Bicycle> = emptyPage();

    const bicycleContent: Array<Bicycle> = emptyPage().content;
    const pokemonContent: Array<Pokemon> = emptyPage().content;
  });
});