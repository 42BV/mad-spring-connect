import * as index from '../src';

describe('index', () => {
  test('exports', () => {
    expect(index).toMatchInlineSnapshot(`
      Object {
        "Method": Object {
          "DELETE": "DELETE",
          "GET": "GET",
          "PATCH": "PATCH",
          "POST": "POST",
          "PUT": "PUT",
        },
        "applyMiddleware": [Function],
        "buildUrl": [Function],
        "checkStatus": [Function],
        "configureMadConnect": [Function],
        "emptyPage": [Function],
        "get": [Function],
        "getFetch": [Function],
        "makeInstance": [Function],
        "makeResource": [Function],
        "parseJSON": [Function],
        "patch": [Function],
        "post": [Function],
        "put": [Function],
        "remove": [Function],
      }
    `);
  });
});
