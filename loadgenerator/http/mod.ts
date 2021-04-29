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
      "canberra"
    ], //   'buenos aires', 'canberra', 'pretoria'
  };

  try {
    const response = await fetch("http://localhost:8080/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
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