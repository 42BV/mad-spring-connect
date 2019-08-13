---
layout: default
title: Configuration
nav_order: 3
description: 'Documentation for @42.nl/spring-connect.'
permalink: /configuration
---

You can optionally configure `@42.nl/spring-connect`. You can
configure two things, the middleware chain it uses and
you can set the `fetch` it uses.

```ts
import { configureMadConnect, checkStatus, parseJSON } from '@42.nl/spring-connect';

import { authFetch } from '@42.nl/authentication';

configureMadConnect({
  fetch: authFetch,
  middleware: [checkStatus, parseJSON],
});
```

In the above example we configure that `fetch` will be the fetch
defined in the [@42.nl/authentication](https://github.com/42BV/react-authentication) library.
This way the user credentials are sent whenever fetch is used.

If you do not configure `@42.nl/spring-connect`, it will use
`window.fetch` and the default middlewares.

The default middlewares is the following array: `[checkStatus, parseJSON]`.