import { AxiosRequestConfig } from 'axios';
import { Command } from 'commander';
import { LocalDate } from '@js-joda/core';

/**
 * Interface defining the configuration determined
 * from the CLI and environment options. 
 */
export interface Configuration {
    /**
     * boolean for if debug logging should be used (true) or not (false)
     */
    debug: boolean,
    /**
     * The API configuration for the Toggl API
     */
    apiConfig: AxiosRequestConfig,
    /**
     * Boolean for if per client/project summary information should be included or not. 
     */
    includeSummary: boolean
}

/**
 * Processes the CLI arguments (if any) and the ".env" file 
 * (if it exists) to return the configuration for sending to
 * the Toggl API. 
 * 
 */
export function processConfiguration(): Configuration {

    /* 
     * Load environment file with configuration.
     * If the DOT_ENV_CONFIG environment variable is set then
     * use it as a path. 
     */
    let dotenvConfig;
    if (process.env.DOT_ENV_CONFIG) {
        dotenvConfig = {
            path: process.env.DOT_ENV_CONFIG
        }
    }
    require('dotenv').config(dotenvConfig)

    /* Configure command line options */
    const program = new Command();
    program
        .option('-D, --debug', 'output extra debugging')
        .requiredOption('--api-key <api-key>', 
            'api token, found in Toggle profile settings', 
            process.env.API_TOKEN)
        .requiredOption('--email <email>', 
            'your email address', 
            process.env.EMAIL)
        .requiredOption('--workspace-id <workspace id>', 
            'id of the Toggle workspace', 
            process.env.WORKSPACE_ID)

        .option('-d, --day <date>','day to report on (in yyyy-MM-dd format). ' +
    'If a date is not supplied then this will default to today.').preset(LocalDate.now().toString())
        .option('-w, --week',
            'If specified, interpret the day as the start of a week.')
        .option('--include-summary',
            'If specified, include client/project summary detail');

    program.parse(process.argv);

    if (program.opts().debug) {
        console.log(program.opts());
    }

    const since = LocalDate.parse(program.opts().day);
    const until = (program.opts().week ? since.plusDays(6) : since);

    const apiConfig: AxiosRequestConfig = {
        auth: {
            username: program.opts().apiKey,
            password: 'api_token'
        },
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-gb',
        },
        params: {
            page: 1,
            user_agent: program.opts().email,
            workspace_id: program.opts().workspaceId,
            since: since.toString(),
            until: until.toString()
        }
      };

    if (program.opts().debug) {
        console.log(apiConfig);
    }

    return {
        debug: program.opts().debug,
        apiConfig: apiConfig,
        includeSummary: program.opts().includeSummary
    };
}