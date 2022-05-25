import axios, { AxiosInstance } from 'axios';

type Config = {
  // The fetch variant which is used to make requests.
  api?: AxiosInstance;
};

export default Config;

const config: Config = {
  api: undefined // by default use axios as is
};

/**
 * Configures the MadConnect library axios instance.
 *
 * @param {AxiosInstance} api An axios instance with extra configurations like interceptors
 */
export function configureApi(api: AxiosInstance): void {
  config.api = api;
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
 * Convenience function to return 'api' from the config.
 *
 * Returns either a custom axios instance configured by
 * the user via 'configureApi' or the default axios
 * implementation provided by the Axios library.
 *
 * @export
 * @returns {AxiosInstance} Either the default axios or the configured axios instance.
 */
export function getApi(): AxiosInstance {
  return config.api ? config.api : axios;
}
