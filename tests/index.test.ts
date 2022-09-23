import * as index from '../src';

describe('index', () => {
  test('exports', () => {
    expect(index).toMatchInlineSnapshot(`
      Object {
        "buildUrl": [Function],
        "configureApi": [Function],
        "downloadFile": [Function],
        "emptyPage": [Function],
        "get": [Function],
        "getApi": [Function],
        "makeInstance": [Function],
        "makeResource": [Function],
        "patch": [Function],
        "post": [Function],
        "put": [Function],
        "remove": [Function],
      }
    `);
  });
});
