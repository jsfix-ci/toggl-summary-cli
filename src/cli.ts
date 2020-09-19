import axios, { AxiosRequestConfig } from 'axios'
import chalk from 'chalk'
import * as ora from 'ora'
import { Duration } from 'js-joda'


import { processConfiguration } from './configuration-processor';
import { DetailedReportResponse } from './structures';
import { calculateTimeTotals, formatMillis } from './time-reporter'

/* Configure API request from command line options */
const config: AxiosRequestConfig = processConfiguration();

/* Call the API */
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
    console.log('Counted booked time: ' + formatMillis(timeSummary.bookedTime));
    console.log('Counted unbooked time: ' + formatMillis(timeSummary.unbookedTime));
    console.log('Counted break time: ' + formatMillis(timeSummary.breakTime));
    console.log('Counted total time: ' + formatMillis(timeSummary.timeCount));
  })
  .catch(error => {
    console.log(chalk.red('Failed to load response: ' + error));
  })