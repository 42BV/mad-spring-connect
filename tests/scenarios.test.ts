import fetchMock from 'fetch-mock';

import * as middleware from '../src/middleware';
import { configureMadConnect } from '../src/config';
import { get, makeInstance } from '../src';
import { QueryParams } from '../src/request';
import { makeResource } from '../src/resource';

// This file contains tests for common scenarios that the user
// might want to use and which we want to document.

// Test that we can add custom methods to the Resource
describe('Scenario: "custom methods"', () => {
  // Make sure each test can get a completely new class
  class Pokemon extends makeResource('api/pokemon')<Pokemon> {

    public id?: number;
    public name!: string;
    public types!: string[];

    public async evolutions(): Promise<Pokemon[]> {
      if (this.id) {
        const list = await get(`api/pokemon/${this.id}/evolutions`);
        return list.map((properties: JSON) => makeInstance(Pokemon, properties));
      }

      return Promise.resolve([]);
    }

    // Add custom static method
    public static async evolutions(id: number): Promise<Pokemon[]> {
      const list = await get(`api/pokemon/${id}/evolutions`);
      return list.map((properties: JSON) => {
        return makeInstance(Pokemon, properties);
      });
    }

    public get firstType(): string | undefined {
      if (this.types.length > 0) {
        return this.types[0];
      }

      return undefined;
    }
  }

  beforeEach(() => {
    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON],
    });

    const response = {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
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
    };
    fetchMock.get('api/pokemon/1/evolutions', response);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('instance method', async done => {
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

      done();
    }
  });

  test('static method', async done => {
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

    done();
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
    test('save', async done => {
      class Pokemon extends makeResource('api/pokemon')<Pokemon> {

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

      const pokemon: Pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.save();
      expect(p.id).toBe(42);

      done();
    });

    test('remove', async done => {
      class Pokemon extends makeResource('api/pokemon')<Pokemon> {

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

      const pokemon: Pokemon = new Pokemon();
      pokemon.id = 1;
      pokemon.name = 'bulbasaur';
      pokemon.types = ['poison', 'grass'];

      const p = await pokemon.remove();
      expect(p.id).toBe(42);

      done();
    });
  });

  describe('static methods', () => {
    test('one', async done => {
      class Pokemon extends makeResource('api/pokemon')<Pokemon> {

        public id?: number;
        public name!: string;
        public types!: string[];

        // override static method
        public static one(id: number, queryParams?: QueryParams): Promise<any> {
          const p = new Pokemon();
          p.id = 1337;
          return Promise.resolve(p);
        }
      }

      const p = await Pokemon.one(1);
      expect(p.id).toBe(1337);

      done();
    });

    test('list', async done => {
      class Pokemon extends makeResource('api/pokemon')<Pokemon> {

        public id?: number;
        public name!: string;
        public types!: string[];

        // override static method
        public static list(queryParams?: QueryParams): Promise<any> {
          const p = new Pokemon();
          p.id = 1337;
          return Promise.resolve(p);
        }
      }

      const p = await Pokemon.list();
      expect(p.id).toBe(1337);

      done();
    });

    test('page', async done => {
      class Pokemon extends makeResource('api/pokemon')<Pokemon> {

        public id?: number;
        public name!: string;
        public types!: string[];

        // override static method
        public static page(queryParams?: QueryParams): Promise<any> {
          const p = new Pokemon();
          p.id = 1337;
          return Promise.resolve(p);
        }
      }

      const p = await Pokemon.page();
      expect(p.id).toBe(1337);

      done();
    });
  });
});

// Test that we can extend methods of the Resource
describe('Scenario: "extend methods"', () => {
  class Pokemon extends makeResource('api/pokemon')<Pokemon> {

    public id?: number;
    public name!: string;
    public types!: string[];
  }

  beforeEach(() => {
    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON],
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('instance method', async done => {
    // extend instance method
    const originalSave = Pokemon.prototype.save;

    Pokemon.prototype.save = function() {
      return originalSave.apply(this).then(pokemon => {
        pokemon.id = 1337;
        return pokemon;
      });
    };

    const response = {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: {
        id: 1,
        name: 'bulbasaur',
        types: ['poison', 'grass'],
      },
    };

    fetchMock.put('api/pokemon/1', response);

    const pokemon: Pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = 'bulbasaur';
    pokemon.types = ['poison', 'grass'];

    await pokemon.save();
    expect(pokemon.id).toBe(1337);

    done();
  });

  test('static method', async done => {
    const originalOne = Pokemon.one;
    Pokemon.one = async function(id: number): Promise<any> {
      const pokemon: Pokemon = await originalOne.bind(Pokemon)(id);
      pokemon.id = 42;
      return pokemon;
    };

    const response = {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: {
        id: 1,
        name: 'bulbasaur',
        types: ['poison', 'grass'],
      },
    };

    fetchMock.get('api/pokemon/1', response);

    const p: Pokemon = await Pokemon.one(1);
    expect(p.id).toBe(42);

    done();
  });
});

// Test that we can override middleware
test('Scenario: "custom success middleware"', async done => {
  let finished = false;

  class Pokemon extends makeResource('api/pokemon')<Pokemon> {

    public id?: number;
    public name!: string;
    public types!: string[];
  }

  function customMiddleware(promise: Promise<any>): Promise<any> {
    return promise
      .then(response => {
        return response.json();
      })
      .then(envelope => {
        if (envelope.statusCode === 200) {
          finished = true;
          return envelope.data;
        } else {
          return envelope.error;
        }
      });
  }

  configureMadConnect({
    fetch: undefined,
    middleware: [customMiddleware],
  });

  const response = {
    statusCode: 200,
    data: { id: 1 },
    error: {},
  };
  fetchMock.get('api/pokemon/1', response);

  const pokemon = await Pokemon.one(1);
  expect(pokemon).toEqual({ id: 1 });

  fetchMock.restore();

  expect(finished).toBe(true);

  done();
});

// Test that we can override middleware
test('Scenario: "custom error middleware"', async done => {
  class Pokemon extends makeResource('api/pokemon')<Pokemon> {

    public id?: number;
    public name!: string;
    public types!: string[];
  }

  const showError = jest.fn();

  function customMiddleware(promise: Promise<any>): Promise<any> {
    return promise.catch(error => {
      showError(error.message);
      return Promise.reject(error);
    });
  }

  configureMadConnect({
    fetch: undefined,
    middleware: [middleware.checkStatus, middleware.parseJSON, customMiddleware],
  });

  fetchMock.get('api/pokemon/1', { status: 400 });

  try {
    await Pokemon.one(1);
  } catch (error) {
    expect(showError).toHaveBeenCalledTimes(1);
    expect(showError).toHaveBeenCalledWith('Bad Request');

    fetchMock.restore();
    done();
  }
});
