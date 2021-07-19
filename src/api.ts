import axios from 'axios'
import chalk from 'chalk'

import { Configuration } from './configuration-processor';
import { DetailedReportItem, DetailedReportResponse, SummaryReportItem, SummaryReportResponse } from './structures';
import { formatMillis } from './time/time-reporter'

const baseReportApiUrl = 'https://api.track.toggl.com/reports/api/v2/'

const summaryApiUrl = baseReportApiUrl + 'summary';
const detailsApiUrl =  baseReportApiUrl + 'details';


/**
 * Function for loading our detailed report data from the API. This handles pagination by calling the API until all pages are loaded. 
 * @param config the configuration to use. 
 * @param page the page number to load. If this is undefined a default of 1 will be used. 
 * @returns array of detailed report items loaded from the API. 
 */
export async function getDetailedReportData(config: Configuration, page: number = 1): Promise<DetailedReportItem[]> {

    config.apiConfig.params.page = page;

    const response = await axios.get<DetailedReportResponse>(detailsApiUrl, config.apiConfig)
    const data = response.data.data;

    /* Print out the total time as reported from the API */
    if (config.debug) {
        console.log(
            chalk.green('Report page loaded',
                config.apiConfig.params.page,
                'total booked time:',
                formatMillis(response.data.total_grand)));

        console.log('Pagination details: total_count: %s, per_page: %s',
            response.data.total_count, response.data.per_page)
    }

    /**
     * If there are more pages, call the API again, otherwise return the data
     */
    if (response.data.data.length > 0 && response.data.data.length === response.data.per_page) {
        return data.concat(await getDetailedReportData(config, page + 1))
    } else {
        return data
    }
}

/**
 * Function for loading our summary report data from the API. 
 * @param config the configuration to use. 
 * @returns array of summary report items loaded from the API. 
 */
 export async function getSummaryReportData(config: Configuration): Promise<SummaryReportItem[]> {
     /* While I don't think it is used, reset the page number */
    config.apiConfig.params.page = 1;

    /* Add in the additional params for this API type */
    config.apiConfig.params.grouping='clients';
    config.apiConfig.params.subgrouping='projects';

    const response = await axios.get<SummaryReportResponse>(summaryApiUrl, config.apiConfig)
    return response.data.data;
}