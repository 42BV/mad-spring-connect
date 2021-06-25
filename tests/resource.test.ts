import fetchMock from 'fetch-mock';
import { configureMadConnect } from '../src/config';
import * as middleware from '../src/middleware';
import { makeResource } from '../src/resource';
import { makeInstance } from '../src/utils';

describe('Resource', () => {
  type PokemonResult = {
    id: number;
    name: string;
    types: string[];
  };

  class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
    public id?: number;
    public name!: string;
    public types!: string[];
  }

  // @ts-expect-error Test mock
  class Pokeball extends makeResource<Pokeball>({
    baseUrl: '/api/pokeball',
    mapper: pokeballMapper
  }) {
    public id?: number;
    public pokemon!: Pokemon;
    public retrievedAt!: Date;
  }

  type PokeballResult = {
    id: number;
    pokemon: PokemonResult;
    retrievedAt: string;
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  function pokeballMapper(
    json: PokeballResult,
    Class: { new (): Pokeball }
  ): Pokeball {
    const pokeball = makeInstance(Class, json);
    pokeball.retrievedAt = new Date();
    // @ts-expect-error Type of pokemon is not unknown
    pokeball.pokemon = makeInstance(Pokemon, pokeball.pokemon);
    return pokeball;
  }

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
    test('create', async () => {
      expect.assertions(5);

      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.post('/api/pokemon', response);

      const pokemon = new Pokemon();

      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      await pokemon.save();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      const { body } = fetchMock.lastOptions() ?? { body: '' };
      expect(body).toBe(`{"name":"bulbasaur","types":["poison","grass"]}`);
    });

    test('update', async () => {
      expect.assertions(5);

      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.put('/api/pokemon/1', response);

      const pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      await pokemon.save();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);

      const { body } = fetchMock.lastOptions() ?? { body: '' };
      expect(body).toBe(
        `{"id":1,"name":"bulbasaur","types":["poison","grass"]}`
      );
    });
  });

  describe('remove', () => {
    test('has id', async () => {
      expect.assertions(4);

      fetchMock.delete('/api/pokemon/1', {
        status: 204
      });

      const pokemon = new Pokemon();

      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      await pokemon.remove();

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(undefined);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('does not have id', async () => {
      expect.assertions(1);

      const pokemon = new Pokemon();
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      try {
        await pokemon.remove();
      } catch (error) {
        expect(error.message).toBe(
          'Cannot remove a Resource which has no id, this is a programmer error.'
        );
      }
    });
  });

  describe('one', () => {
    test('without query params', async () => {
      expect.assertions(4);

      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('/api/pokemon/1', response);

      const pokemon = await Pokemon.one(1);

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with query params', async () => {
      expect.assertions(4);

      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('/api/pokemon/1?number=42', response);

      const pokemon = await Pokemon.one(1, { number: 42 });

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with id which is a string', async () => {
      expect.assertions(4);

      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('/api/pokemon/1', response);

      const pokemon = await Pokemon.one('1');

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with custom mapper', async () => {
      expect.assertions(7);

      const response = {
        id: 1,
        pokemon: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('/api/pokeball/1', response);

      // @ts-expect-error Test mock
      const pokeball = await Pokeball.one(1);

      expect(pokeball instanceof Pokeball).toBe(true);
      expect(pokeball.id).toBe(1);
      expect(pokeball.retrievedAt instanceof Date).toBe(true);

      const pokemon = pokeball.pokemon;

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });
  });

  describe('findOne', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function expectPokemonFindOneUndefined(response: {
      body: any;
      headers: { [key: string]: string };
    }) {
      fetchMock.get('/api/pokemon?name=bulbasaur', response);

      const pokemon = await Pokemon.findOne({ name: 'bulbasaur' });

      expect(pokemon).toBe(undefined);
    }

    test('when response is an empty object', async () => {
      expect.assertions(1);

      await expectPokemonFindOneUndefined({
        body: {},
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    });

    test('when response is an empty array', async () => {
      expect.assertions(1);

      await expectPokemonFindOneUndefined({
        body: [],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    });

    test('when response is a filled array', async () => {
      expect.assertions(1);

      await expectPokemonFindOneUndefined({
        body: [1, 2, 3],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    });

    test('when resource exists', async () => {
      expect.assertions(4);

      const response = {
        body: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('/api/pokemon?name=bulbasaur', response);

      const pokemon = await Pokemon.findOne({ name: 'bulbasaur' });

      if (pokemon) {
        expect(pokemon instanceof Pokemon).toBe(true);
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('bulbasaur');
        expect(pokemon.types).toEqual(['poison', 'grass']);
      }
    });

    test('with custom mapper', async () => {
      expect.assertions(7);

      const response = {
        id: 1,
        pokemon: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      fetchMock.get('/api/pokeball?name=bulbasaur', response);

      // @ts-expect-error Test mock
      const pokeball = await Pokeball.findOne({ name: 'bulbasaur' });

      if (pokeball) {
        const pokemon = pokeball.pokemon;

        expect(pokeball instanceof Pokeball).toBe(true);
        expect(pokeball.id).toBe(1);
        expect(pokeball.retrievedAt instanceof Date).toBe(true);

        expect(pokemon instanceof Pokemon).toBe(true);
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('bulbasaur');
        expect(pokemon.types).toEqual(['poison', 'grass']);
      }
    });
  });

  describe('list', () => {
    test('without query params', async () => {
      expect.assertions(13);

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
      fetchMock.get('/api/pokemon', response);

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
    });

    test('with query params', async () => {
      expect.assertions(13);

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
      fetchMock.get('/api/pokemon?filter=true', response);

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
    });

    test('with custom mapper', async () => {
      expect.assertions(22);

      const response = {
        body: [
          {
            id: 1,
            pokemon: {
              id: 1,
              name: 'bulbasaur',
              types: ['poison', 'grass']
            }
          },

          {
            id: 2,
            pokemon: {
              id: 2,
              name: 'ivysaur',
              types: ['grass']
            }
          },
          {
            id: 3,
            pokemon: {
              id: 3,
              name: 'venusaur',
              types: ['grass', 'poison']
            }
          }
        ],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      fetchMock.get('/api/pokeball', response);

      // @ts-expect-error Test mock
      const pokeballList = await Pokeball.list();

      expect(pokeballList.length).toBe(3);

      const [bulbasaurBall, ivysaurBall, venusaurBall] = pokeballList;

      expect(bulbasaurBall instanceof Pokeball).toBe(true);
      expect(bulbasaurBall.id).toBe(1);
      expect(bulbasaurBall.retrievedAt instanceof Date).toBe(true);

      expect(ivysaurBall instanceof Pokeball).toBe(true);
      expect(ivysaurBall.id).toBe(2);
      expect(ivysaurBall.retrievedAt instanceof Date).toBe(true);

      expect(venusaurBall instanceof Pokeball).toBe(true);
      expect(venusaurBall.id).toBe(3);
      expect(venusaurBall.retrievedAt instanceof Date).toBe(true);

      const bulbasaur = bulbasaurBall.pokemon;

      expect(bulbasaur instanceof Pokemon).toBe(true);
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).toEqual(['poison', 'grass']);

      const ivysaur = ivysaurBall.pokemon;

      expect(ivysaur instanceof Pokemon).toBe(true);
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).toEqual(['grass']);

      const venusaur = venusaurBall.pokemon;

      expect(venusaur instanceof Pokemon).toBe(true);
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).toEqual(['grass', 'poison']);
    });
  });

  describe('page', () => {
    test('without query params', async () => {
      expect.assertions(13);

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

      fetchMock.get('/api/pokemon', response);

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
    });

    test('with query params', async () => {
      expect.assertions(13);

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

      fetchMock.get('/api/pokemon?page=1', response);

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
    });

    test('with custom mapper', async () => {
      expect.assertions(22);

      const content = [
        {
          id: 1,
          pokemon: {
            id: 1,
            name: 'bulbasaur',
            types: ['poison', 'grass']
          }
        },

        {
          id: 2,
          pokemon: {
            id: 2,
            name: 'ivysaur',
            types: ['grass']
          }
        },
        {
          id: 3,
          pokemon: {
            id: 3,
            name: 'venusaur',
            types: ['grass', 'poison']
          }
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

      fetchMock.get('/api/pokeball?page=1', response);

      // @ts-expect-error Test mock
      const pokeballPage = await Pokeball.page({ page: 1 });

      expect(pokeballPage.content.length).toBe(3);

      const [bulbasaurBall, ivysaurBall, venusaurBall] = pokeballPage.content;

      expect(bulbasaurBall instanceof Pokeball).toBe(true);
      expect(bulbasaurBall.id).toBe(1);
      expect(bulbasaurBall.retrievedAt instanceof Date).toBe(true);

      expect(ivysaurBall instanceof Pokeball).toBe(true);
      expect(ivysaurBall.id).toBe(2);
      expect(ivysaurBall.retrievedAt instanceof Date).toBe(true);

      expect(venusaurBall instanceof Pokeball).toBe(true);
      expect(venusaurBall.id).toBe(3);
      expect(venusaurBall.retrievedAt instanceof Date).toBe(true);

      const bulbasaur = bulbasaurBall.pokemon;

      expect(bulbasaur instanceof Pokemon).toBe(true);
      expect(bulbasaur.id).toBe(1);
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types).toEqual(['poison', 'grass']);

      const ivysaur = ivysaurBall.pokemon;

      expect(ivysaur instanceof Pokemon).toBe(true);
      expect(ivysaur.id).toBe(2);
      expect(ivysaur.name).toBe('ivysaur');
      expect(ivysaur.types).toEqual(['grass']);

      const venusaur = venusaurBall.pokemon;

      expect(venusaur instanceof Pokemon).toBe(true);
      expect(venusaur.id).toBe(3);
      expect(venusaur.name).toBe('venusaur');
      expect(venusaur.types).toEqual(['grass', 'poison']);
    });
  });
});
