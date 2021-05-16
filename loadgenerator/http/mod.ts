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
    const response = await fetch("http://localhost:8080/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
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
