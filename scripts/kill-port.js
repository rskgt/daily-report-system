/**
 * 指定ポートを占有しているプロセスを強制終了する (Windows用)
 * 使い方: node scripts/kill-port.js 3000
 */
const { execSync } = require("node:child_process");

const port = process.argv[2] || "3000";

try {
  const output = execSync(
    `netstat -ano | findstr :${port} | findstr LISTENING`,
    {
      encoding: "utf-8",
    },
  );
  const pids = new Set();
  for (const line of output.trim().split("\n")) {
    const pid = line.trim().split(/\s+/).pop();
    if (pid && pid !== "0") {
      pids.add(pid);
    }
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { encoding: "utf-8" });
      console.log(`Killed process ${pid} on port ${port}`);
    } catch {
      // プロセスが既に終了している場合は無視
    }
  }
} catch {
  console.log(`Port ${port} is free`);
}
