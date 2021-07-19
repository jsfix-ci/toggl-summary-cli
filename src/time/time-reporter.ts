import chalk from 'chalk'
import { Duration, ZonedDateTime, LocalDate } from '@js-joda/core';
import { SimplifiedDetailedReportItem } from "../structures";

/**
 * Interface holding the calculated times
 */
export interface TimeSummary {
    /**
     * Total actual working hours (combination of booked and unbooked time)
     */
    timeCount: number;
    /**
     * breaks (time between a marker item and the next non-marker)
     */
    breakTime: number;
    /**
     * time booked against actual tasks (should match the API total time)
     */
    bookedTime: number;
    /**
     * unbooked (any time between items that isn't covered as breaks)
     */
    unbookedTime: number;
}

/**
 * Function to determine if an entry contains the tag for being a marker. 
 * @param entry the entry to check
 * @returns true if it does, false if it doesn't
 */
export function doesEntryHaveBreakStartMarker(entry: SimplifiedDetailedReportItem): boolean {
    return entry.tags && entry.tags.includes('marker');
}

/**
 * Function to determine if two entries are for the same day. 
 * @param a the first entry to compare the end date for
 * @param b the second entry to compare the start date for
 */
function areEntriesForTheSameDay(a: SimplifiedDetailedReportItem, 
    b: SimplifiedDetailedReportItem): boolean {

    /* Check the entries are for the same day */
    const currentDate = LocalDate.parse(a.end.substr(0, 10));
    const prevDate = LocalDate.parse(b.start.substr(0, 10));

    return currentDate.equals(prevDate);
}

/**
 * Helper function to work out if the previous entry was the start of a break.
 * @param currentIndex the index in the array for the current entry
 * @param array the array containing the entries
 */
export function wasPreviousEntryBreakStart(currentIndex: number, array: SimplifiedDetailedReportItem[]): boolean {

    /* A previous entry counts as a break start if:
     * - it has a marker tag (doesEntryHaveBreakStartMarker)
     * - the entry before it does is not a break start
     * - it is for the same day as the current entry
    */

    let isMarker: boolean;
    if (currentIndex > 0) {

        const prevEntry = array[currentIndex - 1];
        isMarker = doesEntryHaveBreakStartMarker(prevEntry);

        if (isMarker) {
            /* Check the previous entry to check it wasn't one too */
            isMarker = !wasPreviousEntryBreakStart(currentIndex - 1, array);
        }

        if (isMarker) {
            /* Check the entries are for the same day */
            isMarker = areEntriesForTheSameDay(array[currentIndex - 1], array[currentIndex]);
        }
    } else {
        /* No previous entries */
        isMarker = false;
    }

    return isMarker;
}

/**
 * Helper function to calculate the duration between the start of the current
 * entry and the end of the previous one. 
 * @param currentIndex the index in the array for the current entry
 * @param array the array containing the entries
 * @param debug boolean for if debug logging should be used (true) or not (false)
 */
export function getTimeBetweenEntries(currentIndex: number, 
    array: SimplifiedDetailedReportItem[], debug: boolean): Duration {

    /* Work out the time between this entry and the previous one */
    let timeBetweenEntries: Duration;
    if (currentIndex > 0) {
        /* There is a previous entry */
        const prevEntry = array[currentIndex - 1];
        const currentEntry = array[currentIndex];

        timeBetweenEntries = Duration.between(
            ZonedDateTime.parse(prevEntry.end),
            ZonedDateTime.parse(currentEntry.start)
        );
    } else {
        /* No previous entry, default to zero */
        timeBetweenEntries = Duration.ZERO;
    }

    if (debug) {
        console.log('Time between entries: ' + timeBetweenEntries.toString());
    }

    return timeBetweenEntries;
}

/**
 * Format the supplied number of milliseconds as an HH:mm:ss string. 
 * @param millseconds the number of milliseconds to format
 */
export function formatMillis(millseconds: number): string {

    const seconds = Math.floor((millseconds / 1000) % 60);
    const minutes = Math.floor((millseconds / (1000 * 60)) % 60);
    /* Intentionally not "% 24" this as we want to be able to have more than 24 hours,
       not using a seperate day counter */
    const hours = Math.floor((millseconds / (1000 * 60 * 60)));

    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')].join(':');
}

/**
 * Calculate summary time information for the report data. 
 * 
 * Includes:
 * - Total actual working hours (combination of booked and unbooked time)
 * - breaks (time between a marker item and the next non-marker)
 * - time booked against actual tasks (should match the API total time)
 * - unbooked time (any time between items that isn't covered as breaks)
 * 
 * @param reportData The detailed time entry items for the reporting period
 * @param debug boolean for if debug logging should be used (true) or not (false)
 */
export function calculateTimeTotals(reportData: SimplifiedDetailedReportItem[], debug: boolean): TimeSummary {

    /* Setup the initial return object with initial values */
    const timeSummary: TimeSummary = {
        timeCount: 0,
        breakTime: 0,
        bookedTime: 0,
        unbookedTime: 0
    }

    /* Sort the input data by the item start date & time */
    reportData
        .sort((a, b) => ZonedDateTime.parse(a.start).compareTo(ZonedDateTime.parse(b.start)));


    reportData
        .forEach((entry, index, array) => {

            if (debug) {
                console.log(chalk.gray('======================'))
                console.log('Counts so far: total %s, breaks %s, booked %s, unbooked: %s',
                    formatMillis(timeSummary.timeCount), 
                    formatMillis(timeSummary.breakTime),
                    formatMillis(timeSummary.bookedTime),
                    formatMillis(timeSummary.unbookedTime));
                console.log('Time entry for %s: %s (%s - %s)',
                    entry.description, formatMillis(entry.dur),
                    entry.start, entry.end);
            }

            /* An entry is a "break start" marker if all the following are true:
             * - it has the tag "marker"
             * - the previous entry did not also have the tag "marker"
             */
            const entryHasMarker = !wasPreviousEntryBreakStart(index, array) && 
                doesEntryHaveBreakStartMarker(entry);

            /* Add the booked time for the entry to the running total, 
             * if it isn't a 'break' entry */
            if (!entryHasMarker) {
                timeSummary.bookedTime += entry.dur;
            }

            /* Work out the time between this entry and the previous one
             * and add it to the correct total based on our state */
            let timeBetweenEntries = getTimeBetweenEntries(index, array, debug);

            if (wasPreviousEntryBreakStart(index, array)) {
                /* The previous entry was a 'break start' marker. 
                 * Gap time is break time */
                timeSummary.breakTime += timeBetweenEntries.toMillis();
                if (debug) {
                    console.log(chalk.greenBright(
                        'Break time!', formatMillis(timeBetweenEntries.toMillis())));
                }
            } else if (index === 0 || areEntriesForTheSameDay(array[index - 1], array[index])) {
                /* Gap time is unbooked time if the end of the last item is the same
                 * day as the current item */
                timeSummary.unbookedTime += timeBetweenEntries.toMillis();

                /* Only log it to the console if it is more than 5 minutes */
                if (debug && timeBetweenEntries.toMinutes() > 5) {
                    console.log(chalk.yellow(
                        'Unbooked time since last entry:', 
                            formatMillis(timeBetweenEntries.toMillis())));
                }
            }
        });

    /* Total time is the combination of booked and unbooked time */
    timeSummary.timeCount = (timeSummary.bookedTime + timeSummary.unbookedTime);

    /* All done, return */
    return timeSummary;
}