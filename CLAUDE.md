# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quality Requirements

**All code changes require:**
- All tests passing (`npm test`)
- 100% code coverage

Do not commit changes without verifying these requirements. Run `npm test` before finalizing any modification.

## Project Overview

`@42.nl/spring-connect` is a TypeScript library for connecting to Spring MVC REST APIs. It provides typed HTTP request functions and Spring Data Page abstractions.

## Commands

```bash
# Run all checks (lint + type-check + tests with coverage)
npm test

# Run only tests with coverage
npm run test:coverage

# Type-check without emitting
npm run test:ts

# Lint source and tests
npm run lint

# Build to lib/
npm run tsc

# Release (builds then publishes via np)
npm run release
```

### Running a Single Test

```bash
npx vitest run tests/request.test.ts           # Run specific test file
npx vitest run -t "get"                         # Run tests matching pattern
```

## Architecture

### Core Modules (src/)

- **config.ts** - Global axios instance configuration via `configureApi()`/`getApi()`
- **request.ts** - HTTP methods (`get`, `post`, `put`, `patch`, `remove`, `downloadFile`) wrapping axios
- **spring-models.ts** - Spring Data `Page<T>` type and utilities (`emptyPage`, `pageOf`, `mapPage`)
- **utils.ts** - URL building with query-string serialization
- **types.ts** - `QueryParams` and `Payload<T>` type definitions

### Request Flow

All request functions use `getApi()` to get the configured axios instance (or default axios), make the request, and return `response.data`. Users configure interceptors/auth by passing a custom axios instance to `configureApi()`.

### Testing

Tests use Vitest with `vitest-mock-axios` for mocking axios. Pattern: call the request function, then `mockAxios.mockResponseFor(url, response)` to resolve it.

## Peer Dependencies

- `axios ^1.0.0` (required)
- `query-string >=7.0.0 <10.0.0` (required)
- `lodash.merge` (optional)
