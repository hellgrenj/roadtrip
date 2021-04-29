export interface Session {
  workFactor: number;
  testStart: number;
  lastTimeLapse: number;
  responseTimesPerTimeLapse: Record<number, number[]>;
  numReqs: number;
  failedReqs: number;
}
const now = Date.now();
export const session = {
  workFactor: 1,
  testStart: now,
  lastTimeLapse: now,
  responseTimesPerTimeLapse: {},
  numReqs: 0,
  failedReqs: 0,
} as Session;

