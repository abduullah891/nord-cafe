const { execSync } = require("child_process");

const port = process.argv[2] || "3000";

try {
  const stdout = execSync(
    `netstat -ano | findstr "LISTENING" | findstr ":${port} "`,
    { encoding: "utf8", timeout: 5000 }
  );

  const lines = stdout.trim().split("\n");
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== "0") {
      try {
        process.kill(parseInt(pid, 10), "SIGTERM");
        console.log(`Killed process ${pid} on port ${port}`);
      } catch {
        // Process might already be dead
      }
    }
  }
} catch {
  // No process found on port
}
