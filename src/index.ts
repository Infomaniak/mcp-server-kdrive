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
        version: "0.0.3",
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

    async uploadFile(
        file_name: string,
        directory_id = 1,
        textContent?: string,
        base64Content?: string
    ): Promise<any> {
        let buffer: Buffer;

        if (textContent) {
            buffer = Buffer.from(textContent, "utf-8");
        } else if (base64Content) {
            buffer = Buffer.from(base64Content, "base64");
        } else {
            throw new Error("Either text_content or base64_content must be provided");
        }

        const params = new URLSearchParams({
            directory_id: directory_id.toString(),
            file_name,
            total_size: buffer.length.toString(),
        });

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/upload?${params}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/octet-stream",
                },
                body: buffer,
            },
        );

        return response.json();
    }

    async listFiles(file_id = 1, filters?: { type?: string }): Promise<any> {
        const params = new URLSearchParams();
        if (filters?.type) {
            params.set("type[]", filters.type);
        }
        const query = params.toString() ? `?${params}` : "";

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/${file_id}/files${query}`,
            {
                headers: this.headers,
            },
        );

        return response.json();
    }

    async rename(file_id: number, name: string): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}/rename`,
            {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({ name }),
            },
        );

        return response.json();
    }

    async move(file_id: number, dest_id: number): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/${file_id}/move/${dest_id}`,
            {
                method: "POST",
                headers: this.headers,
            },
        );

        return response.json();
    }

    async deleteFile(file_id: number): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response.json();
    }

    async shareLink(file_id: number, options: Record<string, unknown>): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}/link`,
            {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(options),
            },
        );

        return response.json();
    }

    async shareAccess(file_id: number, emails: string[], right: string, message?: string, lang = "en"): Promise<any> {
        const body: Record<string, unknown> = { emails, right };
        if (message) body.message = message;

        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}/access/invitations?lang=${lang}`,
            {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(body),
            },
        );

        return response.json();
    }

    async createFolder(file_id = 1, name: string): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/${file_id}/directory`,
            {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({ name }),
            },
        );

        return response.json();
    }

    async restore(file_id: number, destination_directory_id: number): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/trash/${file_id}/restore`,
            {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({ destination_directory_id }),
            },
        );

        return response.json();
    }

    async info(file_id: number): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/${file_id}`,
            {
                headers: this.headers,
            },
        );

        return response.json();
    }

    async recents(filters?: { type?: string }): Promise<any> {
        const params = new URLSearchParams();
        if (filters?.type) params.set("type[]", filters.type);
        const query = params.toString() ? `?${params}` : "";

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/recents${query}`,
            {
                headers: this.headers,
            },
        );

        return response.json();
    }

    async sharedWithMe(filters?: { type?: string }): Promise<any> {
        const params = new URLSearchParams();
        if (filters?.type) params.set("type[]", filters.type);
        const query = params.toString() ? `?${params}` : "";

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${drive_id}/files/shared_with_me${query}`,
            {
                headers: this.headers,
            },
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

    async downloadFile(file_id: string): Promise<ArrayBuffer> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${drive_id}/files/${file_id}/download`,
            {
                headers: this.headers
            },
        );

        return response.arrayBuffer()
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

server.tool(
    "kdrive_upload_file",
    "Upload a new file to kDrive. Accepts either text_content (UTF-8 text) or base64_content (binary data), but not both.",
    {
        file_name: z.string().describe("Name of the file to upload"),
        text_content: z.string().optional().describe("Text content (UTF-8). Mutually exclusive with base64_content."),
        base64_content: z.string().optional().describe("Base64 encoded content for binary files. Mutually exclusive with text_content."),
        directory_id: z.number().optional().describe("Destination directory ID. Default is root = 1."),
    },
    async ({file_name, text_content, base64_content, directory_id}) => {
        if (text_content && base64_content) {
            throw new Error("Cannot provide both text_content and base64_content.");
        }
        if (!text_content && !base64_content) {
            throw new Error("Either text_content or base64_content must be provided.");
        }
        const response = await kDriveClient.uploadFile(
            file_name,
            directory_id ?? 1,
            text_content ?? undefined,
            base64_content ?? undefined
        );
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_list",
    "List files and directories in a folder",
    {
        file_id: z.number().optional().describe("Directory ID (default is root = 1)"),
        type: z.enum(["file", "dir"]).optional().describe("Filter by type: file or dir"),
    },
    async ({file_id, type}) => {
        const response = await kDriveClient.listFiles(file_id ?? 1, type ? { type } : undefined);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_rename",
    "Rename a file or directory in kDrive",
    {
        file_id: z.number().describe("File or directory ID"),
        name: z.string().describe("New name"),
    },
    async ({file_id, name}) => {
        const response = await kDriveClient.rename(file_id, name);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_move",
    "Move a file or directory to another directory",
    {
        file_id: z.number().describe("File or directory ID"),
        dest_id: z.number().describe("Destination directory ID"),
    },
    async ({file_id, dest_id}) => {
        const response = await kDriveClient.move(file_id, dest_id);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_delete",
    "Move a file or directory to the trash",
    {
        file_id: z.number().describe("File or directory ID"),
    },
    async ({file_id}) => {
        const response = await kDriveClient.deleteFile(file_id);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_share_link",
    "Create a share link for a file or directory",
    {
        file_id: z.number().describe("File or directory ID"),
        right: z.enum(["inherit", "password", "public"]).describe("Link access level"),
        password: z.string().optional().describe("Password if right is password"),
        valid_until: z.number().optional().describe("Unix timestamp for link expiration"),
        can_download: z.boolean().optional().describe("Allow download via link"),
        can_edit: z.boolean().optional().describe("Allow editing via link"),
        can_request_access: z.boolean().optional().describe("Allow users to request access"),
    },
    async ({file_id, right, password, valid_until, can_download, can_edit, can_request_access}) => {
        const options: Record<string, unknown> = { right };
        if (password) options.password = password;
        if (valid_until !== undefined) options.valid_until = valid_until;
        if (can_download !== undefined) options.can_download = can_download;
        if (can_edit !== undefined) options.can_edit = can_edit;
        if (can_request_access !== undefined) options.can_request_access = can_request_access;
        const response = await kDriveClient.shareLink(file_id, options);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_share_access",
    "Give access to a file or directory by email invitation",
    {
        file_id: z.number().describe("File or directory ID"),
        emails: z.array(z.string()).describe("List of recipient emails"),
        right: z.enum(["manage", "read", "write"]).describe("Access level"),
        message: z.string().optional().describe("Optional invitation message"),
    },
    async ({file_id, emails, right, message}) => {
        const response = await kDriveClient.shareAccess(file_id, emails, right, message ?? undefined);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_create_folder",
    "Create a folder in kDrive",
    {
        name: z.string().describe("Name of the folder to create"),
        file_id: z.number().optional().describe("Parent directory ID (default is root = 1)"),
    },
    async ({name, file_id}) => {
        const response = await kDriveClient.createFolder(file_id ?? 1, name);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_restore",
    "Restore a file or directory from the trash",
    {
        file_id: z.number().describe("File or directory ID to restore"),
        destination_directory_id: z.number().describe("Destination directory ID to restore into"),
    },
    async ({file_id, destination_directory_id}) => {
        const response = await kDriveClient.restore(file_id, destination_directory_id);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_info",
    "Get metadata about a file or directory",
    {
        file_id: z.number().describe("File or directory ID"),
    },
    async ({file_id}) => {
        const response = await kDriveClient.info(file_id);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_recents",
    "List recent files and directories",
    {
        type: z.enum(["dir", "file", "vault"]).optional().describe("Filter by type: dir, file or vault"),
    },
    async ({type}) => {
        const response = await kDriveClient.recents(type ? { type } : undefined);
        return {
            content: [{type: "text", text: JSON.stringify(response)}],
        };
    }
);

server.tool(
    "kdrive_shared_with_me",
    "List files and directories shared with you",
    {
        type: z.enum(["dir", "file", "vault"]).optional().describe("Filter by type: dir, file or vault"),
    },
    async ({type}) => {
        const response = await kDriveClient.sharedWithMe(type ? { type } : undefined);
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
        const buffer = Buffer.from(response);

        return {
            contents: [{
                uri: uri.href,
                blob: buffer.toString('base64'),
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
