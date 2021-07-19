#!/usr/bin/env node
import axios from 'axios'
import chalk from 'chalk'


import { Configuration, processConfiguration } from './configuration-processor';
import { DetailedReportItem, DetailedReportResponse } from './structures';
import { calculateTimeTotals, formatMillis } from './time/time-reporter'

const apiUrl = 'https://api.track.toggl.com/reports/api/v2/details';

/* Define a function for loading our report data from the API. This handles pagination */
const getDetailedReportData = async (page: number): Promise<DetailedReportItem[]> => {  
  config.apiConfig.params.page = page;
  
  const response = await axios.get<DetailedReportResponse>(apiUrl, config.apiConfig)  
  const data = response.data.data;

  /* Print out the total time as reported from the API */
  console.log(
    chalk.green('Report page loaded', 
      config.apiConfig.params.page,
      'total booked time:',
      formatMillis(response.data.total_grand)));

  if (config.debug) {
    // console.log('API Response Payload: %o', response.data);

    console.log('Pagination details: total_count: %s, per_page: %s',
      response.data.total_count, response.data.per_page)
  }

  /**
   * If there are more pages, call the API again, otherwise return the data
   */
  if (response.data.data.length > 0 && response.data.data.length === response.data.per_page) {
    return data.concat(await getDetailedReportData(page+1)) 
  } else {
    return data
  }
}

/* Configure API request from command line options */
const config: Configuration = processConfiguration();

/* Call the API */
getDetailedReportData(1)
// axios.get<DetailedReportResponse>('https://toggl.com/reports/api/v2/details', config.apiConfig)
  .then(detailedItems => {

    /* Iterate through the items to work out the time summary */
    const timeSummary = calculateTimeTotals(detailedItems, config.debug);

    /* Print out the output */
    console.log(chalk.magenta('==== Totals for', config.apiConfig.params.since, 'to', config.apiConfig.params.until, '===='));
    console.log('Counted booked time: ' + formatMillis(timeSummary.bookedTime));
    console.log('Counted unbooked time: ' + formatMillis(timeSummary.unbookedTime));
    console.log('Counted break time: ' + formatMillis(timeSummary.breakTime));
    console.log('Counted total time: ' + formatMillis(timeSummary.timeCount));
  })
  .catch(error => {
    console.log(chalk.red('Failed to load response: ' + error));
  })