# kDrive MCP Server

MCP Server for the kDrive API.

## Tools

1. `kdrive_search`
    - Search in kDrive
    - Required inputs:
      - `query` (string): Search query
    - Optional inputs:
      - `directory_id` (number): Directory ID to scope the search to a specific folder subtree (default: root)
      - `depth` (string): Search depth when `directory_id` is set — `unlimited` (recursive) or `child` (immediate children only)
    - Returns: List of files

2. `kdrive_upload_file`
    - Upload a new file to kDrive (text or binary)
    - Required inputs:
      - `file_name` (string): Name of the file
      - One of:
        - `text_content` (string): UTF-8 text content
        - `base64_content` (string): Base64-encoded binary content
      - Optional: `directory_id` (number): Destination folder ID (default: root=1)
    - Returns: Uploaded file metadata

3. `kdrive_download_file`
    - Download a file from kDrive
    - Required inputs:
      - `file_id` (number): ID of the file to download
    - Returns: File content as base64-encoded string (MIME type can be obtained via `kdrive_info`)

4. `kdrive_list`
    - List files and directories in a folder
    - Required inputs:
      - Optional: `file_id` (number): Folder ID (default: root=1)
      - Optional: `type` (string): Filter by `file` or `dir`
      - Optional: `cursor` (string): Pagination cursor returned by a previous call when `has_more` was `true`, used to fetch the next page of results
    - Returns: Array of files and/or directories, plus `has_more` (boolean) and `cursor` (string) when more entries are available

5. `kdrive_rename`
    - Rename a file or directory
    - Required inputs:
      - `file_id` (number): File or directory ID
      - `name` (string): New name
    - Returns: Updated item metadata

6. `kdrive_move`
    - Move a file or directory to another folder
    - Required inputs:
      - `file_id` (number): Item to move
      - `dest_id` (number): Destination folder ID
    - Returns: Moved item metadata

7. `kdrive_delete`
    - Move a file or directory to the trash
    - Required inputs:
      - `file_id` (number): Item to delete
    - Returns: Trash result

8. `kdrive_share_link`
    - Create a share link for a file or directory
    - Required inputs:
      - `file_id` (number): Item to share
      - `right` (string): `inherit`, `password`, or `public`
      - Optional: `password`, `valid_until`, `can_download`, `can_edit`, `can_request_access`
    - Returns: Share link object

9. `kdrive_share_access`
    - Give access to a file or directory by email invitation
    - Required inputs:
      - `file_id` (number): Item to share
      - `emails` (array of strings): Recipients
      - `right` (string): `manage`, `read`, or `write`
      - Optional: `message` (string): Invitation text
    - Returns: Invitation feedback

10. `kdrive_create_folder`
    - Create a new folder in kDrive
    - Required inputs:
      - `name` (string): Name of the folder
      - Optional: `file_id` (number): Parent directory ID (default: root=1)
    - Returns: Created folder metadata

11. `kdrive_restore`
    - Restore a file or directory from the trash
    - Required inputs:
      - `file_id` (number): Item ID to restore
      - `destination_directory_id` (number): Directory to restore into
    - Returns: Restored item metadata

12. `kdrive_info`
    - Get metadata and info about a file or directory
    - Required inputs:
      - `file_id` (number): Item ID
    - Returns: File/directory metadata

13. `kdrive_recents`
    - List recently used files and directories
    - Required inputs:
      - Optional: `type` (string): Filter by `dir`, `file`, or `vault`
    - Returns: Array of recent items

14. `kdrive_shared_with_me`
    - List files and directories shared with you
    - Required inputs:
      - Optional: `type` (string): Filter by `dir`, `file`, or `vault`
    - Returns: Array of shared items

## Setup

1. Create a kDrive token linked to your user:
    - Visit the [API Token page](https://manager.infomaniak.com/v3/ng/accounts/token/list)
    - Choose "drive" scope

### Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

#### NPX

```json
{
  "mcpServers": {
    "kdrive": {
      "command": "npx",
      "args": [
        "-y",
        "@infomaniak/mcp-server-kdrive"
      ],
      "env": {
        "KDRIVE_TOKEN": "your-token",
        "KDRIVE_ID": "your-kdrive-id"
      }
    }
  }
}
```

#### docker

```json
{
  "mcpServers": {
    "kdrive": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "KDRIVE_TOKEN",
        "-e",
        "KDRIVE_ID",
        "infomaniak/mcp-server-kdrive"
      ],
      "env": {
        "KDRIVE_TOKEN": "your-token",
        "KDRIVE_ID": "your-kdrive-id"
      }
    }
  }
}
```

### Environment Variables

1. `KDRIVE_TOKEN`: Required. Your kDrive token.
2. `KDRIVE_ID`: Required. Your kDrive id fetch from the webapp URL. (eg. if your kDrive webapp url is https://ksuite.infomaniak.com/all/kdrive/app/drive/12 your drive id is 12)

### Troubleshooting

If you encounter permission errors, verify that:
1. All required scopes are added to your drive token
2. The token and drive id are correctly copied to your configuration

## Build

Docker build:

```bash
docker build -t infomaniak/mcp-server-kdrive -f Dockerfile .
```

## License

This MCP server is licensed under the MIT License.
