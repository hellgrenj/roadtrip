import { Session } from "../session/mod.ts";

export async function sendRequest(session: Session) {
  const start = Date.now();
  const data = {
    places: [
      "stockholm",
      "oslo",
      "tokyo",
      "manila",
      "london",
      "rome",
      "canberra",
    ], //   'buenos aires', 'canberra', 'pretoria'
  };

  try {
    const jsonPayload = JSON.stringify(data);
    let url: string;
    let headers: Record<string, string>;
    if (session.runWithMetallb) {
      url = `http://${session.ingressExternalIp}/itinerary`;
      headers = {
        "Content-Type": "application/json",
        "Host": "testhost.roadtrip.se",
      };
    } else {
      url = "http://localhost:8080/itinerary";
      headers = {
        "Content-Type": "application/json",
      };
    }
    const response = await queryApi(url, jsonPayload, headers);
    if (response.status !== 200) {
      session.failedReqs++;
    }
  } catch (err) {
    console.log(err);
    session.failedReqs++;
  } finally {
    const stop = Date.now();
    const responseTime = stop - start;
    handleResponse(session, responseTime);
  }
}
function handleResponse(session: Session, responseTime: number) {
  session.numReqs += 1;
  if (session.responseTimesPerTimeLapse[session.lastTimeLapse]) {
    session.responseTimesPerTimeLapse[session.lastTimeLapse].push(
      responseTime,
    );
  } else {
    session.responseTimesPerTimeLapse[session.lastTimeLapse] = [
      responseTime,
    ];
  }
}
async function queryApi(
  url: string,
  jsonPayload: string,
  headers: Record<string, string>,
) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: jsonPayload,
  });
  return response;
}
