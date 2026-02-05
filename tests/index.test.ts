import { expect, describe, test } from 'vitest';
import * as index from '../src';

describe('index', () => {
  test('exports', () => {
    expect(index).toMatchInlineSnapshot(`
      {
        "buildUrl": [Function],
        "configureApi": [Function],
        "downloadFile": [Function],
        "emptyPage": [Function],
        "get": [Function],
        "getApi": [Function],
        "mapPage": [Function],
        "pageOf": [Function],
        "patch": [Function],
        "post": [Function],
        "put": [Function],
        "remove": [Function],
      }
    `);
  });
});
