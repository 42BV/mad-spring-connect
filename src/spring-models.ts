/**
 * Represents Spring's page abstraction.
 *  @see {@link http://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/Page.html}
 */
export type Page<T> = {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
};

/**
 * Represents an empty Page useful for initializing variables while
 * waiting for the actual Page to be retrieved.
 */
export function emptyPage<T>(): Page<T> {
  return Object.freeze({
    content: [],
    last: true,
    totalElements: 0,
    totalPages: 0,
    size: 0,
    number: 0,
    first: true,
    numberOfElements: 0
  });
}

/**
 * Create a Page of a subset of an array of items.
 */
export function pageOf<T>(content: T[], page = 1, size = 10): Page<T> {
  const offset = (page - 1) * size;

  const slice = content.slice(offset, offset + size);

  const totalPages = Math.max(1, Math.ceil(content.length / size));

  return Object.freeze({
    content: slice,
    last: page === totalPages,
    totalElements: content.length,
    totalPages,
    size: slice.length,
    number: page,
    first: page === 1,
    numberOfElements: slice.length
  });
}
