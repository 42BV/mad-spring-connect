
import { configureMadConnect, getConfig, getFetch, getMiddleware } from '../src/config';

import { checkStatus, parseJSON } from '../src/middleware';

test('configuration lifecycle', () => {
  // By default it should use regular old fetch.
  expect(getConfig().fetch).toBe(window.fetch);
  expect(getFetch()).toBe(window.fetch);
  expect(getMiddleware()).toEqual([checkStatus, parseJSON]);

  const fakeFetch = jest.fn();

  // Next we initialize the config.
  const config = {
    fetch: fakeFetch,
    middleware: [1, 2, 3]
  };

  configureMadConnect(config);

  // Now we expect the config to be set.
  expect(getConfig()).toBe(config);
  expect(getFetch()).toBe(fakeFetch);
  expect(getMiddleware()).toEqual([1, 2, 3]);
});
