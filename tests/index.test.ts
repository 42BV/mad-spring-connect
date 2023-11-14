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
        "makeInstance": [Function],
        "makeResource": [Function],
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
