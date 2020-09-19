import { Duration } from 'js-joda';

import { SimplifiedDetailedReportItem } from './structures';
import { calculateTimeTotals, doesEntryHaveBreakStartMarker, 
         getTimeBetweenEntries, wasPreviousEntryBreakStart } from './time-reporter';

function createEmptyEntry(): SimplifiedDetailedReportItem {
    return {
        description: '',
        start: '',
        end: '',
        dur: 0,
        tags: []
    };
}


describe('time-reporter calculator tests', () => {
    
    /**
     * Where there is a specific entry under test, this
     * will be it. 
     */
    let testEntry: SimplifiedDetailedReportItem;

    beforeEach(() => {
        /* Initially configure an empty entry that tests
         * can customise as they please */
        testEntry = createEmptyEntry();
    });
  
    it('should count as a marker entry', () => {
        
        testEntry.tags= ['tag1','marker','tag3'];

        const isMarker = doesEntryHaveBreakStartMarker(testEntry);

        expect(isMarker).toBeTruthy();
    });

    it('should not count as a marker entry', () => {
        
        testEntry.tags = ['tag1','tag2','tag3'];
        
        const isMarker = doesEntryHaveBreakStartMarker(testEntry);

        expect(isMarker).toBeFalsy();
    });

    it('should count previous entry as a marker entry', () => {

        let entries = [
            createEmptyEntry(),
            createEmptyEntry()
        ];

        entries[0].start = '2020-09-04T10:10:10+01:00';
        entries[0].end = '2020-09-04T11:10:11+01:00';
        entries[0].tags = ['marker'];

        entries[1].start = '2020-09-04T11:10:10+01:00';
        entries[1].end = '2020-09-04T12:10:11+01:00';

        const previousIsMarker = wasPreviousEntryBreakStart(1, entries);
        expect(previousIsMarker).toBeTruthy();

    });

    it('should not count previous entry as a marker entry as previous has no tags', () => {
        let entries = [
            createEmptyEntry(),
            createEmptyEntry()
        ];

        const previousIsMarker = wasPreviousEntryBreakStart(1, entries);
        expect(previousIsMarker).toBeFalsy();
    });

    it('should not count previous entry as a marker entry as no previous', () => {
        let entries = [
            createEmptyEntry()
        ];

        const previousIsMarker = wasPreviousEntryBreakStart(0, entries);
        expect(previousIsMarker).toBeFalsy();
    });

    it('should not count previous entry as a marker entry as previous day', () => {

        let entries = [
            createEmptyEntry(),
            createEmptyEntry()
        ];

        entries[0].start = '2020-09-03T18:10:10+01:00';
        entries[0].end = '2020-09-03T18:10:11+01:00',
        entries[0].tags = ['marker'];

        entries[1].start = '2020-09-04T10:10:10+01:00';
        entries[1].end = '2020-09-04T11:10:11+01:00';


        const previousIsMarker = wasPreviousEntryBreakStart(1, entries);
        expect(previousIsMarker).toBeFalsy();
    });

    it('should calculate the duration between entries', () => {

        const entries = [
            createEmptyEntry(),
            createEmptyEntry()
        ];

        entries[0].start = '2020-09-03T10:10:00+01:00';
        entries[0].end = '2020-09-03T10:10:00+01:00';
        entries[1].start = '2020-09-03T10:20:00+01:00';
        entries[1].end = '2020-09-03T10:20:00+01:00';

        const duration = getTimeBetweenEntries(1, entries);

        expect(duration.toMinutes()).toEqual(10);

    });

    it('should calculate the duration between entries to be zero when there is only one', () => {

        const entries = [
            createEmptyEntry()
        ];

        entries[0].start = '2020-09-03T10:10:00+01:00';
        entries[0].end = '2020-09-03T10:10:00+01:00';

        const duration = getTimeBetweenEntries(0, entries);

        expect(duration.toMinutes()).toEqual(0);
    });

    it('should calculate totals', () => {

        const entries = [
            createEmptyEntry(),
            createEmptyEntry(),
            createEmptyEntry(),
            createEmptyEntry()
        ];

        entries[0].start = '2020-09-03T10:10:00+01:00';
        entries[0].end = '2020-09-03T10:20:00+01:00';
        entries[0].dur = Duration.ofMinutes(10).toMillis();

        entries[1].start = '2020-09-03T10:30:00+01:00';
        entries[1].end = '2020-09-03T10:50:00+01:00';
        entries[1].dur = Duration.ofMinutes(20).toMillis();

        entries[2].start = '2020-09-03T10:50:00+01:00';
        entries[2].end = '2020-09-03T10:50:00+01:00';
        entries[2].dur = Duration.ZERO.toMillis();
        entries[2].tags = ['marker']

        entries[3].start = '2020-09-03T12:00:00+01:00';
        entries[3].end = '2020-09-03T12:50:00+01:00';
        entries[3].dur = Duration.ofMinutes(50).toMillis();

        const totals = calculateTimeTotals(entries);

        expect(totals.bookedTime).toEqual(Duration.ofMinutes(80).toMillis());
        expect(totals.breakTime).toEqual(Duration.ofMinutes(70).toMillis());
        expect(totals.unbookedTime).toEqual(Duration.ofMinutes(10).toMillis());
        expect(totals.timeCount).toEqual(Duration.ofMinutes(90).toMillis());

    });
});