---
layout: default
---

# About

This library makes it easy to create Resource to connect to a [Spring MVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/html/mvc.html) back-end.

## Installation

To install the library simply perform an npm install:

`npm install mad-spring-connect --save`

## Philosophy

The idea of this library is not to provide you with a cookie cutter
way of defining resources, but instead make it easy to define your own
type of resource, ***in code***.

The reason for this is simple: every resource is different, every resource
has its own properties and extra methods. Trying to catch all these
differences via a *configuration* based API is ***impossible***. Using
code is more natural and easier to understand.

Therefore 'mad-spring-connect' allows you to define a Resource, with
some bells and whistles, but allows you to customize it in code.

## Getting started.

First we must define what a Resource means: A resource is a class
which implements the following interface:

```js
export interface Resource<T> {
  id: ?number;
  
  save(): Promise<T>;
  remove(): Promise<T>;

  static one(id: number, queryParams: ?Object): Promise<T>;
  static list(queryParams: ?Object): Promise<Array<T>>;
  static page(queryParams: ?Object): Promise<Page<T>>;
}
```

Lets say we have a simple Domain Entity called Pokemon which implements the Resource Interface.

```js
class Pokemon {
  id: ?number;
  name: string;
  types: Array<string>;

  save: () => Promise<Pokemon>;
  remove: () => Promise<Pokemon>;

  static one: (id: number, queryParams: ?Object) => Promise<Pokemon>;
  static list: (queryParams: ?Object) => Promise<Array<Pokemon>>;
  static page: (queryParams: ?Object) => Promise<Page<Pokemon>>;

  get primaryType(): ?string {
    if (this.types.length > 1) {
      return this.types[0];
    } else {
      return undefined;
    }
  }
}
```

We want to turn this into a Resource, we do this like so:

```js
import { makeResource } from 'mad-spring-connect';

makeResource(Pokemon, 'api/pokemon');

export default Pokemon;
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
Pokemon.one(1).then((pokemon: Pokemon) => {
  // You have a single Pokemon instance here.
  console.log(pokemon);
}).catch(() => {
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
Pokemon.list({ limit: 10 }).then((pokemon: Array<Pokemon>) => {
  // You have an array of Pokemon instances here.
  console.log(pokemon);
}).catch(() => {
  // Handle any errors here.
});
```

### Retrieving a page of Pokemon

To retrieve a [Page](http://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/Page.html) of pokemon you do:

```js
// GET api/pokemon?page=1
Pokemon.page({ page: 1 }).then((pokemon: Page<Pokemon>) => {
  // You have a Page of Pokemon instances here.
  console.log(pokemon);
}).catch(() => {
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
});

console.log(pokemon.id); // Prints "1";

// This PUT to api/pokemon/1, with all the properties of Pokemon as the body.
pokemon.save();

// This will DELETE to api/pokemon/1.
pokemon.remove().then(() => {
  // The pokemon instance will no longer have an id.
});
```

### Adding extra methods on Pokemon

Say you want to add method which retrieves all the evolutions of a pokemon, this is how you do it:

```js
import { get, makeInstance } from 'mad-spring-connect';

class Pokemon {
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

The trick here is that you can use the ***get*** function and the ***makeInstance*** functions, which are the same building blocks for this library, to create your own custom methods.

## Utils

These utilities are the building blocks which are used throughout this library to create the methods for the Resource's. You can use
these functions to write your own Resource methods.

### get

The ***get*** function does a GET request to the given url, with the query params if they are provided. Then gives the result to the configured middleware for processing.

For example:

```js
import { get } from 'mad-spring-connect';

get('api/pokemon/1', { page: 1 }).then((json) => {
  // Do something with the json here
});
```

Note: that the second parameter can be left empty if you have
no query parameters.

### post

The ***post*** function does a POST request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```js
post('api/pokemon', { name: "bulbasaur" }).then((json) => {
  // Do something with the json here 
});
```

### put

The ***put*** function does a PUT request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```js
put('api/pokemon/1', { id: 1, name: "bulbasaur" }).then((json) => {
  // Do something with the json here 
});
```

### patch

The ***patch*** function does a PATCH request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```js
patch('api/pokemon/1', { id: 1, name: "bulbasaur" }).then((json) => {
  // Do something with the json here 
});;
```

### remove

The ***remove*** function does a DELETE request to the given url.
Then gives the result to the configured middleware
for processing.

```js
import { remove } from 'mad-spring-connect';

remove('api/pokemon/1').then(() => {
  // Do something here.
});;
```

### makeInstance

Takes a class definition and an object of JSON properties, and
creates an instance of the provided and sets the JSON properties
as the properties of the class.

For example:

```js
import { makeInstance } from 'mad-spring-connect';

class Person {
  id: ?number;
  name: ?string;
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
import { 
  configureMadConnect, 
  checkStatus, 
  parseJSON 
} from 'mad-spring-connect';

import { authFetch } from 'redux-mad-authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON]
});
```

If you do not configure mad-spring-connect, it will use
window.fetch and the default middlewares.

## Middleware

All util functions which do requests are passed through a middleware layer.

Middleware is a type with the following definition:

```js
export type Middleware = (Promise<*>) => Promise<*>
```

Middleware is a function which takes a Promise and 
returns a new promise. What happens in the middle is
what the middleware actually does.

Each middleware you configure will hook into the previous
middleware in order of definition in the configuration.

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
export function parseJSON(promise: Promise<Response>): Promise<JSON> {
  return promise.then((response: Response) => {
    return response.json();
  });
}
```

***checkStatus*** converts all non 2xx responses to errors.

***parseJSON*** converts a Response to a JSON object.

### Adding middleware

There are a couple of rules to define your own middleware:

  1. You must keep the chain alive, so you must either then or catch
     or do both with the incoming promise.
  2. When doing a 'catch' you must return a rejected promise.
 
Knowing these rules we can define a middleware which listens
to 400 errors and 'alerts' those errors to show them to the
user:

```js
function displayError(promise) {
  return promise.catch((error) => {
    if (error.response.status === 400) {
      window.alert(error.message);
    }
 
    // Keep the chain alive.
    return Promise.reject(error);
  });
} 
```

Now all you need to do is to call `configureMadConnect` and
set the middleware:

```js
import { 
  configureMadConnect, 
  checkStatus, 
  parseJSON 
} from 'mad-spring-connect';

import { authFetch } from 'redux-mad-authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON, displayError]
});
```
