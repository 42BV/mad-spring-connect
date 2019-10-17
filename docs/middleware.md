---
layout: default
title: Middleware
nav_order: 2
description: 'Documentation for @42.nl/spring-connect.'
permalink: /middleware
---

All util functions which do requests are passed through a middleware layer.
The reason the middleware layer exists is because `fetch` by default
does very little. `fetch` does not handle errors and JSON parsing
of responses. It is annoying to have to manually do this every time.

The middleware layer allows you to define these common behaviors once
and make use of them automatically.

`Middleware` is a type with the following definition:

```ts
export interface QueryParams {
  [key: string]: unknown;
}

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export interface MiddlewareDetailInfo {
  url: string;
  method: Method;
  queryParams?: QueryParams;
  payload?: object;
}

export type Middleware = (middleware: Promise<any>, options: MiddlewareDetailInfo) => Promise<any>;
```

Middleware is a `function` which takes a `Promise` and
returns a new `Promise`. What happens in the middle is
what the middleware actually does.

Each middleware you configure will hook into the previous
middleware in order of definition in the configuration.

As an optional second argument you can receive the data that
was used to construct the request that was made so you can
take further actions if needed.

### Default middleware

Two middlewares are provided out of the box:

The first is **_checkStatus_** which converts all non 2xx responses to errors.

```ts
export async function checkStatus(promise: Promise<Response>): Promise<Response> {
  const response = await promise;

  const status = response.status;

  if (status >= 200 && status <= 299) {
    return response;
  } else {
    return Promise.reject(new ErrorWithResponse(response));
  }
}
```

The second is **_parseJSON_** which converts a `Response` to a `JSON` object:

```ts
export async function parseJSON(promise: Promise<Response>): Promise<any> {
  const response = await promise;

  if (response.status === 204) {
    return Promise.resolve({});
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType === null || contentType.includes('json') === false) {
    throw new Error('@42.nl/spring-connect: Content-Type is not json, will not parse.');
  }

  return response.json();
}
```

### Adding middleware

There are a couple of rules to define your own middleware:

1. You must keep the chain alive, so you must either `then` or `catch`
   or do **both** with the incoming `Promise`.
2. When doing a `catch` you must return a rejected promise.

Knowing these rules we can define a middleware which listens
to 400 errors and `alert`'s those errors:

```ts
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

Now all you need to do is call `configureMadConnect` and
set the middleware:

```ts
import { configureMadConnect, checkStatus, parseJSON } from '@42.nl/spring-connect';

import { authFetch } from '@42.nl/authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON, displayError],
});
```

### Custom calls with applyMiddleware

You can create custom fetch operations but still apply the
configured middleware. This works because the applyMiddleware and getFetch
functions are both exposed:

```ts
const promise = applyMiddleware(getFetch()(url, options), { url, method, queryParams, payload });
```

This way you can control all the options that are given to
fetch method, such as the headers or body.
