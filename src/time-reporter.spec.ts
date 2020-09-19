import { SimplifiedDetailedReportItem } from './structures';
import { doesEntryHaveBreakStartMarker, wasPreviousEntryBreakStart } from './time-reporter';

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
});