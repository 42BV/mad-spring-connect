import { expect, test } from 'vitest';
import { configureApi, getConfig, getApi } from '../src/config';
import axios, { AxiosInstance } from 'axios';

test('configuration lifecycle', () => {
  expect.assertions(4);

  // By default it should use regular axios.
  expect(getConfig().api).toBe(undefined);
  expect(getApi()).toBe(axios);

  // @ts-expect-error Test mock
  const fakeApi: AxiosInstance = { test: true };

  configureApi(fakeApi);

  // Now we expect the config to be set.
  expect(getConfig().api).toBe(fakeApi);
  expect(getApi()).toBe(fakeApi);
});
