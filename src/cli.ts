import axios, { AxiosRequestConfig } from 'axios'
import chalk from 'chalk'
import * as ora from 'ora'
import { Duration, ZonedDateTime } from 'js-joda'

import { DetailedReportResponse } from './structures';
import { calculateTimeTotals, TimeSummary } from './time-reporter'

/* Load environment file with configuration */
require('dotenv').config();

/* Validate configuration values were specified */
if (!process.env.API_TOKEN) {
  throw new Error("API_TOKEN must be defined in '.env' file");
}
if (!process.env.EMAIL) {
  throw new Error("EMAIL must be defined in '.env' file");
}
if (!process.env.WORKSPACE_ID) {
  throw new Error("WORKSPACE_ID must be defined in '.env' file");
}

const config: AxiosRequestConfig = {
    auth: {
        username: process.env.API_TOKEN,
        password: 'api_token'
    },
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en-gb',
    },
    params: {
        user_agent: process.env.EMAIL,
        workspace_id: process.env.WORKSPACE_ID,
        since: '2020-09-03',
        until: '2020-09-03'
    }
  };

axios.get<DetailedReportResponse>('https://toggl.com/reports/api/v2/details', config)
  .then(response => {

    /* Print out the total time as reported from the API */
    const totalTime = Duration.ofMillis(response.data.total_grand);
    console.log(
        chalk.green('Report loaded, total booked time:', totalTime.toString()));

    /* Iterate through the items to work out the time summary */
    const timeSummary = calculateTimeTotals(response.data.data);

    /* Print out the output */
    console.log(chalk.magenta('==== Totals for', config.params.since, 'to', config.params.until, '===='));
    console.log('Counted booked time: ' + Duration.ofMillis(timeSummary.bookedTime).toString());
    console.log('Counted unbooked time: ' + Duration.ofMillis(timeSummary.unbookedTime).toString());
    console.log('Counted break time: ' + Duration.ofMillis(timeSummary.breakTime).toString());
    console.log('Counted total time: ' + Duration.ofMillis(timeSummary.timeCount).toString());
  })
  .catch(error => {
    console.log(chalk.red('Failed to load response: ' + error));
  })

console.log(chalk.yellow('=========*** Testing! ***=========='))