---
layout: default
title: Usage
description: 'Usage instructions for mad-spring-connect.'
parent: Introduction
permalink: /usage
nav_order: 3
---

First we must define what a Resource means: A resource is a class
which implements the following interface:

```js
declare class BaseResource<T> {
  public id?: number;
  public save(): Promise<T>;
  public remove(): Promise<T>;
  public static one<T>(id: number, queryParams?: QueryParams): Promise<T>;
  public static findOne<T>(queryParams: QueryParams): Promise<T | null>;
  public static list<T>(queryParams?: QueryParams): Promise<T[]>;
  public static page<T>(queryParams?: QueryParams): Promise<Page<T>>;
}
```

Lets say we want to define a Pokemon resource, we do this like so:

```js
import { makeResource, Page } from 'mad-spring-connect';

class Pokemon extends makeResource('api/pokemon')<Pokemon> {
  // These are the properties of the pokemon
  id: number;
  name: string;
  types: string[];
}
```

The first argument to makeResource is a class definition, this definition
will be extended with resource features

The second argument is the 'baseUrl' to where the Resource can be found
on the REST API on the back-end.

We now have created a Pokemon Resource, lets see how we can use it.

### Retrieving a single Pokemon

To retrieve a single pokemon by its ID you do:

```js
// GET api/pokemon/1
Pokemon.one(1)
  .then((pokemon: Pokemon) => {
    // You have a single Pokemon instance here.
    console.log(pokemon);
  })
  .catch(() => {
    // Handle any errors here.
  });
```

Optionally you can add a second parameter to define
the query parameters:

```js
// GET api/pokemon/1?active=true
Pokemon.one(42, { active: true });
```

### Retrieving a list of Pokemon

To retrieve a list of pokemon you do:

```js
// GET api/pokemon?limit=10
Pokemon.list({ limit: 10 })
  .then((pokemon: Pokemon[]) => {
    // You have an array of Pokemon instances here.
    console.log(pokemon);
  })
  .catch(() => {
    // Handle any errors here.
  });
```

### Retrieving a page of Pokemon

