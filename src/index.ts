#!/usr/bin/env node

import {McpServer, ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

const token = process.env.KDRIVE_TOKEN;
const drive_id = process.env.KDRIVE_ID;

if (!token || !drive_id) {
    console.error(
        "Please set KDRIVE_TOKEN and KDRIVE_ID environment variables",
    );
    process.exit(1);
}

const server = new McpServer(
    {
        name: "kDrive MCP Server",
        version: "0.0.1",
    },
    {
        capabilities: {
            completions: {},
            prompts: {},
            resources: {},
            tools: {},
        },
    },
);

class KdriveClient {
    private readonly headers: { Authorization: string; "Content-Type": string };

    constructor() {
        this.headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    async search(query: string): Promise<any> {
        const params = new URLSearchParams({
            query,
            limit: "10"
        });

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/search?${params}`,
            {headers: this.headers},
        );

        return response.json();
    }

    async list(file_id = 1): Promise<any> {
        const params = new URLSearchParams({
            "type[]": "file"
        });

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/${file_id}/files?${params}`,
            {
                headers: this.headers
            },
        );

        return response.json();
    }

    async getFile(file_id: string): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}`,
            {
                headers: this.headers
            },
        );

        return response.json()
    }

    async downloadFile(file_id: string): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}/download`,
            {
                headers: this.headers
            },
        );

        return response.text()
    }
}

const kDriveClient = new KdriveClient();

server.tool(
    "kdrive_search",
    "Search for files in Infomanik kDrive",
    {
        query: z.string().describe("Search query")
    },
    async ({query}) => {
        const response = await kDriveClient.search(query);

        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.resource(
    "kdrive_file",
    new ResourceTemplate("kdrive://{id}", {
        list: async function () {
            const rootFolder = await kDriveClient.list();
            const response = await kDriveClient.list(rootFolder.data[0].id);

            return {
                resources: response.data.map((file: any) => ({
                    uri: `kdrive://${file.id}`,
                    mimeType: file.mime_type,
                    name: file.name,
                })),
                nextCursor: response.cursor
            }
        }
    }),
    async function (uri, datas) {
        const response = await kDriveClient.downloadFile(datas.id.toString());
        const file = await kDriveClient.getFile(datas.id.toString());

        return {
            contents: [{
                uri: uri.href,
                blob: btoa(response),
                mimeType: file.data.mime_type
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
