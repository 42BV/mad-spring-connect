import fetchMock from 'fetch-mock';
import { configureMadConnect } from '../src/config';
import * as middleware from '../src/middleware';
import { makeResource } from '../src/resource';
import { Page } from '../src/spring-models';

class Pokemon extends makeResource('api/pokemon')<Pokemon> {
  public id?: number;
  public name!: string;
  public types!: string[];
}

describe('Resource', () => {
  beforeEach(() => {
    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON],
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
          types: ['poison', 'grass'],
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.post('api/pokemon', response);

      let pokemon: Pokemon = new Pokemon();

      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      await pokemon.save();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      // @ts-ignore
      const { body } = fetchMock.lastOptions();
      expect(body).toBe(`{"name":"bulbasaur","types":["poison","grass"]}`);

      done();
    });

    test('update', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass'],
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.put('api/pokemon/1', response);

      const pokemon: Pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      await pokemon.save();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      // @ts-ignore
      const { body } = fetchMock.lastOptions();
      expect(body).toBe(`{"id":1,"name":"bulbasaur","types":["poison","grass"]}`);

      done();
    });
  });

  describe('remove', () => {
    test('has id', async done => {
      fetchMock.delete('api/pokemon/1', {
        status: 204,
      });

      const pokemon: Pokemon = new Pokemon();

      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      await pokemon.remove();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(undefined);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      done();
    });

    test('does not have id', async done => {
      const pokemon: Pokemon = new Pokemon();
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      try {
        await pokemon.remove();
      } catch (error) {
        expect(error.message).toBe('Cannot remove a Resource which has no id, this is a programmer error.');
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
          types: ['poison', 'grass'],
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon/1', response);

      const pokemon: Pokemon = await Pokemon.one(1);

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
          types: ['poison', 'grass'],
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon/1?number=42', response);

      const pokemon: Pokemon = await Pokemon.one(1, { number: 42 });

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      done();
    });

    test('with id which is a string', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass'],
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon/1', response);

      const pokemon: Pokemon = await Pokemon.one('1');

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      done();
    });
  });

  describe('findOne', () => {
    test('when resource does not exist', async done => {
      const response = {
        body: {},
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon?name=bulbasaur', response);

      const pokemon: Pokemon | null = await Pokemon.findOne({ name: 'bulbasaur' });

      expect(pokemon).toBe(null);

      done();
    });

    test('when resource exists', async done => {
      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass'],
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon?name=bulbasaur', response);

      const pokemon: Pokemon | null = await Pokemon.findOne({ name: 'bulbasaur' });

      if (pokemon) {
        expect(pokemon instanceof Pokemon).toBe(true);
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('bulbasaur');
        expect(pokemon.types).toEqual(['poison', 'grass']);
      } else {
        done.fail();
      }

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
            types: ['poison', 'grass'],
          },
          {
            id: 2,
            name: 'ivysaur',
            types: ['grass'],
          },
          {
            id: 3,
            name: 'venusaur',
            types: ['grass', 'poison'],
          },
        ],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.get('api/pokemon', response);

      const pokemonList: Pokemon[] = await Pokemon.list();
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
            types: ['poison', 'grass'],
          },
          {
            id: 2,
            name: 'ivysaur',
            types: ['grass'],
          },
          {
            id: 3,
            name: 'venusaur',
            types: ['grass', 'poison'],
          },
        ],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.get('api/pokemon?filter=true', response);

      const pokemonList: Pokemon[] = await Pokemon.list({ filter: true });
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
          types: ['poison', 'grass'],
        },
        {
          id: 2,
          name: 'ivysaur',
          types: ['grass'],
        },
        {
          id: 3,
          name: 'venusaur',
          types: ['grass', 'poison'],
        },
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
          content,
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon', response);

      const pokemonPage: Page<Pokemon[]> = await Pokemon.page();

      expect(pokemonPage.content.length).toBe(3);

      // @ts-ignore
      const bulbasaur: Pokemon = pokemonPage.content[0];
      // @ts-ignore
      const ivysaur: Pokemon = pokemonPage.content[1];
      // @ts-ignore
      const venusaur: Pokemon = pokemonPage.content[2];

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
          types: ['poison', 'grass'],
        },
        {
          id: 2,
          name: 'ivysaur',
          types: ['grass'],
        },
        {
          id: 3,
          name: 'venusaur',
          types: ['grass', 'poison'],
        },
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
          content,
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };

      fetchMock.get('api/pokemon?page=1', response);

      const pokemonPage = await Pokemon.page({ page: 1 });

      expect(pokemonPage.content.length).toBe(3);

      // @ts-ignore
      const bulbasaur: Pokemon = pokemonPage.content[0];
      // @ts-ignore
      const ivysaur: Pokemon = pokemonPage.content[1];
      // @ts-ignore
      const venusaur: Pokemon = pokemonPage.content[2];

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