To retrieve a [Page](http://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/Page.html) of pokemon you do:

```js
// GET api/pokemon?page=1
Pokemon.page({ page: 1 })
  .then((pokemon: Page<Pokemon>) => {
    // You have a Page of Pokemon instances here.
    console.log(pokemon);
  })
  .catch(() => {
    // Handle any errors here.
  });
```

### Searching for one Pokemon

To find a single pokemon based on query params you can call:

```js
// GET api/pokemon?name=bulbasaur
Pokemon.findOne({ name: 'bulbasaur' })
  .then((pokemon: Promise<Pokemon | null>) => {
    // You have either a Pokemon or null here
    console.log(pokemon);
  })
  .catch(() => {
    // Handle any errors here.
  });
```

### Saving / updating, removing a Pokemon

Once you have a Pokemon instance, either retrieved via 'one', 'list'
or 'page', or simply instantiated. You can save that Pokemon by calling
'save'.

It will then either creates a new Pokemon by performing a POST when the id is
empty, or updates an existing resource via a PUT request when the
id exists.

```js
// First create a pokemon, or fetch it from the remote.
const pokemon: Pokemon = new Pokemon();
pokemon.name = 'bulbasaur';
pokemon.type = ['grass', 'poison'];

// This POST to api/pokemon, with all the properties of Pokemon as the body.
pokemon.save().then(() => {
  // The pokemon instance will now have an id.
  // Because every property from the back-end response
  // is merged into the pokemon instance automatically.

  console.log(pokemon.id); // Prints "1";

  // This PUT to api/pokemon/1, with all the properties of Pokemon as the body.
  pokemon.save();

  // This will DELETE to api/pokemon/1.
  pokemon.remove().then(() => {
    // The pokemon instance will no longer have an id.

    console.log(pokemon.id); // Prints "undefined";
  });
});
```

### Adding extra methods on Pokemon

Say you want to add method which retrieves all the evolutions of a pokemon, this is how you do it:

```js
import { get, makeInstance, makeResource } from 'mad-spring-connect';

class Pokemon extends makeResource('api/pokemon')<Pokemon> {
  // shortend the definition of the pokemon class.

  evolutions: () => {
    if (this.id) {
      return get(`api/pokemon/${this.id}/evolutions`).then((list: any) => {
        return list.map((properties: JSON) => {
          return makeInstance(Pokemon, properties);
        });
      });
    } else {
      throw new Error('Cannot get evolutions for a pokemon without an id.');
    }
  }
}
```

The trick here is that you can use the **_get_** function and the **_makeInstance_** function.
These functions are the same building blocks **_makeResource_** uses under
the hood.

Note: **_makeInstance_** converts the response to actual Pokemon objects.
Without **_makeInstance_** you could not use the instance methods such
as `save` and `remove`.

See the [Utils](https://42bv.github.io/mad-spring-connect/#utils) section for more helper functions.
You should always use these functions to help you extend your resource.

### Overriding methods on Pokemon

Sometimes you will find that the default implementations do not match
your domain. For example there might be a difference between an Entity
in a List / Page or when it is retrieved alone.

In these cases you need to override **_makeResource_** and provide
your own custom implementations. **_makeResource_** will never
override a method if it already exists.

#### Overriding instance methods

You can override `save` and `remove` by simply defining them.

This example defines its own custom `save` implementation:

```js
import { makeResource, post, put, Page } from 'mad-spring-connect';
import { merge } from 'lodash';

class Pokemon extends makeResource('api/pokemon')<Pokemon> {
  id: number;
  name: string;
  types: string[];

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

// makeResource will ignore 'save' now and will keep our definition.
export default Pokemon;
```

#### Overriding static methods

You can override `one`, `list` and `page` by simply defining them.

This example defines its own custom `one` implementation:

```js

import { makeResource, get, makeInstance, Page } from 'mad-spring-connect';

// When a pokemon is retrieved in a page it has less info.
export interface PagePokemon {
  id: number,
  name: string,
};

class Pokemon extends makeResource('api/pokemon')<Pokemon> {
  id: number;
  trainer: number;
  name: string;
  types: string[];
  weakness: string[];
  stats: {
    speed: number,
    hp: number,
    defence: number,
    attack: number
  };

  /*
    Here we provide a custom implementation, which returns a PagePokemon
    instead of a Pokemon.
  */
  static page(queryParams?: object): Promise<Page<PagePokemon>>; {
    return get(baseUrl, queryParams);
  }
}

// makeResource will ignore 'page' now and will keep our definition.
export default Pokemon;
```

## Utils

These utilities are the building blocks which are used throughout this library to create the methods for the Resource's. You can use
these functions to write your own Resource methods.

### get

The **_get_** function does a GET request to the given url, with the query params if they are provided. Then gives the result to the configured middleware for processing.

For example:

```js
import { get } from 'mad-spring-connect';

get('api/pokemon', { page: 1 }).then(json => {
  // Do something with the json here
});
```

Note: that the second parameter can be left empty if you have
no query parameters.

### post

The **_post_** function does a POST request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```js
post('api/pokemon', { name: 'bulbasaur' }).then(json => {
  // Do something with the json here
});
```

### put

The **_put_** function does a PUT request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```js
put('api/pokemon/1', { id: 1, name: 'bulbasaur' }).then(json => {
  // Do something with the json here
});
```

### patch

The **_patch_** function does a PATCH request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```js
patch('api/pokemon/1', { id: 1, name: 'bulbasaur' }).then(json => {
  // Do something with the json here
});
```

### remove

The **_remove_** function does a DELETE request to the given url.
Then gives the result to the configured middleware
for processing.

```js
import { remove } from 'mad-spring-connect';

remove('api/pokemon/1').then(() => {
  // Do something here.
});
```

### makeInstance

Takes a class definition and an object of JSON properties, and
creates an instance of the provided and sets the JSON properties
as the properties of the class.

For example:

```js
import { makeInstance } from 'mad-spring-connect';

class Person {
  id: number;
  name: string;
}

test('makeInstance', () => {
  const person = makeInstance(Person, { id: 10, name: 'Maarten Hus' });

  expect(person instanceof Person).toBe(true);
  expect(person.id).toBe(10);
  expect(person.name).toBe('Maarten Hus');
});
```

# Advanced Usage

## Configuring mad-spring-connect

You can optionally configure mad-spring-connect. You can
configure two things, the middleware chain it uses and
you can set the `fetch` it uses.

```js
import { configureMadConnect, checkStatus, parseJSON } from 'mad-spring-connect';

import { authFetch } from 'redux-mad-authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON],
});
```

In the above example we configure that `fetch` will be the fetch
defined in the [redux-mad-authentication](https://github.com/42BV/redux-mad-authentication#send-a-request-with-the-csrf-token-as-the-current-user) library.

If you do not configure mad-spring-connect, it will use
window.fetch and the default middlewares.

## Middleware

All util functions which do requests are passed through a middleware layer.

Middleware is a type with the following definition:

```js
export type QueryParams = object;
export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
export type MiddlewareDetailInfo = { url: string; method: Method; queryParams?: QueryParams; payload?: object };
export type Middleware = (middleware: Promise<any>, options: MiddlewareDetailInfo) => Promise<any>;
```

Middleware is a function which takes a Promise and
returns a new promise. What happens in the middle is
what the middleware actually does.

Each middleware you configure will hook into the previous
middleware in order of definition in the configuration.

As an optional second argument you can receive the data that
was used to construct the request that was made so you can
take further actions if needed.

### Default middleware

Two middlewares are provided to you out of the box:

```js
// The first default middleware
export function checkStatus(promise: Promise<Response>): Promise<Response> {
  return promise.then((response: Response) => {
    const status = response.status;

    if (status >= 200 && status <= 299) {
      return response;
    } else {
      return Promise.reject(new ErrorWithResponse(response));
    }
  });
}

// The second default middleware
export function parseJSON(promise: Promise<Response>): Promise<any> {
  return promise.then((response: Response) => {
    if (response.status === 204) {
      return Promise.resolve({});
    }

    const contentType = response.headers.get('Content-Type');

    if (contentType === null || contentType.includes('application/json') === false) {
      throw new Error('mad-spring-connect: Content-Type is not application/json will not parse.');
    }

    return response.json();
  });
}
```

**_checkStatus_** converts all non 2xx responses to errors.

**_parseJSON_** converts a Response to a JSON object.

### Adding middleware

There are a couple of rules to define your own middleware:

1. You must keep the chain alive, so you must either then or catch
   or do both with the incoming promise.
2. When doing a 'catch' you must return a rejected promise.

Knowing these rules we can define a middleware which listens
to 400 errors and 'alerts' those errors to show them to the
user:

```js
function displayError(promise, middlewareDetailInfo) {
  return promise.catch(error => {
    if (error.response.status === 400) {
      window.alert(`An error occurred when attempting to request ${middlewareDetailInfo.url}: ${error.message}`);
    }

    // Keep the chain alive.
    return Promise.reject(error);
  });
}
```

Now all you need to do is to call `configureMadConnect` and
set the middleware:

```js
import { configureMadConnect, checkStatus, parseJSON } from 'mad-spring-connect';

import { authFetch } from 'redux-mad-authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON, displayError],
});
```

### Custom calls with applyMiddleware

You can create custom fetch operations but still apply the
configured middleware because the applyMiddleware and getFetch
functions are exposed:

```js
const promise = applyMiddleware(getFetch()(url, options), { url, method, queryParams, payload });
```

This way you can control all the options that are given to
fetch method, such as the headers or body.
