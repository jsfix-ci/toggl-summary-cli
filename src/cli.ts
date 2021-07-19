#!/usr/bin/env node
import chalk from 'chalk'


import { getDetailedReportData, getSummaryReportData } from './api';
import { Configuration, processConfiguration } from './configuration-processor';
import { calculateTimeTotals, formatMillis } from './time/time-reporter'
import { calculateSummaryTotals } from './summary/summary-reporter'

/* Configure API request from command line options */
const config: Configuration = processConfiguration();

/* Call the detailed report API */
getDetailedReportData(config)
  .then(detailedItems => {

    /* Iterate through the items to work out the time summary */
    const timeSummary = calculateTimeTotals(detailedItems, config.debug);

    /* Print out the output */
    console.log(chalk.magenta('# Totals for', config.apiConfig.params.since, 'to', config.apiConfig.params.until));
    console.log();
    console.log('* Booked time: %s', formatMillis(timeSummary.bookedTime));
    console.log('* Unbooked time: %s', formatMillis(timeSummary.unbookedTime));
    console.log('* Break time: %s', formatMillis(timeSummary.breakTime));
    console.log('* Total time (booked + unbooked): %s', formatMillis(timeSummary.timeCount));
    console.log();

    if (config.includeSummary) {
      /* Load the summary detail and process it */

      getSummaryReportData(config)
        .then(summaryItems => {

          console.log(chalk.magenta('# Summary'));
          console.log();

          const clientSummary = calculateSummaryTotals(summaryItems, timeSummary, config.debug);
          clientSummary.forEach(s => {
            console.log('* %s: %s%% (%s)', s.name, s.percentageOfTotalTime.toFixed(2), formatMillis(s.bookedTime))
            if (s.subgroupSummary) {
              s.subgroupSummary.forEach(g => {
                console.log('  * %s: %s%% (%s)', g.name, g.percentageOfTotalTime.toFixed(2), formatMillis(g.bookedTime))
              });
            }
            console.log();
          });

          

        }).catch(error => {
          console.log(chalk.red('Failed to load summary API response: ' + error));
        })
    }


  })
  .catch(error => {
    console.log(chalk.red('Failed to load detailed API response: ' + error));
  })