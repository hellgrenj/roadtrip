import * as Colors from "https://deno.land/std@0.95.0/fmt/colors.ts";
import { Session } from "../session/mod.ts";
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
export function status(session: Session) {
  header();
  const timeLapse = Date.now();
  const durationInSeconds = Math.floor((timeLapse - session.testStart) / 1000);
  console.log(
    Colors.blue(
      `duration ${Colors.yellow(durationInSeconds.toString())} seconds`,
    ),
  );
  const durationSinceLastTimeLapse = Math.floor(
    ((timeLapse - session.lastTimeLapse) / 1000),
  );
  const reqsPerSec = session.responseTimesPerTimeLapse[session.lastTimeLapse].length /
    Math.floor(durationSinceLastTimeLapse);
  console.log(
    Colors.blue(
      `current load  ${Colors.yellow(reqsPerSec.toFixed(2).toString())} reqs/s`,
    ),
  );
  if (
    session.responseTimesPerTimeLapse[session.lastTimeLapse] &&
    session.responseTimesPerTimeLapse[session.lastTimeLapse].length > 0
  ) {
    const averageResponseTime =
      session.responseTimesPerTimeLapse[session.lastTimeLapse].reduce((
        a: number,
        b: number,
      ) => (a + b)) / session.responseTimesPerTimeLapse[session.lastTimeLapse].length;
    console.log(Colors.blue(
      `current avg response time ${
        Colors.yellow(Math.floor(averageResponseTime).toString())
      } ms`,
    ));
  }

  session.lastTimeLapse = Date.now();
}
export function summary(session: Session) {
  header();
  console.log(Colors.brightGreen("Summary"));
  const testStop = Date.now();
  const testDurationInSeconds = Math.floor(
    ((testStop - session.testStart) / 1000),
  );
  console.log(
    Colors.blue(
      `duration ${Colors.yellow(testDurationInSeconds.toString())} seconds`,
    ),
  );
  console.log(
    Colors.blue("total number of requests"),
    Colors.yellow(session.numReqs.toString()),
  );
  console.log(
    Colors.blue("number of failed requests "),
    Colors.yellow(session.failedReqs.toString()),
  );
  const responseTimes = Object.values(session.responseTimesPerTimeLapse).flatMap(r => r)

  const averageResponseTime = responseTimes.reduce((a, b) => (a + b)) /
   responseTimes.length;
  console.log(
    Colors.blue(
      `average response time ${
        Colors.yellow(Math.floor(averageResponseTime).toString())
      } ms`,
    ),
  );
  const reqsPerSec = session.numReqs / Math.floor(testDurationInSeconds);
  console.log(Colors.blue(`reqs/s ${Colors.yellow(reqsPerSec.toFixed(2))}`));
}
