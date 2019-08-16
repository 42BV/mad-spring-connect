---
layout: default
title: Utils
nav_order: 1
description: 'Documentation for @42.nl/spring-connect.'
permalink: /utils
---

## Explanation

These utilities are the building blocks which are used throughout this library to create the methods for the Resource's. You can use
these functions to write your own Resource methods.

### get

The **_get_** function does a `GET` request to the given url, with the query params if they are provided. It then passes along the result to the configured middleware for processing.

For example:

```ts
import { get } from '@42.nl/spring-connect';

get('api/pokemon', { page: 1 }).then(json => {
  // Do something with the json here
});
```

Note: that the second parameter can be left empty if you have
no query parameters.

### post

The **_post_** function does a `POST` request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```ts
post('api/pokemon', { name: 'bulbasaur' }).then(json => {
  // Do something with the json here
});
```

The `payload` can also be a `FormData` object, which is useful when uploading
files: See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

### put

The **_put_** function does a `PUT` request to the given url, with the given payload.
It then gives the result to the configured middleware for processing.

```ts
put('api/pokemon/1', { id: 1, name: 'bulbasaur' }).then(json => {
  // Do something with the json here
});
```

The `payload` can also be a `FormData` object, useful for when uploading
files: See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

### patch

The **_patch_** function does a `PATCH` request to the given url, with the given payload.
Then gives the result to the configured middleware
for processing.

```ts
patch('api/pokemon/1', { id: 1, name: 'bulbasaur' }).then(json => {
  // Do something with the json here
});
```

The `payload` can also be a `FormData` object, useful for when uploading
files: See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

### remove

The **_remove_** function does a `DELETE` request to the given url.
Then gives the result to the configured middleware
for processing.

```ts
import { remove } from '@42.nl/spring-connect';

remove('api/pokemon/1').then(() => {
  // Do something here.
});
```

### makeInstance

Takes a class definition and an object of JSON properties,
creates an instance of the provided and sets the JSON properties
as the properties of the class.

For example:

```ts
import { makeInstance } from '@42.nl/spring-connect';

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
