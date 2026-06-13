import { test, describe } from "node:test";
import assert from "node:assert";
import { KdriveClient } from "../dist/kdrive-client.js";

describe("KdriveClient instantiation", () => {
    test("creates a client with token and driveId", () => {
        const client = new KdriveClient("test-token", "123456");
        assert.ok(client);
    });

    test("exposes all expected methods", () => {
        const client = new KdriveClient("test-token", "123456");
        const methods = [
            "search", "uploadFile", "listFiles", "rename", "move",
            "deleteFile", "shareLink", "shareAccess", "createFolder",
            "restore", "info", "recents", "sharedWithMe", "list",
            "getFile", "downloadFile",
        ];
        for (const m of methods) {
            assert.strictEqual(
                typeof client[m],
                "function",
                `method ${m} should be a function`
            );
        }
    });
});

describe("KdriveClient.search", () => {
    test("calls fetch with correct URL", async () => {
        let capturedUrl = null;
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url) => {
            capturedUrl = url;
            return { json: async () => ({ result: "success", data: [] }) };
        };

        const client = new KdriveClient("mock-token", "123");
        await client.search("test");

        assert.ok(capturedUrl, "fetch was called");
        assert.ok(capturedUrl.includes("/drive/123/files/search"), "URL contains drive ID");
        assert.ok(capturedUrl.includes("query=test"), "URL contains query");

        globalThis.fetch = originalFetch;
    });
});

describe("KdriveClient.uploadFile", () => {
    test("throws when neither text nor base64 provided", async () => {
        const client = new KdriveClient("mock-token", "123");
        await assert.rejects(
            async () => client.uploadFile("test.txt"),
            /Either text_content or base64_content must be provided/
        );
    });
});

describe("KdriveClient.createFolder", () => {
    test("calls correct endpoint", async () => {
        let capturedUrl = null;
        let capturedBody = null;
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, options) => {
            capturedUrl = url;
            capturedBody = options?.body;
            return { json: async () => ({ result: "success", data: { id: 42 } }) };
        };

        const client = new KdriveClient("mock-token", "123");
        const result = await client.createFolder(10, "my-folder");

        assert.strictEqual(result.data.id, 42);
        assert.ok(capturedUrl.includes("/drive/123/files/10/directory"), "URL contains correct path");
        assert.strictEqual(capturedBody, JSON.stringify({ name: "my-folder" }), "Body is correct");

        globalThis.fetch = originalFetch;
    });
});

describe("KdriveClient.listFiles", () => {
    test("lists files without filter", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async () => ({ json: async () => ({ result: "success", data: [] }) });

        const client = new KdriveClient("mock-token", "123");
        await client.listFiles(10);

        globalThis.fetch = originalFetch;
    });
});
