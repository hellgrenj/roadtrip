export interface Session {
  getWorkFactor: () => number;
  decreaseWorkFactor: () => void;
  addResponseTime: (responseTime: number) => void;
  requestFailed: () => void;
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
const config = {
  workFactor: 1,
};
const now = Date.now();
const stats = {
  testStart: now,
  lastLapTime: now,
  responseTimesPerLap: {} as Record<number, number[]>,
  numReqs: 0,
  failedReqs: 0,
};
export const session = {
  lapTime: () => {
    const lapTime = Date.now();
    const durationInSeconds = Math.floor((lapTime - stats.testStart) / 1000);
    const durationSinceLastLapTime = Math.floor(
      ((lapTime - stats.lastLapTime) / 1000),
    );
    const reqsPerSec = stats.responseTimesPerLap[stats.lastLapTime].length /
      Math.floor(durationSinceLastLapTime);

    let averageResponseTime = 0;
    if (
      stats.responseTimesPerLap[stats.lastLapTime] &&
      stats.responseTimesPerLap[stats.lastLapTime].length > 0
    ) {
      averageResponseTime =
        stats.responseTimesPerLap[stats.lastLapTime].reduce((
          a: number,
          b: number,
        ) => (a + b)) /
        stats.responseTimesPerLap[stats.lastLapTime].length;
    }
    stats.lastLapTime = lapTime;
    return { durationInSeconds, averageResponseTime, reqsPerSec };
  },
  summary: () => {
    const testStop = Date.now();
    const testDurationInSeconds = Math.floor(
      ((testStop - stats.testStart) / 1000),
    );
    const responseTimes = Object.values(stats.responseTimesPerLap).flatMap((
      r,
    ) => r);
    const averageResponseTime = responseTimes.reduce((a, b) => (a + b)) /
      responseTimes.length;
    const reqsPerSec = stats.numReqs / Math.floor(testDurationInSeconds);
    const numReqs = stats.numReqs;
    const failedReqs = stats.failedReqs;
    return {
      numReqs,
      failedReqs,
      testDurationInSeconds,
      averageResponseTime,
      reqsPerSec,
    };
  },
  getWorkFactor: () => {
    return config.workFactor;
  },
  decreaseWorkFactor: () => {
    config.workFactor = config.workFactor - 0.1;
  },
  addResponseTime: (responseTime) => {
    stats.numReqs += 1;
    if (stats.responseTimesPerLap[stats.lastLapTime]) {
      stats.responseTimesPerLap[stats.lastLapTime].push(
        responseTime,
      );
    } else {
      stats.responseTimesPerLap[stats.lastLapTime] = [
        responseTime,
      ];
    }
  },
  requestFailed: () => {
    stats.failedReqs++;
  },
} as Session;
