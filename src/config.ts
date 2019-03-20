import Middleware, { checkStatus, parseJSON } from './middleware';

export default interface Config {
  // The fetch variant which is used to make requests.
  fetch?: typeof fetch;
  middleware: Middleware[];
}

let config: Config = {
  fetch: undefined, // By default use fetch as is.
  middleware: [checkStatus, parseJSON],
};

/**
 * Configures the MadConnect library.
 *
 * @param {Config} The new configuration
 */
export function configureMadConnect(c: Config): void {
  config = c;
}

/**
 * Returns the config for the mad-connect library.
 *
 * @returns The Config
 */
export function getConfig(): Config {
  return config;
}

/**
 * Convenience function to return 'fetch' from the config.
 *
 * Returns either a custom fetch implementation provider by
 * the user via 'configureMadConnect' or the default fetch
 * implementation provided by the browser.
 *
 * @export
 * @returns {Fetch} Either the default fetch or the configured fetch.
 */
export function getFetch(): typeof fetch {
  return config.fetch ? config.fetch : window.fetch;
}

/**
 * Convenience function to return the 'middleware' from the config.
 *
 * @export
 * @returns {Array<Middleware>} The currently configured middleware
 */
export function getMiddleware(): Middleware[] {
  return config.middleware;
}
