---
layout: guide
title: Resources
description: 'Usage instructions for @42.nl/spring-connect.'
parent: Deprecated
permalink: /resource
---

## 1. What is a resource?

First we must define what a Resource means: A resource is a class
which extends the following class:

```ts
export declare class Resource<T> {
  public id?: number;
  public save(): Promise<T>;
  public remove(): Promise<T>;
  public static one<T>(id: number | string, queryParams?: QueryParams): Promise<T>;
  public static findOne<T>(queryParams: QueryParams): Promise<T | void>;
  public static list<T>(queryParams?: QueryParams): Promise<T[]>;
  public static page<T>(queryParams?: QueryParams): Promise<Page<T>>;
}
```

Lets say we want to define a Pokemon resource, we would go about it in the following way:

```ts
import { makeResource, Page } from '@42.nl/spring-connect';

export default class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
  /* 
    These are the properties of the pokemon which it has when it is
    fetched from the back-end. Note that `!`, TypeScript needs this
    to accept that the properties will be there once the resource
    is loaded.

    When creating a `new Pokemon` all properties will actually be
    empty. But this is a nice trade-off to prevent the programmer
    from having to do excessive null checks.
  */

  id!: number;
  name!: string;
  types!: string[];
}
```

The argument to `makeResource` is the `baseUrl` used to fetch the Resource' data from the REST API.

## 2. Adding a custom mapper

By default every JSON which is received by the `one`, `findOne`, `page`
and `list` is mapped by this function:

```ts
function defaultMapper<T>(json: JSON, Class: { new (): T }): T {
  return makeInstance(Class, json);
}
```

It simply makes an instance of the class by calling the `makeInstance`
util function with the retrieved JSON.

Sometimes you want to override the default mapper, in the example
below we create a `Pokeball` which contains a pokemon. What we want
is to make the pokemon an actual instance of `Pokemon`. We also want
to store the time of retrieval from the back-end.

```ts
class Pokeball extends makeResource<Pokeball>({
  baseUrl: '/api/pokeball',
  mapper: pokeballMapper,
}) {
  public id?: number;

  /*
    In the actual JSON response pokemon is simply an object.
    But our custom mapper makes sure it will also get mapped.
  */
  public pokemon!: Pokemon;

  /* 
    Does not really exist on the back-end but is filled by the
    custom mapper.
  */
  public retrievedAt!: Date;
}

function pokeballMapper(json: any, Class: { new (): Pokeball }): Pokeball {
  const pokeball = makeInstance(Class, json);
  /* Add a completely new field */
  pokeball.retrievedAt = new Date();

  /* Make the fetched pokemon an actual instance of Pokemon */
  pokeball.pokemon = makeInstance(Pokemon, pokeball.pokemon);

  return pokeball;
}
```

A custom mapper is useful for when the mapping for `one`, `findOne`, `page`
and `list` is exactly the same. If they differ you should instead create
custom methods instead, as explained below.

## 3. Adding custom methods on Pokemon

For most situations the default Resource will work just fine, but sometimes you do want to extend and/or customize the available methods from `makeResource`.

The trick here is that this library exposes the same building
blocks that **_makeResource_** uses under the hood. You can use these
building blocks to easily create your own custom methods.

