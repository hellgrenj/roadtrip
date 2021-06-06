export interface Session {
  runWithMetallb: boolean,
  ingressExternalIp: string;
  workFactor: number;
  testStart: number;
  lastTimeLapse: number;
  responseTimesPerTimeLapse: Record<number, number[]>;
  numReqs: number;
  failedReqs: number;
}
const now = Date.now();
export const session = {
  runWithMetallb: false,
  ingressExternalIp: '',
  workFactor: 1,
  testStart: now,
  lastTimeLapse: now,
  responseTimesPerTimeLapse: {},
  numReqs: 0,
  failedReqs: 0,
} as Session;

