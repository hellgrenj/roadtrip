import { announce, header, status, summary, whisper } from "./printer/mod.ts";
import { session } from "./session/mod.ts";
import { sendRequest } from "./http/mod.ts";

header();
whisper("assembling minions...");
session.runWithMetallb = Deno.args[0] != undefined && Deno.args[0] == "metallb";
if (session.runWithMetallb) {
  session.ingressExternalIp = await getIngressExternalIp();
  whisper(
    `running agains metallb and nginx ingress (external ip ${session.ingressExternalIp})`,
  );
}
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
async function getIngressExternalIp(): Promise<string> {
  const ingressExternalInfo = Deno.run({
    cmd: ["kubectl", "get", "ingress", "-o", "json"],
    stdout: "piped",
  });
  const jsonOutput = JSON.parse(
    new TextDecoder().decode(await ingressExternalInfo.output()),
  );
  const ingressExternalIp =
    jsonOutput.items[0].status.loadBalancer.ingress[0].ip;
  return ingressExternalIp;
}
