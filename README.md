This CLI tool is for a specific use case that I have. 

I use [Toggl Track][toggl_track] for keeping track of what I am spending my time on while working. I'm not a contractor though, so I don't have any hard requirement to ensure every minute of my day is accounted for. I do need to know though how many hours in a day or week that I have have been on the clock for reporting purposes.

This tool will, for a day or a week, report on:
- booked time, the total for tasks
- unbooked time, the total for unaccounted for time between tasks
- total time, the sum of booked and unbooked time
- break time, the sum of any times between a "marker" entry and the next task

In order to pick up on unbooked time and differenciate it from break time, I add entries with a tag of "marker". This is used to indicate the start of a break. The break is determined to end when the next entry starts. 

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
  -h, --help                     display help for command
```

This uses [dotenv][dotenv] for supporting loading secrets from a `.env` file in directory the tool is ran from. This is used to provide default values for the required CLI options above. This file can contain:

```
API_TOKEN=<api token, found in Toggle profile settings>
EMAIL=<your email address>
WORKSPACE_ID=<id of the Toggle workspace>

```

## Example Usage 

An example of running this for a single day:
```
$ npx @devwithimagination/toggl-summary-cli -d 2020-09-18
Report loaded, total booked time: 02:49:13
Unbooked time since last entry: 00:22:04
Unbooked time since last entry: 00:11:02
Unbooked time since last entry: 00:15:05
==== Totals for 2020-09-18 to 2020-09-18 ====
Counted booked time: 02:49:11
Counted unbooked time: 00:54:20
Counted break time: 00:00:00
Counted total time: 03:43:31
```

Running for a week:
```
$ npx @devwithimagination/toggl-summary-cli -d 2020-09-14 -w
Report loaded, total booked time: 34:26:11
Unbooked time since last entry: 00:15:26
Unbooked time since last entry: 00:14:40
Unbooked time since last entry: 00:15:05
Break time! 00:55:40
Unbooked time since last entry: 00:08:04
Unbooked time since last entry: 00:45:49
Unbooked time since last entry: 00:07:16
Unbooked time since last entry: 00:10:04
Unbooked time since last entry: 00:29:01
Unbooked time since last entry: 00:07:33
Break time! 00:52:03
Unbooked time since last entry: 00:25:20
Unbooked time since last entry: 00:30:34
Break time! 00:07:51
Unbooked time since last entry: 00:22:04
Unbooked time since last entry: 00:11:02
Unbooked time since last entry: 00:15:05
Unbooked time since last entry: 00:06:41
Unbooked time since last entry: 00:15:06
Unbooked time since last entry: 00:13:41
Unbooked time since last entry: 00:19:29
Unbooked time since last entry: 00:07:34
Break time! 00:24:27
Break time! 00:56:54
Unbooked time since last entry: 00:18:09
Unbooked time since last entry: 00:06:47
==== Totals for 2020-09-14 to 2020-09-21 ====
Counted booked time: 21:14:34
Counted unbooked time: 05:59:31
Counted break time: 03:16:55
Counted total time: 27:14:05
```

When running this from a locally checked out project, you need to pass `--` to stop `ts-node` interpreting the arguments as its own. 

```
$ npm run cli -- -d 2020-09-18

> @devwithimagination/toggl-summary-cli@0.1.0-alpha.1 cli /Users/david/Development/Projects/toggl-summary-cli
> ts-node ./src/cli.ts "-d" "2020-09-18"

Report loaded, total booked time: 02:49:13
Unbooked time since last entry: 00:22:04
Unbooked time since last entry: 00:11:02
Unbooked time since last entry: 00:15:05
==== Totals for 2020-09-18 to 2020-09-18 ====
Counted booked time: 02:49:11
Counted unbooked time: 00:54:20
Counted break time: 00:00:00
Counted total time: 03:43:31
```

## Testing

This project uses [jest][jest] with [ts-jest][ts-jest] for testing. Running `npm test` will run the test suites and output coverage reports into the `coverage` directory. 

[commander.js]: https://github.com/tj/commander.js/ "tj/commander.js: node.js command-line interfaces made easy"
[toggl_track]: https://toggl.com/track/ "Toggl Track: Effortless Time-Tracking for Any Workflow"
[dotenv]: https://www.npmjs.com/package/dotenv "dotenv  -  npm"
[jest]: https://jestjs.io "Jest - Delightful JavaScript Testing"
[ts-jest]: https://github.com/kulshekhar/ts-jest "kulshekhar/ts-jest: TypeScript preprocessor with sourcemap support for Jest"