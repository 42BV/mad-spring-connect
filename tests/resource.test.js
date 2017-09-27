// @flow

import fetchMock from 'fetch-mock';

import * as middleware from '../src/middleware';

import { configureMadConnect } from '../src/config';

import { makeResource } from '../src/resource';

import type { Page } from '../src/spring-models';

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

describe('makeResource', () => {
  beforeEach(() => {
    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON]
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe('save', () => {
    test('create', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.post('api/pokemon', response);

      const pokemon: Pokemon = new Pokemon();

      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.save();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      const fetchOptions = fetchMock.lastOptions();
      expect(fetchOptions.body).toBe(
        `{"name":"bulbasaur","types":["poison","grass"]}`
      );

      done();
    });

    test('update', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.put('api/pokemon/1', response);

      const pokemon: Pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.save();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      const fetchOptions = fetchMock.lastOptions();
      expect(fetchOptions.body).toBe(
        `{"id":1,"name":"bulbasaur","types":["poison","grass"]}`
      );

      done();
    });
  });

  describe('remove', () => {
    test('has id', async done => {
      fetchMock.delete('api/pokemon/1', {
        status: 204
      });

      const pokemon: Pokemon = new Pokemon();

      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.remove();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(undefined);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      done();
    });

    test('does not have id', done => {
      const pokemon: Pokemon = new Pokemon();
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      try {
        pokemon.remove();
      } catch (error) {
        expect(error.message).toBe(
          'Cannot remove a Resource which has no id, this is a programmer error.'
        );
        done();
      }
    });
  });

  describe('one', () => {
    test('without query params', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('api/pokemon/1', response);

      const pokemon = await Pokemon.one(1);

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      done();
    });

    test('with query params', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('api/pokemon/1?number=42', response);

      const pokemon = await Pokemon.one(1, { number: 42 });

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      done();
    });
  });

  describe('list', () => {
    test('without query params', async done => {
      const response = {
        body: [
          {
            id: 1,
            name: 'bulbasaur',
            types: ['poison', 'grass']
          },
          {
            id: 2,
            name: 'ivysaur',
            types: ['grass']
          },
          {
            id: 3,
            name: 'venusaur',
            types: ['grass', 'poison']
          }
        ],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      fetchMock.get('api/pokemon', response);

      const pokemonList = await Pokemon.list();

      expect(pokemonList.length).toBe(3);

      const [bulbasaur, ivysaur, venusaur] = pokemonList;

      expect(bulbasaur instanceof Pokemon).toBe(true);
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).toEqual(['poison', 'grass']);

      expect(ivysaur instanceof Pokemon).toBe(true);
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).toEqual(['grass']);

      expect(venusaur instanceof Pokemon).toBe(true);
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).toEqual(['grass', 'poison']);

      done();
    });

    test('with query params', async done => {
      const response = {
        body: [
          {
            id: 1,
            name: 'bulbasaur',
            types: ['poison', 'grass']
          },
          {
            id: 2,
            name: 'ivysaur',
            types: ['grass']
          },
          {
            id: 3,
            name: 'venusaur',
            types: ['grass', 'poison']
          }
        ],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      fetchMock.get('api/pokemon?filter=true', response);

      const pokemonList = await Pokemon.list({ filter: true });

      expect(pokemonList.length).toBe(3);

      const [bulbasaur, ivysaur, venusaur] = pokemonList;

      expect(bulbasaur instanceof Pokemon).toBe(true);
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).toEqual(['poison', 'grass']);

      expect(ivysaur instanceof Pokemon).toBe(true);
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).toEqual(['grass']);

      expect(venusaur instanceof Pokemon).toBe(true);
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).toEqual(['grass', 'poison']);

      done();
    });
  });

  describe('page', () => {
    test('without query params', async done => {
      const content = [
        {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        {
          id: 2,
          name: 'ivysaur',
          types: ['grass']
        },
        {
          id: 3,
          name: 'venusaur',
          types: ['grass', 'poison']
        }
      ];

      const response = {
        body: {
          last: true,
          totalElements: 3,
          totalPages: 1,
          size: 10,
          number: 0,
          first: true,
          numberOfElements: 3,
          content
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('api/pokemon', response);

      const pokemonPage = await Pokemon.page();

      expect(pokemonPage.content.length).toBe(3);

      const [bulbasaur, ivysaur, venusaur] = pokemonPage.content;

      expect(bulbasaur instanceof Pokemon).toBe(true);
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).toEqual(['poison', 'grass']);

      expect(ivysaur instanceof Pokemon).toBe(true);
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).toEqual(['grass']);

      expect(venusaur instanceof Pokemon).toBe(true);
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).toEqual(['grass', 'poison']);

      done();
    });

    test('without query params', async done => {
      const content = [
        {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        {
          id: 2,
          name: 'ivysaur',
          types: ['grass']
        },
        {
          id: 3,
          name: 'venusaur',
          types: ['grass', 'poison']
        }
      ];

      const response = {
        body: {
          last: true,
          totalElements: 3,
          totalPages: 1,
          size: 10,
          number: 0,
          first: true,
          numberOfElements: 3,
          content
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('api/pokemon?page=1', response);

      const pokemonPage = await Pokemon.page({ page: 1 });

      expect(pokemonPage.content.length).toBe(3);

      const [bulbasaur, ivysaur, venusaur] = pokemonPage.content;

      expect(bulbasaur instanceof Pokemon).toBe(true);
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).toEqual(['poison', 'grass']);

      expect(ivysaur instanceof Pokemon).toBe(true);
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).toEqual(['grass']);

      expect(venusaur instanceof Pokemon).toBe(true);
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).toEqual(['grass', 'poison']);

      done();
    });
  });
});
