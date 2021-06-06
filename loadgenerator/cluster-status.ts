import * as Colors from "https://deno.land/std@0.95.0/fmt/colors.ts";

const runWithMetal = Deno.args[0] != undefined && Deno.args[0] == "metallb";
top();
setInterval(top, 15000);

async function top(): Promise<void> {
  console.clear();
  if (runWithMetal) {
    console.log(Colors.yellow("running against metallb"));
  }
  console.log(Colors.blue("top pods"));
  const topPods = Deno.run({
    cmd: ["kubectl", "top", "pods"],
    stdout: "piped",
  });
  console.log(new TextDecoder().decode(await topPods.output()));

  if (runWithMetal) {
    console.log(Colors.blue("top pods -n metallb-system"));
    const topPodsForMetallb = Deno.run({
      cmd: ["kubectl", "top", "pods", "-n", "metallb-system"],
      stdout: "piped",
    });
    console.log(new TextDecoder().decode(await topPodsForMetallb.output()));
  }

  console.log(Colors.blue("hpa"));
  const hpa = Deno.run({
    cmd: ["kubectl", "get", "hpa"],
    stdout: "piped",
  });
  console.log(new TextDecoder().decode(await hpa.output()));
}
