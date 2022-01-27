import * as index from '../src';

describe('index', () => {
  test('exports', () => {
    expect(index).toMatchInlineSnapshot(`
      Object {
        "buildUrl": [Function],
        "emptyPage": [Function],
        "get": [Function],
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
