# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
