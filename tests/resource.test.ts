import mockAxios from 'jest-mock-axios';
import { makeResource } from '../src/resource.js';
import { makeInstance } from '../src/utils.js';

describe('Resource', () => {
  type PokemonResult = {
    id: number;
    name: string;
    types: string[];
  };

  class Trainer extends makeResource<Trainer>({ baseUrl: '/api/trainer' }) {
    public id?: number;
    public name!: string;
  }

  class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
    public id?: number;
    public name!: string;
    public types!: string[];
  }

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

  afterEach(() => {
    mockAxios.reset();
  });

  describe('save', () => {
    test('create', async () => {
      expect.assertions(6);

      const pokemon = new Pokemon();

      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const request = pokemon.save();

      const response = {
        data: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.post).toBeCalledTimes(1);

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('update', async () => {
      expect.assertions(6);

      const pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const request = pokemon.save();

      const response = {
        data: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokemon/1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.put).toBeCalledTimes(1);

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });
  });

  describe('remove', () => {
    test('has id', async () => {
      expect.assertions(7);

      const pokemon = new Pokemon();

      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const request = pokemon.remove();

      mockAxios.mockResponseFor('/api/pokemon/1', {
        status: 204,
        data: ''
      });

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.delete).toBeCalledTimes(1);
      expect(mockAxios.delete).toBeCalledWith('/api/pokemon/1');

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(undefined);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('does not have id', async () => {
      expect.assertions(2);

      const pokemon = new Pokemon();
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      try {
        await pokemon.remove();
      } catch (error: any) {
        expect(error.message).toBe(
          'Cannot remove a Resource which has no id, this is a programmer error.'
        );
        expect(mockAxios.delete).toBeCalledTimes(0);
      }
    });
  });

  describe('one', () => {
    test('without query params', async () => {
      expect.assertions(7);

      const request = Pokemon.one(1);

      const response = {
        data: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokemon/1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon/1');

      const pokemon = await request;

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with query params', async () => {
      expect.assertions(7);

      const request = Pokemon.one(1, { number: 42 });

      const response = {
        data: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokemon/1?number=42', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon/1?number=42');

      const pokemon = await request;

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with id which is a string', async () => {
      expect.assertions(7);

      const request = Pokemon.one('1');

      const response = {
        data: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokemon/1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon/1');

      const pokemon = await request;

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with custom mapper', async () => {
      expect.assertions(10);

      const request = Pokeball.one(1);

      const response = {
        data: {
          id: 1,
          pokemon: {
            id: 1,
            name: 'bulbasaur',
            types: ['poison', 'grass']
          }
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokeball/1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokeball/1');

      const pokeball = await request;

      expect(pokeball instanceof Pokeball).toBe(true);
      expect(pokeball.id).toBe(1);
      expect(pokeball.retrievedAt instanceof Date).toBe(true);

      const pokemon = pokeball.pokemon;

      expect(pokemon instanceof Pokemon).toBe(true);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('bulbasaur');
      expect(pokemon.types).toEqual(['poison', 'grass']);
    });

    test('with default mapper', async () => {
      expect.assertions(6);

      const request = Trainer.one(1);

      const response = {
        data: {
          id: 1,
          name: 'Ash'
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/trainer/1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/trainer/1');

      const trainer = await request;

      expect(trainer instanceof Trainer).toBe(true);
      expect(trainer.id).toBe(1);
      expect(trainer.name).toBe('Ash');
    });
  });

  describe('findOne', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function expectPokemonFindOneUndefined(response: {
      data: any;
      headers: { [key: string]: string };
    }) {
      const request = Pokemon.findOne({ name: 'bulbasaur' });

      mockAxios.mockResponseFor('/api/pokemon?name=bulbasaur', response);

      await expect(request).resolves.toBeUndefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon?name=bulbasaur');

      const pokemon = await request;

      expect(pokemon).toBe(undefined);
    }

    test('when response is an empty object', async () => {
      expect.assertions(4);

      await expectPokemonFindOneUndefined({
        data: {},
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    });

    test('when response is an empty array', async () => {
      expect.assertions(4);

      await expectPokemonFindOneUndefined({
        data: [],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    });

    test('when response is a filled array', async () => {
      expect.assertions(4);

      await expectPokemonFindOneUndefined({
        data: [1, 2, 3],
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    });

    test('when resource exists', async () => {
      expect.assertions(7);

      const request = Pokemon.findOne({ name: 'bulbasaur' });

      const response = {
        data: {
          id: 1,
          name: 'bulbasaur',
          types: ['poison', 'grass']
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokemon?name=bulbasaur', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon?name=bulbasaur');

      const pokemon = await request;

      if (pokemon) {
        expect(pokemon instanceof Pokemon).toBe(true);
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('bulbasaur');
        expect(pokemon.types).toEqual(['poison', 'grass']);
      }
    });

    test('with custom mapper', async () => {
      expect.assertions(10);

      const request = Pokeball.findOne({ name: 'bulbasaur' });

      const response = {
        data: {
          id: 1,
          pokemon: {
            id: 1,
            name: 'bulbasaur',
            types: ['poison', 'grass']
          }
        },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };

      mockAxios.mockResponseFor('/api/pokeball?name=bulbasaur', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokeball?name=bulbasaur');

      const pokeball = await request;

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
      expect.assertions(16);

      const request = Pokemon.list();

      const response = {
        data: [
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
      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon');

      const pokemonList = await request;

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
      expect.assertions(16);

      const request = Pokemon.list({ filter: true });

      const response = {
        data: [
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
      mockAxios.mockResponseFor('/api/pokemon?filter=true', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon?filter=true');

      const pokemonList = await request;

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
      expect.assertions(25);

      const request = Pokeball.list();

      const response = {
        data: [
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
      mockAxios.mockResponseFor('/api/pokeball', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokeball');

      const pokeballList = await request;

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
      expect.assertions(16);

      const request = Pokemon.page();

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
        data: {
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

      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon');

      const pokemonPage = await request;

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
      expect.assertions(16);

      const request = Pokemon.page({ page: 1 });

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
        data: {
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

      mockAxios.mockResponseFor('/api/pokemon?page=1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokemon?page=1');

      const pokemonPage = await request;

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
      expect.assertions(25);

      const request = Pokeball.page({ page: 1 });

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
        data: {
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

      mockAxios.mockResponseFor('/api/pokeball?page=1', response);

      await expect(request).resolves.toBeDefined();
      expect(mockAxios.get).toBeCalledTimes(1);
      expect(mockAxios.get).toBeCalledWith('/api/pokeball?page=1');

      const pokeballPage = await request;

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
