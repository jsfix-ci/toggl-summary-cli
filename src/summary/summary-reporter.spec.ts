import { Duration } from '@js-joda/core';

import { SummaryReportItem, SummaryReportTitle } from '../structures';
import {
    calculatePercentage,
    calculateSummaryTotals,
    getGroupingType,
    getGroupingName,
    GroupingType
} from './summary-reporter';

function createEmptyEntry(): SummaryReportItem {
    return {
        title: {
            client: ''
        },
        time: 0,
        items: []
    };
}


describe('summary-reporter parser tests', () => {

    it('should know client title type', () => {
        const title: SummaryReportTitle = {
            client: 'test-client'
        };

        const actualType = getGroupingType(title);
        expect(actualType).toBe(GroupingType.CLIENT);
        const actualName = getGroupingName(title);
        expect(actualName).toBe(title.client);
    });

    it('should know project title type', () => {
        const title: SummaryReportTitle = {
            project: 'test-project'
        };

        const actualType = getGroupingType(title);
        expect(actualType).toBe(GroupingType.PROJECT);
        const actualName = getGroupingName(title);
        expect(actualName).toBe(title.project);
    });

    it('should know user title type', () => {
        const title: SummaryReportTitle = {
            user: 'test-user'
        };

        const actualType = getGroupingType(title);
        expect(actualType).toBe(GroupingType.USER);
        const actualName = getGroupingName(title);
        expect(actualName).toBe(title.user);
    });

});

describe('summary-reporter math tests', () => {

    it('should calculate percentages', () => {

        const actualValue = calculatePercentage(10, 100);
        expect(actualValue).toBe(10);
    });

    it('should not fail with zero values', () => {
        const actualValue = calculatePercentage(10, 0);
        expect(actualValue).toBe(0);
    });

});

describe('summary-reporter calculate summary tests, without detailed time calculations', () => {

    /**
     * Where there is a specific entry under test, this
     * will be it. 
     */
    let testEntry: SummaryReportItem;

    beforeEach(() => {
        /* Initially configure an empty entry that tests
         * can customise as they please */
        testEntry = createEmptyEntry();
    });

    it('should parse test summary file correctly', () => {
        /* This test uses a stripped down file based on a real API call */
        const testData = require('../../test-resources/summary.json');
        
        const actualResult = calculateSummaryTotals(testData.data, undefined, false);
        
        expect(actualResult).toBeDefined();
        expect(actualResult.length).toBe(5);

        expect(actualResult[0].name).toBe('Client-2')
        expect(actualResult[0].bookedTime).toBe(29893000);
        expect(actualResult[0].percentageOfTotalTime.toFixed(2)).toBe('32.76');
        expect(actualResult[0].subgroupSummary).toBeDefined();

        expect(actualResult[1].name).toBe('Legacy')
        expect(actualResult[1].bookedTime).toBe(22097000);
        expect(actualResult[1].percentageOfTotalTime.toFixed(2)).toBe('24.22');
        /* We will only test values for the a single item here.
         * Don't need to go through every item, the inner array uses the exact same process / object
         * structure as the outers. 
         */
        expect(actualResult[1].subgroupSummary).toBeDefined();
        expect(actualResult[1].subgroupSummary!.length).toBe(3);
        expect(actualResult[1].subgroupSummary![0]).toBeDefined();
        expect(actualResult[1].subgroupSummary![0].name).toBe('LP-Support');
        expect(actualResult[1].subgroupSummary![0].bookedTime).toBe(13455000);
        expect(actualResult[1].subgroupSummary![0].percentageOfTotalTime.toFixed(2)).toBe('60.89');
        expect(actualResult[1].subgroupSummary![0].subgroupSummary).toBeUndefined();

        expect(actualResult[2].name).toBe('Client-1')
        expect(actualResult[2].bookedTime).toBe(17407000);
        expect(actualResult[2].percentageOfTotalTime.toFixed(2)).toBe('19.08');
        expect(actualResult[2].subgroupSummary).toBeDefined();


        /* This is the catch-all "unknown project" item */
        expect(actualResult[3].name).toBe('Unknown Client/Project');
        expect(actualResult[3].bookedTime).toBe(12492000);
        expect(actualResult[3].percentageOfTotalTime.toFixed(2)).toBe('13.69');

        expect(actualResult[4].name).toBe('Client-3')
        expect(actualResult[4].bookedTime).toBe(9352000);
        expect(actualResult[4].percentageOfTotalTime.toFixed(2)).toBe('10.25');
        expect(actualResult[4].subgroupSummary).toBeDefined();

        
    });
    

});


// describe('summary-reporter nested tests', () => {

// });