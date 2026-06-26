import { describe, it } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(__dirname, "..", "dist", "index.js");
const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

// Launches dist/index.js the way `npx` / MCP clients do: through a bin symlink,
// then drives a minimal MCP `initialize` handshake over stdio and resolves with
// the first JSON-RPC response (or null on timeout).
function handshakeViaSymlink(timeoutMs = 8000) {
    return new Promise((resolve) => {
        const linkDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-bin-"));
        const link = path.join(linkDir, "mcp-server-kdrive");
        fs.symlinkSync(entry, link);

        const child = spawn(process.execPath, [link], {
            env: { ...process.env, KDRIVE_TOKEN: "test-token", KDRIVE_ID: "1" },
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let settled = false;
        const finish = (value) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            child.kill();
            try { fs.rmSync(linkDir, { recursive: true, force: true }); } catch {}
            resolve(value);
        };

        const timer = setTimeout(() => finish(null), timeoutMs);

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
            for (const line of stdout.split("\n")) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                    const msg = JSON.parse(trimmed);
                    if (msg.id === 1) finish(msg);
                } catch {}
            }
        });

        // Exiting before answering means main() never connected the transport.
        child.on("exit", () => finish(null));

        const initialize = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "startup-test", version: "1.0.0" },
            },
        };
        child.stdin.write(JSON.stringify(initialize) + "\n");
    });
}

describe("server startup", () => {
    it("responds to an MCP initialize handshake when launched via bin symlink", async () => {
        const response = await handshakeViaSymlink();
        assert.ok(
            response,
            "server exited without answering initialize — main() did not connect the transport (bin-symlink entry-point bug)",
        );
        assert.strictEqual(response.id, 1);
        assert.ok(response.result, "initialize response should carry a result");
        assert.ok(
            response.result.serverInfo,
            "initialize result should include serverInfo",
        );
        assert.strictEqual(response.result.serverInfo.version, packageJson.version);
    });
});
