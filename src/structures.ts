
/**
 * Base object structure for a successful report response
 */
export interface SuccessReportResponse<T> {

    /**
     * Total time in milliseconds for the selected report
     */
    total_grand: number;
    /**
     * An array with detailed information of the requested report. 
     * The structure of the data in the array depends on the report.
     */
    data: T[];
      

}

/**
 * Interface containing the cut down fields of a regular DetailedReportItem
 * that we are actually interested in for this program. 
 */
export interface SimplifiedDetailedReportItem {
    /**
     * time entry description
     */
    description: string;
    /**
     * start time of the time entry in ISO 8601 date and time format (YYYY-MM-DDTHH:MM:SS)
     */
    start: string;
    /**
     * end time of the time entry in ISO 8601 date and time format (YYYY-MM-DDTHH:MM:SS)
     */
    end: string;
    /**
     * time entry duration in milliseconds
     */
    dur: number;
    /**
     * array of tag names, which assigned for the time entry
     */
    tags: string[];
}

/**
 * Interface for the fields returned for a detailed report item. 
 * 
 * This is split with some of the fields in SimplifiedDetailedReportItem,
 * as we don't care about the whole object (and this simplifies testing).
 */
export interface DetailedReportItem extends SimplifiedDetailedReportItem {
    /**
     * time entry id
     */
    id: number;
    /**
     * task id
     */
    tid: number;
    /**
     * project id
     */
    pid: number;
    /**
     * project name for which the time entry was recorded
     */
    project: string;
    /**
     * client name for which the time entry was recorded
     */
    client: string;
    /**
     * task name for which the time entry was recorded
     */
    task: string;
    /**
     * user id whose time entry it is
     */
    uid: number;
    /**
     * full name of the user whose time entry it is
     */
    user: string;
    /**
     * last time the time entry was updated in ISO 8601 date and time format (YYYY-MM-DDTHH:MM:SS)
     */
    updated: Date;
    /**
     * if the stop time is saved on the time entry, depends on user's personal settings.
     */
    use_stop: boolean;
}

export interface DetailedReportResponse extends SuccessReportResponse<DetailedReportItem> {
    /**
     * total number of time entries that were found for the request. 
     * Pay attention to the fact that the amount of time entries 
     * returned is max the number which is returned with the per_page 
     * field (currently 50). To get the next batch of time entries you need to 
     * do a new request with same parameters and the incremented page parameter. 
     * 
     * It is not possible to get all the time entries with one request.
     */
    total_count: number;
    /**
     * how many time entries are displayed in one request
     */
    per_page: number;
}

/**
 * The title of a data item which is returned by the summary report API call. 
 */
export interface SummaryReportTitle {
    client?: string;
    project?: string;
    user?: string;
}

/**
 * Object holding fields for a single data item in the summary report call. 
 */
export interface SummaryReportItem {
    title: SummaryReportTitle;
    time: number;

    items?: SummaryReportItem[];
}

/**
 * Response object for the call to the summary report API. 
 */
export interface SummaryReportResponse extends SuccessReportResponse<SummaryReportItem> {

}