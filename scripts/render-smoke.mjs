import { spawn } from "node:child_process";

const port = Number(process.env.RENDER_SMOKE_PORT || "10001");
const url = `http://127.0.0.1:${port}/`;
const child = spawn(process.execPath, ["dist/index.js"], {
  env: { ...process.env, NODE_ENV: "production", PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
child.stdout.on("data", chunk => {
  output += chunk.toString();
});
child.stderr.on("data", chunk => {
  output += chunk.toString();
});

const deadline = Date.now() + 30_000;
let healthy = false;

try {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        healthy = true;
        break;
      }
    } catch {
      // The server may still be starting.
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (!healthy) {
    throw new Error(`Production smoke test failed for ${url}\n${output}`);
  }

  console.log(`Render smoke test passed: ${url}`);
} finally {
  child.kill("SIGTERM");
  await new Promise(resolve => {
    child.once("exit", resolve);
    setTimeout(resolve, 2_000);
  });
}
