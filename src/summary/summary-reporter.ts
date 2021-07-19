/**
 * There are two report APIs which we could use to get this information pretty easily:
 * - WEEKLY - this is fixed to 7 days since the "since" parameter. e.g.
 *            GET "https://api.track.toggl.com/reports/api/v2/weekly?workspace_id=<workspaceid>&since=2021-07-11&until=2021-07-18&user_agent=api_test"
 * - SUMMARY - this allows us to specify the range of dates, and specify the groupings
 *             GET "https://api.track.toggl.com/reports/api/v2/summary?workspace_id=<workspaceid>&since=2021-07-11&user_agent=api_test&grouping=clients&subgrouping=projects"
 * 
 * There is also an option to use the detailed data we already have gathered and parse it a 
 * different way to gain the same sort of summary. 
 * 
 * This file will work with the outputs of the summary API for now. 
 */

import { SummaryReportItem, SummaryReportTitle } from '../structures';
import { TimeSummary } from '../time/time-reporter';

/**
 * Enum holding the types of grouping the API could use. While we parse this, we largely 
 * expect to use the client grouping, with project subgrouping. 
 */
export enum GroupingType {
    CLIENT,
    PROJECT,
    USER,
    UNKNOWN
}

export interface Summary {
    /**
     * Name of the grouping member
     */
    name: string;

    /**
     * The type of the grouping. 
     */
    groupingType: GroupingType;

    /**
     * time booked against actual tasks (should match the API total time)
     */
     bookedTime: number;

     /**
     * The percentage of the total time this client had booked against it. 
     */
    percentageOfTotalTime: number;

    subgroupSummary?: Summary[];

}



/**
 * Get the type of grouping the supplied title object is for. 
 * @param title the object to parse
 */
export function getGroupingType(title: SummaryReportTitle): GroupingType {

    if (title.client) {
        return GroupingType.CLIENT;
    } else if (title.project) {
        return GroupingType.PROJECT;
    } else if (title.user) {
        return GroupingType.USER;
    } else {
        return GroupingType.UNKNOWN;
    }

}

/**
 * Get the name of the grouping member the supplied title object is for. 
 * @param title the object to parse
 */
export function getGroupingName(title: SummaryReportTitle): string {
    if (title.client) {
        return title.client;
    } else if (title.project) {
        return title.project;
    } else if (title.user) {
        return title.user;
    } else {
        return 'Unknown Client/Project';
    }

}

/**
 * Helper function to calculate the percentage of one number to another
 * @param partialValue the partial value
 * @param totalValue the total value
 */
export function calculatePercentage(partialValue: number, totalValue: number): number {
    if (totalValue > 0) {
        return (100 * partialValue) / totalValue;
    } else {
        return 0;
    }
}

/**
 * Calculate the total duration that should be used based on the input data.
 * 
 * If a TimeSummary is supplied, the totalCount value from this will be used. Otherwise
 * the total duration will be calculated from the summary report data. 
 * 
 * @param reportData the input summary report data items
 * @param totalTime the time summary calculated from detailed entries
 * @returns the total time value to use. 
 */
export function calculateTotalTime(reportData: SummaryReportItem[], totalTime: TimeSummary | undefined) : number {
    
    let totalDuration = 0;
    if (totalTime) {
        /* If a time summary has been passed through, use it for the total */
        totalDuration = totalTime.timeCount;
    } else {
        /* A summary was not passed through, calculate based on the supplied items */
        reportData.map(v => v.time).forEach(value => totalDuration += value);
    }

    return totalDuration;
}

/**
 * Calculate summary information for the report data, split into per-client and per-project.
 * 
 * This assumes the summary API has been invoked with the following parameters:
 * - grouping=clients
 * - subgrouping=projects
 * 
 * 
 * @param reportData The summary report items from the api for the reporting period
 * @param totalTime The total time calculated for the time period. 
 *                  This is used to provide "unbooked" time in the summary. 
 * @param debug boolean for if debug logging should be used (true) or not (false)
 */
export function calculateSummaryTotals(reportData: SummaryReportItem[], totalTime: TimeSummary | undefined, debug: boolean): Summary[] {

    /* Get the total duration to use */
    const totalDuration = calculateTotalTime(reportData, totalTime);

    /* Process each data item */
    const retItems = reportData.map(value => {

        const groupingType = getGroupingType(value.title);
        const groupingName = getGroupingName(value.title);
        const percent = calculatePercentage(value.time, totalDuration);

        let summary: Summary = {
            groupingType: groupingType,
            name: groupingName,
            bookedTime: value.time,
            percentageOfTotalTime: percent,
            subgroupSummary: []
        }

        if (value.items) {
            /* If there are subgroup items, process recursively */
            summary.subgroupSummary = calculateSummaryTotals(value.items, undefined, debug);
        } else {
            summary.subgroupSummary = undefined;
        }

        return summary;

    });

    if (totalTime) {
        /* If there are time totals supplied from detailed reports, include an item for unbooked */
        retItems.push({
            bookedTime: totalTime.unbookedTime,
            groupingType: GroupingType.UNKNOWN,
            percentageOfTotalTime: calculatePercentage(totalTime.unbookedTime, totalDuration),
            name: 'Unbooked Time'
        });
    }

    /* Sort by time */
    retItems.sort((a, b) => b.bookedTime - a.bookedTime);

    return retItems;
}