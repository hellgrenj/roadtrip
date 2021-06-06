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
    ], //   'buenos aires', 'pretoria'
  };

  try {
    const jsonPayload = JSON.stringify(data);
    let url: string;
    let headers: Record<string, string>;
    if (session.runningWithMetallb()) {
      url = `http://${session.getIngressExternalIp()}/itinerary`;
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
      session.requestFailed();
    }
  } catch (err) {
    console.log(err);
    session.requestFailed();
  } finally {
    const stop = Date.now();
    const responseTime = stop - start;
    session.addResponseTime(responseTime);
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