See the [Utils](https://42bv.github.io/mad-spring-connect/utils) section for the
helper functions. It is recommended that you use these functions to help you customize your Resource.

### 3.1 Adding instance methods

Say you want to add method which retrieves all the evolutions of a Pokémon,
this is how you do it:

```ts
import { get, makeInstance, makeResource } from '@42.nl/spring-connect';

const baseUrl = '/api/pokemon';

class Pokemon extends makeResource<Pokemon>(baseUrl) {
  /* shortend the definition of the pokemon class. */

  async evolutions(): Promise<Pokemon[]> {
    if (this.id) {
      /* `get` does a GET request  */
      const list = await get(`${baseUrl}/${this.id}/evolutions`);
      return list.map((properties: JSON) => {
        /* Convert to Pokemon instances */
        return makeInstance(Pokemon, properties);
      });
    }

    return Promise.resolve([]);
  }
}
```

Now you can use it in the following way:

```ts
const bulbasaur = await pokemon.one(1);
const evolutions = await pokemon.evolutions();
```

### 3.2 Adding static methods

You could also solve this problem with a static method:

```ts
import { get, makeInstance, makeResource } from '@42.nl/spring-connect';

const baseUrl = '/api/pokemon';

class Pokemon extends makeResource<Pokemon>(baseUrl) {
  /* shortend the definition of the pokemon class. */

  static async evolutions(id: number): Promise<Pokemon[]> {
    /* `get` does a GET request */
    const list = await get(`${baseUrl}/${id}/evolutions`);
    return list.map((properties: JSON) => {
      /* Convert to Pokemon instances */
      return makeInstance(Pokemon, properties);
    });
  }
}
```

Which you could use like this:

```ts
const evolutions = await Pokemon.evolutions(1);
```

## 4. Overriding methods on Pokemon

Sometimes you will find that the default implementations does not match
your domain. For example there might be a difference between an Entity
in a List / Page or when it is retrieved alone.

### 4.1 Overriding instance methods

You can override `save` and `remove` by simply defining them.

This example defines its own custom `save` implementation:

```ts
import { makeResource, post, put, Page } from '@42.nl/spring-connect';
import { merge } from 'lodash';

const baseUrl = '/api/pokemon';

export default class Pokemon extends makeResource<Pokemon>(baseUrl) {
  id!: number;
  trainer!: number;
  name!: string;
  types!: string[];
  weakness!: string[];

  /*
    Here we provide a custom implementation, which always creates
    a new pokemon, and never updates one.
  */
  save(): Promise<Pokemon> {
    return post(baseUrl, this).then((json: any) => {
      return merge(this, json);
    });
  }
}
```

### 4.2 Overriding static methods

You can override `one`, `findOne`, `list` and `page` by simply defining them.

This example defines its own custom `page` implementation:

```ts
import { makeResource, get, makeInstance, Page, QueryParams } from '@42.nl/spring-connect';

/* When a pokemon is retrieved in a page it has less info. */
export type PagePokemon = {
  id: number;
  name: string;
}

const baseUrl = '/api/pokemon';

export default class Pokemon extends makeResource<Pokemon>(baseUrl) {
  id!: number;
 
  name!: string;
  types!: string[];
  weakness!: string[];

  /*
    Here we provide a custom implementation, which returns a PagePokemon
    instead of a Pokemon.
  */
  static page<PagePokemon>(queryParams?: QueryParams): Promise<Page<PagePokemon>> {
    return get(baseUrl, queryParams);
  }
}
```

## 5. Changing the type of type id field.

You can change the type of the id field by supplying a second generic
parameter to `makeResource`:

```ts

const baseUrl = '/api/pokemon';

class Pokemon extends makeResource<Pokemon, string>(baseUrl) {
  public id?: string;
  public name!: string;
  public types!: string[];
}

const pokemon = new Pokemon();

// This should now work because the type of ID is now a string.
pokemon.id = 'a-unique-uu-id-for-example';
pokemon.name = 'bulbasaur';
pokemon.types = ['poison', 'grass'];

await pokemon.save();

```

## 6 Retrieving a single Pokemon

The `one` method is used to retrieve a single Pokémon by its ID:

```ts
/* GET api/pokemon/1 */
const bulbasaur = await Pokemon.one(1);
```

Optionally you can add a second parameter to define
the query parameters:

```ts
/* GET api/pokemon/1?active=true */
const bulbasaur = await Pokemon.one(42, { active: true });
```

## 7 Searching for one Pokemon

The `findOne` method is used to retrieve a single Pokémon based
on query params:

```ts
/* GET api/pokemon?name=bulbasaur */
const bulbasaur = await Pokemon.findOne({ name: 'bulbasaur' });
```

Use when you want to find entities which do not have an ID, rr when
you only want to find a single entity by a custom predicate.

## 8 Retrieving a page of Pokemon

The `page` method is used to retrieve a [Page](http://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/Page.html) of Pokémon:

```ts
/* GET api/pokemon?page=1 */
const page = await Pokemon.page({ page: 1 });
```

## 9 Retrieving a list of Pokemon

> We recommended using the `page` method whenever possible as it gives you more flexibility and is more memory efficient.

The `list` method is used to retrieve a list of Pokémon:

```ts
/* GET api/pokemon?limit=10 */
const pokemons = await Pokemon.list({ limit: 10 });
```

Useful when retrieving a fixed set of data with limited items.

## 10 Page vs List

Prefer `page` over `list` when possible because it is more memory efficient
to load only a single slice of the data at a time.

It must also be noted that it is very unlikely that a REST endpoint
supports both `page` and `list` at the same time. So use the variant
which your back-end exposes.

## 11 A CRUD scenario

Once you have a `Pokemon` instance, either retrieved via `one`, `list`
or `page`, or simply instantiated. You can save that Pokemon by calling
`save`.

It will then either creates a new Pokemon by performing a `POST` when the id is
empty, or updates an existing resource via a `PUT` request when the
id exists.

```ts
/* 
  First create a pokemon by creating a new instance. 
  Or alternatively fetch the pokemon using `one`.
*/
const pokemon = new Pokemon();
pokemon.name = 'bulbasaur';
pokemon.type = ['grass', 'poison'];

/* This POST to api/pokemon, with all the properties of Pokemon as the body. */
pokemon.save().then(() => {
  /* 
    The pokemon instance will now have an ID.
    Because every property from the back-end response
    is merged into the pokemon instance automatically.
    This MUTATES the pokemon instance!
  */

  console.log(pokemon.id); // Prints "1";

  /* This PUT to api/pokemon/1, with all the properties of Pokemon as the body. */
  pokemon.save();

  /* This will DELETE to api/pokemon/1. */
  pokemon.remove().then(() => {
    /* 
      The pokemon instance will no longer have an id because
      `remove` will delete the `id` MUTATING the pokemon.
    */

    console.log(pokemon.id); /* Prints "undefined"; */
  });
});
```

## 12 Uploading

When uploading files it is important to know that `post`, `put` and
`patch` support `FormData` as the payload argument.

Often it is easiest when `uploading` to simply create a static
method called `save` which can take a form to upload.

Here is an example of a form, it contains sprites which are
either Files or urls as a string:

```ts
export type PokemonFormData = {
  id?: number;
  name: string;

  spriteFront: string | File;
  spriteBack: string | File;
}
```

Heres a `static` `save` method on the `Pokemon` resource that
creates a `multipart/form-data;` request.

```ts
import { makeResource, post, put } from '@42.nl/spring-connect';

const baseUrl = '/api/pokemon';

export default class Pokemon extends makeResource<Pokemon>(baseUrl) {
  id!: number;
  name!: string;

  spriteFront!: string;
  spriteBack!: string;

  /* This save either POST's a new pokemon, or PUTS to an existing one. */
  static save(pokemonForm: PokemonFormData): Promise<Pokemon> {
    /* The formData will contain the pokemon and optionally the two sprites. */
    const formData = new FormData();

    /* If there is a front sprite File add it to the formData. */
    if (pokemonForm.spriteFront instanceof File) {
      formData.append('front', new Blob([pokemonForm.spriteFront]));
    }

    /* If there is a back sprite File add it to the formData. */
    if (pokemonForm.spriteBack instanceof File) {
      formData.append('back', new Blob([pokemonForm.spriteBack]));
    }

    /* Now remove the sprites */
    delete pokemonForm.spriteFront;
    delete pokemonForm.spriteBack;

    /* Append the pokemon blob. */
    const pokemon = new Blob([JSON.stringify(pokemonForm)], {
      type: 'application/json',
    });
    formData.append('pokemon', pokemon);

    /* POST on create, PUT on edit. */
    const method = pokemonForm.id ? put : post;

    const url = pokemonForm.id ? `${baseUrl}/${pokemonForm.id}` : baseUrl;

    /* 
      Finally send the `multipart/form-data;` which has three entries:
      the front sprite, back sprite, and the pokemon data.
    */
    return method(url, formData);
  }
}
```
