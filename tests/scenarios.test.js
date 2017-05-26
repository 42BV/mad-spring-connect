// @flow

import fetchMock from 'fetch-mock';

import * as middleware from '../src/middleware';

import { configureMadConnect } from '../src/config';

import { makeResource, get, post, makeInstance } from '../src';
import type { Page } from '../src';

// This file contains tests for common scenarios that the user
// might want to use and which we want to document.

// Test that we can add custom methods to the Resource
describe('Scenario: "custom methods"', () => {
  class Pokemon {
    id: ?number;
    name: string;
    types: Array<string>;

    save: () => Promise<Pokemon>;
    remove: () => Promise<Pokemon>;

    static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
    static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
    static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;

    // Add custom instance method
    evolutions() {
      if (this.id) {
        return get(`api/pokemon/${this.id}/evolutions`).then((list: any) => {
          return list.map((properties: JSON) => {
            return makeInstance(Pokemon, properties);
          });
        });
      }
    }

    // Add custom static method
    static evolutions(id: number) {
      return get(`api/pokemon/${id}/evolutions`).then((list: any) => {
        return list.map((properties: JSON) => {
          return makeInstance(Pokemon, properties);
        });
      });
    }

    get firstType(): ?string {
      if (this.types.length > 0) {
        return this.types[0];
      }
    }
  }

  beforeEach(() => {
    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON]
    });

    makeResource(Pokemon, 'api/pokemon');

    const response = [
      { 
        id: 1, 
        name: 'bulbasaur', 
        types: ['poison', 'grass'] 
      }, { 
        id: 2, 
        name: 'ivysaur', 
        types: ['grass'] 
      }, { 
        id: 3, 
        name: 'venusaur', 
        types: ['grass', 'poison'] 
      },
    ];
    fetchMock.get('api/pokemon/1/evolutions', response);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('instance method', async(done) => {
    const pokemon: Pokemon = new Pokemon();
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

  test('static method', async(done) => {
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
    const pokemon: Pokemon = new Pokemon();
    pokemon.types = ['grass', 'poison'];

    expect(pokemon.firstType).toBe('grass');

    pokemon.types = [];

    expect(pokemon.firstType).toBe(undefined);
  });
});

// Test that we can override methods of the Resource
describe('Scenario: "override methods"', () => {
  class Pokemon {
    id: ?number;
    name: string;
    types: Array<string>;

    save: () => Promise<Pokemon>;
    remove: () => Promise<Pokemon>;

    static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
    static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
    static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;
  }

  beforeEach(() => {  
     makeResource(Pokemon, 'api/pokemon');
  });

  test('instance method', async(done) => {
    // override instance method
    Pokemon.prototype.save = function() {
      if (this.id) {
        this.id = 42;
        return Promise.resolve(this);
      } else {
        return Promise.resolve(this);
      }
    };

    const pokemon: Pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = 'bulbasaur';
    pokemon.types = ['poison', 'grass'];

    const p = await pokemon.save();
    expect(p.id).toBe(42);

    done();
  });

  test('static method', async(done) => {
    // override instance method
    Pokemon.one = function(id: number) {
      const p = new Pokemon();
      p.id = 1337;
      return Promise.resolve(p);
    };

    const p = await Pokemon.one(1);
    expect(p.id).toBe(1337);

    done();
  });
});

// Test that we can extend methods of the Resource
describe('Scenario: "extend methods"', () => {
  class Pokemon {
    id: ?number;
    name: string;
    types: Array<string>;

    save: () => Promise<Pokemon>;
    remove: () => Promise<Pokemon>;

    static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
    static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
    static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;
  }

  beforeEach(() => {
    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON]
    });

    makeResource(Pokemon, 'api/pokemon');
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('instance method', async(done) => {
    // extend instance method
    const originalSave = Pokemon.prototype.save;

    Pokemon.prototype.save = function() {
      return originalSave.apply(this).then((pokemon) => {
        pokemon.id = 1337;
        return pokemon;
      });
    };

    const response = { 
      id: 1, 
      name: 'bulbasaur', 
      types: ['poison', 'grass']
    };

    fetchMock.put('api/pokemon/1', response);

    const pokemon: Pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = 'bulbasaur';
    pokemon.types = ['poison', 'grass'];

    const p = await pokemon.save();

    expect(pokemon.id).toBe(1337);

    done();
  });

  test('static method', async(done) => {
    const originalOne = Pokemon.one;

    // extend instance method
    Pokemon.one = function(...args) {
      return originalOne(...args).then((pokemon) => {
        pokemon.id = 42;
        return pokemon;
      });
    };

    const response = { 
      id: 1, 
      name: 'bulbasaur', 
      types: ['poison', 'grass']
    };

    fetchMock.get('api/pokemon/1', response);

    const p = await Pokemon.one(1);
    expect(p.id).toBe(42);

    done();
  });
});

// Test that we can override middleware
test('Scenario: "custom success middleware"', async (done) => {
  let finished = false;

  class Pokemon {
    id: ?number;
    name: string;
    types: Array<string>;

    save: () => Promise<Pokemon>;
    remove: () => Promise<Pokemon>;

    static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
    static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
    static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;
  }

  function customMiddleware(promise) {
    return promise.then((response) => {
      return response.json();
    }).then((envelope) => {
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
    middleware: [customMiddleware]
  });

  makeResource(Pokemon, 'api/pokemon');

  const response = {
    statusCode: 200,
    data: { id: 1 },
    error: {}
  };
  fetchMock.get('api/pokemon/1', response);

  const pokemon = await Pokemon.one(1);
  expect(pokemon).toEqual({ id: 1 });

  fetchMock.restore();

  expect(finished).toBe(true);

  done();
});

// Test that we can override middleware
test('Scenario: "custom error middleware"', async(done) => {
  class Pokemon {
    id: ?number;
    name: string;
    types: Array<string>;

    save: () => Promise<Pokemon>;
    remove: () => Promise<Pokemon>;

    static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
    static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
    static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;
  }

  const showError = jest.fn();

  function customMiddleware(promise) {
    return promise.catch((error) => {
      showError(error.message);
      return Promise.reject(error);
    }); 
  }

  configureMadConnect({
    fetch: undefined,
    middleware: [middleware.checkStatus, middleware.parseJSON, customMiddleware]
  });

  makeResource(Pokemon, 'api/pokemon');
  
  fetchMock.get('api/pokemon/1', { status: 400 });

  try {
     await Pokemon.one(1);
  } catch(error) {
    expect(showError).toHaveBeenCalledTimes(1);
    expect(showError).toHaveBeenCalledWith('Bad Request');

    expect()


    fetchMock.restore();
    done();
  }
});