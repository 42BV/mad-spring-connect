# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0] - 2019-09-11
- The `makeResource` should now be used like this: 

  ```ts
    class Pokemon extends makeResource<Pokemon>('api/pokemon')
  ```

  Instead of the old way:

  ```ts
    class Pokemon extends makeResource('api/pokemon')<Pokemon>
  ```

  By putting the generic directly after `makeResource` TypeScript actually 
  recognizes the return types correcty. Before calling `Pokemon.one` would 
  give back a `Promise<unknown>` instead of `Promise<Pokemon>`. 
  This way we no longer need to tell TypeScript the type when
  using it:

  ```ts
  const pokemon: Pokemon = await Pokemon.one(1);
  ```

  And we can instead we can simply do:

  ```ts
  // The type of pokemon is now correctly inferred as Pokemon
  const pokemon = await Pokemon.one(1);
  ```

- The `findOne` method now returns a `Promise` of `T` or `void`. This
way TypeScript recognizes the return type better, it did not understand
`null` correctly, and acted as if it was a `T`. Now TypeScript will make 
you check if you actually have a type T or empty. This was actually a 
bug discovered by the better type inference. 

- No longer exporting a `Resource` class definition. It got out of
  sync really easily with the actual return value, so it has been
  removed.

## [3.3.0] - 2019-09-11
- The `one` method now accepts a string for the id as well.

## [3.2.0] - 2019-08-12
- The `post`, `patch` and `put` payload parameter can now be a `FormData`. 
  Useful for totally controlling the `body` for example when uploading.

- Updated to TypeScript `3.5.3` had to make `QueryParams` the correct
  type as needed by `query-string`'s `stringify` method.

- Exposed `Method`, `MiddlewareDetailInfo`, `QueryParams` in the index.

## [3.1.2] - 2019-08-06

- Renamed to @42.nl/spring-connect

## [3.1.1] - 2019-07-16

- Upgraded `lodash.merge` to resolve vulnerability warnings.

## [3.1.0] - 2019-06-17

- Added `findOne` method which allows the user to search for one entity.

## [3.0.0] - 2019-03-20

- Migrated from flow to TypeScript.
- **Breaking** makeResource now returns a class you can dynamically
  extend.

## [2.2.0] - 2019-04-15

- Exposed applyMiddleware, getFetch and buildUrl to allow more customised calls

## [2.1.0] - 2019-04-11

- Now passing the URL and optionally the queryParams and payload as extra parameters for the middleware

## [2.0.0] - 2018-04-16

- Fixed a bug which caused the `emptyPage` from the spring-models not
  to be recognized as being of type Page<T>. `emptyPage` is now a function
  this way flow recognizes that each time `emptyPage` is called it returns
  a new type of Page.

## [1.0.1] - 2018-02-12

### Fixed

- Fixed a bug which caused the `emptyPage` from the spring-models not
  to be recognized as being of type Page<T>. This caused flow errors when
  using the `emptyPage` more than once in an application.

## [1.0.0] - 2018-01-15

### Added

- The first version of this library.
