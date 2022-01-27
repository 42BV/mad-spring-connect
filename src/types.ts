import { StringifiableRecord } from 'query-string';

/**
 * Represents valid QueryParams.
 */
export type QueryParams = StringifiableRecord;

/**
 * Represents a payload to be sent as the body on a PATCH, PUT or
 * POST request. Is either a FormData or some other object.
 */
export type Payload<T> = Record<string, unknown> | FormData | T;
