---
layout: default
title: Configuration
nav_order: 3
description: 'Documentation for @42.nl/spring-connect.'
permalink: /configuration
---

You can optionally configure `@42.nl/spring-connect` by modifying the middleware chain and the `fetch` function it uses.

```ts
import { configureMadConnect, checkStatus, parseJSON } from '@42.nl/spring-connect';

import { authFetch } from '@42.nl/authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON],
});
```

In the above example we configure `fetch` to be the fetch function
defined in the [@42.nl/authentication](https://github.com/42BV/react-authentication) library.
This way the user credentials are sent whenever fetch is used.

If you do not configure `@42.nl/spring-connect`, it will use
`window.fetch` and the default middlewares.

The default middlewares is the following array: `[checkStatus, parseJSON]`.
