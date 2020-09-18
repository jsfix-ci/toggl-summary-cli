import chalk from 'chalk'
import { Duration, ZonedDateTime}  from 'js-joda';
import { DetailedReportItem } from "./structures";

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

function doesEntryHaveBreakStartMarker(entry: DetailedReportItem) : boolean {
    //TODO: 
    return false
}

/**
 * Helper function to work out if the previous entry was the start of a break.
 * @param currentIndex the index in the array for the current entry
 * @param array the array containing the entries
 */
function wasPreviousEntryBreakStart(currentIndex: number, array: DetailedReportItem[]): boolean {
    //TODO: 
    return false;
}

/**
 * Helper function to calculate the duration between the start of the current
 * entry and the end of the previous one. 
 * @param currentIndex the index in the array for the current entry
 * @param array the array containing the entries
 */
function getTimeBetweenEntries(currentIndex: number, array: DetailedReportItem[]): Duration {

    /* Work out the time between this entry and the previous one */
    let timeBetweenEntries: Duration;
    if (currentIndex > 0) {
        /* There is a previous entry */
        const prevEntry = array[currentIndex-1];
        const currentEntry = array[currentIndex];

        timeBetweenEntries = Duration.between(
            ZonedDateTime.parse(prevEntry.end),
            ZonedDateTime.parse(currentEntry.start)
        );
    } else {
        /* No previous entry, default to zero */
        timeBetweenEntries = Duration.ZERO;
    }

    console.log('Time between entries: ' + timeBetweenEntries.toString());

    return timeBetweenEntries;
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
 */
export function calculateTimeTotals(reportData: DetailedReportItem[]): TimeSummary {

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


    let lastSawMarker = false;
    reportData
        .forEach((entry, index, array) => {

            console.log('Time entry for %s: %s', 
                entry.description, Duration.ofMillis(entry.dur));

            /* An entry is a "break start" marker if all the following are true:
             * - it has the tag "marker"
             * - the previous entry did not also have the tag "marker"
             */
            // TODO: RESET IF DAY CHANGE!
            const entryHasMarker = !lastSawMarker && entry.tags && entry.tags.includes('marker');

            /* Add the booked time for the entry to the running total, 
             * if it isn't a 'break' entry */
            if (!entryHasMarker) {
                timeSummary.bookedTime += entry.dur;
            }

            /* Work out the time between this entry and the previous one
             * and add it to the correct total based on our state */
            let timeBetweenEntries = getTimeBetweenEntries(index, array);

            if (lastSawMarker) {
                /* The previous entry was a 'break start' marker. 
                 * Gap time is break time */
                timeSummary.breakTime += timeBetweenEntries.toMillis();
                console.log(chalk.greenBright(
                    'Break time: ' + timeBetweenEntries.toString()));
            } else {
                /* Gap time is unbooked time */
                timeSummary.unbookedTime += timeBetweenEntries.toMillis();

                /* Only log it to the console if it is more than 5 minutes */
                if (timeBetweenEntries.toMinutes() > 5) {
                    console.log(chalk.yellow(
                        'Unbooked time since last entry: ' + timeBetweenEntries.toString()));
                }
            }

            lastSawMarker = entryHasMarker;
        });

    /* Total time is the combination of booked and unbooked time */
    timeSummary.timeCount = (timeSummary.bookedTime + timeSummary.unbookedTime);

    /* All done, return */
    return timeSummary;
}