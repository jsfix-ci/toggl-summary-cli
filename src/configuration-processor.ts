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
    apiConfig: AxiosRequestConfig
}

/**
 * Processes the CLI arguments (if any) and the ".env" file 
 * (if it exists) to return the configuration for sending to
 * the Toggl API. 
 * 
 */
export function processConfiguration(): Configuration {

    /* Load environment file with configuration */
    require('dotenv').config();

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

        .option('-d, --day <date>',
            'day to report on (in yyyy-MM-dd format). ' +
            'If a date is not supplied then this will default to today.',
            LocalDate.now().toString())
        .option('-w, --week',
            'If specified, interpret the day as the start of a week.');


    program.parse(process.argv);

    if (program.debug) {
        console.log(program.opts());
    }

    const since = LocalDate.parse(program.day);
    const until = (program.week ? since.plusDays(7) : since);

    const apiConfig: AxiosRequestConfig = {
        auth: {
            username: program.apiKey,
            password: 'api_token'
        },
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-gb',
        },
        params: {
            user_agent: program.email,
            workspace_id: program.workspaceId,
            since: since.toString(),
            until: until.toString()
        }
      };

    if (program.debug) {
        console.log(apiConfig);
    }

    return {
        debug: program.debug,
        apiConfig: apiConfig
    };
}