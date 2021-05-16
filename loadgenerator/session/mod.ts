export interface Session {
  workFactor: number;
  testStart: number;
  lastLapTime: number;
  responseTimesPerLap: Record<number, number[]>;
  numReqs: number;
  failedReqs: number;
  lapTime: () => IntervalStats;
  summary: () => SummaryStats;
}
export interface IntervalStats {
  durationInSeconds: number;
  averageResponseTime: number;
  reqsPerSec: number;
}
export interface SummaryStats {
  numReqs: number;
  failedReqs: number;
  testDurationInSeconds: number;
  averageResponseTime: number;
  reqsPerSec: number;
}
const now = Date.now();
export const session = {
  workFactor: 1,
  testStart: now,
  lastLapTime: now,
  responseTimesPerLap: {},
  numReqs: 0,
  failedReqs: 0,
  lapTime: () => {
    const lapTime = Date.now();
    const durationInSeconds = Math.floor((lapTime - session.testStart) / 1000);
    const durationSinceLastLapTime = Math.floor(
      ((lapTime - session.lastLapTime) / 1000),
    );
    const reqsPerSec = session.responseTimesPerLap[session.lastLapTime].length /
      Math.floor(durationSinceLastLapTime);

    let averageResponseTime = 0;
    if (
      session.responseTimesPerLap[session.lastLapTime] &&
      session.responseTimesPerLap[session.lastLapTime].length > 0
    ) {
      averageResponseTime =
        session.responseTimesPerLap[session.lastLapTime].reduce((
          a: number,
          b: number,
        ) => (a + b)) /
        session.responseTimesPerLap[session.lastLapTime].length;
    }
    session.lastLapTime = lapTime;
    return { durationInSeconds, averageResponseTime, reqsPerSec };
  },
  summary: () => {
    const testStop = Date.now();
    const testDurationInSeconds = Math.floor(
      ((testStop - session.testStart) / 1000),
    );
    const responseTimes = Object.values(session.responseTimesPerLap).flatMap((
      r,
    ) => r);
    const averageResponseTime = responseTimes.reduce((a, b) => (a + b)) /
      responseTimes.length;
    const reqsPerSec = session.numReqs / Math.floor(testDurationInSeconds);
    const numReqs = session.numReqs;
    const failedReqs = session.failedReqs;
    return {
      numReqs,
      failedReqs,
      testDurationInSeconds,
      averageResponseTime,
      reqsPerSec,
    };
  },
} as Session;
