import * as Colors from "https://deno.land/std@0.95.0/fmt/colors.ts";
import { IntervalStats, SummaryStats } from "../session/mod.ts";
export function header() {
  console.clear();
  console.log(Colors.bgBrightGreen(Colors.black("LOAD GENERATOR\n")));
}
export function whisper(msg: string) {
  console.log(Colors.gray(msg));
}
export function announce(msg: string) {
  console.log(Colors.red(msg));
}
export function status(intervalStats: IntervalStats) {
  header();
  console.log(
    Colors.blue(
      `duration ${
        Colors.yellow(intervalStats.durationInSeconds.toString())
      } seconds`,
    ),
  );
  console.log(
    Colors.blue(
      `current load  ${
        Colors.yellow(intervalStats.reqsPerSec.toFixed(2).toString())
      } reqs/s`,
    ),
  );
  console.log(Colors.blue(
    `current avg response time ${
      Colors.yellow(Math.floor(intervalStats.averageResponseTime).toString())
    } ms`,
  ));
}
export function summary(summaryStats: SummaryStats) {
  header();
  console.log(Colors.brightGreen("Summary"));
 

  console.log(
    Colors.blue(
      `duration ${
        Colors.yellow(summaryStats.testDurationInSeconds.toString())
      } seconds`,
    ),
  );
  console.log(
    Colors.blue("total number of requests"),
    Colors.yellow(summaryStats.numReqs.toString()),
  );
  console.log(
    Colors.blue("number of failed requests "),
    Colors.yellow(summaryStats.failedReqs.toString()),
  );

  console.log(
    Colors.blue(
      `average response time ${
        Colors.yellow(Math.floor(summaryStats.averageResponseTime).toString())
      } ms`,
    ),
  );
  console.log(
    Colors.blue(`reqs/s ${Colors.yellow(summaryStats.reqsPerSec.toFixed(2))}`),
  );
}
