This CLI tool is for a specific use case that I have. 

I use [Toggl Track][toggl_track] for keeping track of what I am spending my time on while working. I'm not a contractor though, so I don't have any hard requirement to ensure every minute of my day is accounted for. I do need to know though how many hours in a day or week that I have have been on the clock for reporting purposes.

This tool will, for a day or a week, report on:
- booked time, the total for tasks
- unbooked time, the total for unaccounted for time between tasks
- total time, the sum of booked and unbooked time
- break time, the sum of any times between a "marker" entry and the next task

In order to pick up on unbooked time and differentiate it from break time, I add entries with a tag of "marker". This is used to indicate the start of a break. The break is determined to end when the next entry starts. 

## Configuration

This uses [commander.js][commander.js] for supporting command line arguments. Running the program with a `-h` or `--help` flag will print out the usage instructions. Note if you have a `.env` file as below this will include the values from that file in the output. 

```
 npm run cli -- --help

> @devwithimagination/toggl-summary-cli@0.1.0-alpha.1 cli /Users/david/Development/Projects/toggl-summary-cli
> ts-node ./src/cli.ts "--help"

Usage: cli [options]

Options:
  -D, --debug                    output extra debugging
  --api-key <api-key>            api token, found in Toggle profile settings
  --email <email>                your email address
  --workspace-id <workspace id>  id of the Toggle workspace
  -d, --day <date>               day to report on (in yyyy-MM-dd format). If a date is not supplied 
                                 then this will default to today. (default: "2020-09-21")
  -w, --week                     If specified, interpret the day as the start of a week.
  --include-summary              If specified, include client/project summary detail
  -h, --help                     display help for command
```

This uses [dotenv][dotenv] for supporting loading secrets from a `.env` file in directory the tool is ran from. This is used to provide default values for the required CLI options above. This file can contain:

```
API_TOKEN=<api token, found in Toggle profile settings>
EMAIL=<your email address>
WORKSPACE_ID=<id of the Toggle workspace>

```

If the program is called with a `DOT_ENV_CONFIG` environment variable set, then an alternative location can be specified for this configuration file. 


## Example Usage 

An example of running this for a single day:
```
$ npx @devwithimagination/toggl-summary-cli -d 2020-09-18
# Totals for 2020-09-18 to 2020-09-18

* Booked time: 02:49:11
* Unbooked time: 00:54:20
* Break time: 00:00:00
* Total time (booked + unbooked): 03:43:31
```

An example of running this for a single day, including summary information:
```
$ npx @devwithimagination/toggl-summary-cli -d 2020-09-18 --include-summary
# Totals for 2020-09-18 to 2020-09-18

* Booked time: 02:49:11
* Unbooked time: 00:54:20
* Break time: 00:00:00
* Total time (booked + unbooked): 03:43:31

# Summary

* Client-1: 31.74% (01:10:57)
  * UI: 55.39% (00:39:18)
  * API: 44.61% (00:31:39)

* Unknown Client/Project: 24.78% (00:55:23)
  * Unknown Client/Project: 100.00% (00:55:23)

* Unbooked Time: 24.31% (00:54:20)
```

Running for a single day, using a configuration file in an alternative location:
```
$ DOT_ENV_CONFIG=~/.toggl-summary-cli.env npx @devwithimagination/toggl-summary-cli -d 2020-09-18
# Totals for 2020-09-18 to 2020-09-18

* Booked time: 02:49:11
* Unbooked time: 00:54:20
* Break time: 00:00:00
* Total time (booked + unbooked): 03:43:31
```

Running for a week:
```
$ npx @devwithimagination/toggl-summary-cli -d 2020-09-14 -w
# Totals for 2020-09-14 to 2020-09-20

* Booked time: 28:21:26
* Unbooked time: 07:20:12
* Break time: 04:01:59
* Total time (booked + unbooked): 35:41:38
```

When running this from a locally checked out project, you need to pass `--` to stop `ts-node` interpreting the arguments as its own. 

```
$ npm run cli -- -d 2020-09-18

> @devwithimagination/toggl-summary-cli@0.1.0-alpha.1 cli /Users/david/Development/Projects/toggl-summary-cli
> ts-node ./src/cli.ts "-d" "2020-09-18"

# Totals for 2020-09-18 to 2020-09-18

* Booked time: 02:49:11
* Unbooked time: 00:54:20
* Break time: 00:00:00
* Total time (booked + unbooked): 03:43:31
```

### Advanced Usage - To create a Day One Entry

I use [Day One](https://dayoneapp.com) as my journaling application of choice. This utility script was primarily created to produce the starter for a template for daily or weekly entries relating to work. 

To create a daily entry, for the current day, I run:
```
$ dayone2 --tags work -- new $'End of Day Work Summary\n\n' "$(DOT_ENV_CONFIG=~/.toggl-summary-cli.env npx @devwithimagination/toggl-summary-cli )"
```

To create a weekly entry, for the current week, I run:
```
$ dayone2 --tags work -- new $'End of Week Work Summary\n\n' "$(DOT_ENV_CONFIG=~/.toggl-summary-cli.env npx @devwithimagination/toggl-summary-cli -d $(date -v -Mon +%Y-%m-%d) -w )"
```

## Testing

This project uses [jest][jest] with [ts-jest][ts-jest] for testing. Running `npm test` will run the test suites and output coverage reports into the `coverage` directory. 

[commander.js]: https://github.com/tj/commander.js/ "tj/commander.js: node.js command-line interfaces made easy"
[toggl_track]: https://toggl.com/track/ "Toggl Track: Effortless Time-Tracking for Any Workflow"
[dotenv]: https://www.npmjs.com/package/dotenv "dotenv  -  npm"
[jest]: https://jestjs.io "Jest - Delightful JavaScript Testing"
[ts-jest]: https://github.com/kulshekhar/ts-jest "kulshekhar/ts-jest: TypeScript preprocessor with sourcemap support for Jest"