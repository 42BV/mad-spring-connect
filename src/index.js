// @flow

export { configureMadConnect, getFetch } from './config';
export type { Config } from './config';

export { checkStatus, parseJSON } from './middleware';
export type { Middleware } from './middleware';

export { 
  get,
  post,
  put,
  patch,
  remove,
} from './request';

export { makeResource } from './resource';
export type { Resource } from './resource';

export type { Page } from './spring-models';
export { emptyPage } from './spring-models';

export { makeInstance } from './utils';

export { buildUrl, applyMiddleware } from "./request";