export class KdriveClient {
    private readonly token: string;
    private readonly driveId: string;
    private readonly headers: { Authorization: string; "Content-Type": string };

    constructor(token: string, driveId: string) {
        this.token = token;
        this.driveId = driveId;
        this.headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    async search(query: string, options?: { directory_id?: number; depth?: string }): Promise<any> {
        const params = new URLSearchParams({
            query,
            limit: "10"
        });
        if (options?.directory_id !== undefined) {
            params.set("directory_id", options.directory_id.toString());
        }
        if (options?.depth) {
            params.set("depth", options.depth);
        }

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/search?${params}`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/upload?${params}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/octet-stream",
                },
                body: new Uint8Array(buffer),
            },
        );

        return response.json();
    }

    async listFiles(file_id = 1, filters?: { type?: string; cursor?: string }): Promise<any> {
        const params = new URLSearchParams();
        if (filters?.type) {
            params.set("type[]", filters.type);
        }
        if (filters?.cursor) {
            params.set("cursor", filters.cursor);
        }
        const query = params.toString() ? `?${params}` : "";

        const response = await fetch(
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/${file_id}/files${query}`,
            {
                headers: this.headers,
            },
        );

        return response.json();
    }

    async rename(file_id: number, name: string): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${this.driveId}/files/${file_id}/rename`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/${file_id}/move/${dest_id}`,
            {
                method: "POST",
                headers: this.headers,
            },
        );

        return response.json();
    }

    async deleteFile(file_id: number): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${this.driveId}/files/${file_id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            },
        );

        return response.json();
    }

    async shareLink(file_id: number, options: Record<string, unknown>): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${this.driveId}/files/${file_id}/link`,
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
            `https://api.infomaniak.com/2/drive/${this.driveId}/files/${file_id}/access/invitations?lang=${lang}`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/${file_id}/directory`,
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
            `https://api.infomaniak.com/2/drive/${this.driveId}/trash/${file_id}/restore`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/${file_id}`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/recents${query}`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/shared_with_me${query}`,
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
            `https://api.infomaniak.com/3/drive/${this.driveId}/files/${file_id}/files?${params}`,
            {
                headers: this.headers
            },
        );

        return response.json();
    }

    async getFile(file_id: string): Promise<any> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${this.driveId}/files/${file_id}`,
            {
                headers: this.headers
            },
        );

        return response.json()
    }

    async downloadFile(file_id: string): Promise<ArrayBuffer> {
        const response = await fetch(
            `https://api.infomaniak.com/2/drive/${this.driveId}/files/${file_id}/download`,
            {
                headers: this.headers
            },
        );

        return response.arrayBuffer()
    }
}
