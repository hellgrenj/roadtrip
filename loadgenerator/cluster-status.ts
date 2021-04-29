import * as Colors from "https://deno.land/std@0.95.0/fmt/colors.ts";

top();
setInterval(top, 15000);
async function top() : Promise<void> {
  console.clear();
  console.log(Colors.blue('top pods'));
  const topPods = Deno.run({
    cmd: ["kubectl", "top", "pods"],
    stdout: "piped",
  });
  console.log(new TextDecoder().decode(await topPods.output()));


  console.log(Colors.blue('hpa'));
  const hpa = Deno.run({
    cmd: ["kubectl", "get", "hpa"],
    stdout: "piped",
  });
  console.log(new TextDecoder().decode(await hpa.output()));

}
