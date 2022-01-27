import mockAxios from 'jest-mock-axios';

import { get, makeInstance } from '../src';
import { makeResource } from '../src/resource';

// This file contains tests for common scenarios that the user
// might want to use and which we want to document.

// Test that we can add custom methods to the Resource
describe('Scenario: "custom methods"', () => {
  // Make sure each test can get a completely new class, and
  // test that Config can be an object with only a baseUrl and
  // no mapper.
  class Pokemon extends makeResource<Pokemon>({ baseUrl: '/api/pokemon' }) {
    public id?: number;
    public name!: string;
    public types!: string[];

    public async evolutions(): Promise<Pokemon[]> {
      if (this.id) {
        const list = await get(`api/pokemon/${this.id}/evolutions`);
        // @ts-expect-error Type of list is not unknown
        return list.map((properties) => makeInstance(Pokemon, properties));
      }

      return Promise.resolve([]);
    }

    // Add custom static method
    public static async evolutions(id: number): Promise<Pokemon[]> {
      const list = await get(`api/pokemon/${id}/evolutions`);
      // @ts-expect-error Type of list is not unknown
      return list.map((properties: JSON) => makeInstance(Pokemon, properties));
    }

    public get firstType(): string | undefined {
      if (this.types.length > 0) {
        return this.types[0];
      }

      return undefined;
    }
  }

  beforeEach(() => {
    mockAxios.get.mockResolvedValueOnce({
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
      ]
    });
  });

  afterEach(() => {
    mockAxios.reset();
  });

  test('instance method', async () => {
    expect.assertions(13);

    const pokemon = new Pokemon();
    pokemon.id = 1;

    const pokemonList = await pokemon.evolutions();

    if (pokemonList) {
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
    }
  });

  test('static method', async () => {
    expect.assertions(13);

    const pokemonList = await Pokemon.evolutions(1);

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

  test('getter method', () => {
    const pokemon = new Pokemon();
    pokemon.types = ['grass', 'poison'];

    expect(pokemon.firstType).toBe('grass');

    pokemon.types = [];

    expect(pokemon.firstType).toBe(undefined);
  });
});

// Test that we can override methods of the Resource
describe('Scenario: "override methods"', () => {
  describe('instance methods', () => {
    test('save', async () => {
      expect.assertions(1);

      class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
        public id?: number;
        public name!: string;
        public types!: string[];

        // override instance method
        public save(): Promise<Pokemon> {
          if (this.id) {
            this.id = 42;
            return Promise.resolve(this);
          } else {
            return Promise.resolve(this);
          }
        }
      }

      const pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.save();
      expect(p.id).toBe(42);
    });

    test('remove', async () => {
      expect.assertions(1);

      class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
        public id?: number;
        public name!: string;
        public types!: string[];

        // override instance method
        public remove(): Promise<Pokemon> {
          if (this.id) {
            this.id = 42;
            return Promise.resolve(this);
          } else {
            return Promise.resolve(this);
          }
        }
      }

      const pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.remove();
      expect(p.id).toBe(42);
    });
  });

  describe('static methods', () => {
    test('one', async () => {
      expect.assertions(2);

      class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
        public id?: number;
        public name!: string;
        public types!: string[];

        // override static method
        public static one(id: number): Promise<any> {
          expect(id).toBe(1);

          const p = new Pokemon();
          p.id = 1337;
          return Promise.resolve(p);
        }
      }

      const p = await Pokemon.one(1);
      expect(p.id).toBe(1337);
    });

    test('list', async () => {
      expect.assertions(1);

      class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
        public id?: number;
        public name!: string;
        public types!: string[];

        // override static method
        public static list(): Promise<any> {
          const p = new Pokemon();
          p.id = 1337;
          return Promise.resolve(p);
        }
      }

      const p = await Pokemon.list();
      expect(p.id).toBe(1337);
    });

    test('page', async () => {
      expect.assertions(1);

      class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
        public id?: number;
        public name!: string;
        public types!: string[];

        // override static method
        public static page(): Promise<any> {
          const p = new Pokemon();
          p.id = 1337;
          return Promise.resolve(p);
        }
      }

      const p = await Pokemon.page();
      expect(p.id).toBe(1337);
    });
  });
});

// Test that we can extend methods of the Resource
describe('Scenario: "extend methods"', () => {
  class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
    public id?: number;
    public name!: string;
    public types!: string[];
  }

  afterEach(() => {
    mockAxios.reset();
  });

  test('instance method', async () => {
    expect.assertions(1);

    // extend instance method
    const originalSave = Pokemon.prototype.save;

    Pokemon.prototype.save = function () {
      return originalSave.apply(this).then((pokemon) => {
        pokemon.id = 1337;
        return pokemon;
      });
    };

    const pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = 'bulbasaur';
    pokemon.types = ['poison', 'grass'];

    const request = pokemon.save();

    const response = {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      data: {
        id: 1,
        name: 'bulbasaur',
        types: ['poison', 'grass']
      }
    };

    mockAxios.mockResponseFor('/api/pokemon/1', response);

    await request;

    expect(pokemon.id).toBe(1337);
  });

  test('static method', async () => {
    expect.assertions(1);

    const originalOne = Pokemon.one;
    Pokemon.one = async function (id: number): Promise<Pokemon> {
      const pokemon = await originalOne.bind(Pokemon)(id);
      pokemon.id = 42;
      return pokemon;
    };

    mockAxios.get.mockResolvedValueOnce({
      id: 1,
      name: 'bulbasaur',
      types: ['poison', 'grass']
    });

    const p = await Pokemon.one(1);

    expect(p.id).toBe(42);
  });
});

test('Scenario: check that the ID can be any type', async () => {
  expect.assertions(1);

  class Pokemon extends makeResource<Pokemon, string>('/api/pokemon') {
    public id?: string;
    public name!: string;
    public types!: string[];
  }

  const pokemon = new Pokemon();

  // This should now work because the type of ID is now a string.
  pokemon.id = 'a-unique-uu-id-for-example';
  pokemon.name = 'bulbasaur';
  pokemon.types = ['poison', 'grass'];

  const request = pokemon.save();

  const response = {
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    data: {
      id: 'a-unique-uu-id-for-example',
      name: 'bulbasaur',
      types: ['poison', 'grass']
    }
  };

  mockAxios.mockResponseFor(
    '/api/pokemon/a-unique-uu-id-for-example',
    response
  );

  await request;

  expect(pokemon.id).toBe('a-unique-uu-id-for-example');
});
