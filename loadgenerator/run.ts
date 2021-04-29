import { announce, header, status, summary, whisper } from "./printer/mod.ts";
import { session } from "./session/mod.ts";
import { sendRequest } from "./http/mod.ts";

header();
whisper("assembling minions...");

// start generating load
let generateLoadInterval = generateLoad();
// increase the load by changing the workFactor every 10 seconds
const increasingLoadInterval = setInterval(turnUpTheHeat, 10000);
// print status every 8 seconds
setInterval(() => {
  status(session);
}, 8000);
// print a summary when user stops process (ctrl + c)
await Deno.signal(Deno.Signal.SIGINT);
summary(session);
Deno.exit();

function generateLoad(): number {
  return setInterval(() => {
    sendRequest(session);
  }, 800 * session.workFactor);
}
function turnUpTheHeat() {
  if (session.workFactor > 0.2) {
    clearInterval(generateLoadInterval);
    session.workFactor = session.workFactor - 0.1;
    whisper("increasing load...");
    generateLoadInterval = generateLoad();
  } else {
    announce("reached maximum load");
    clearInterval(increasingLoadInterval);
  }
}
