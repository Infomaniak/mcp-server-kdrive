# kDrive MCP Server

MCP Server for the kDrive API.

## Tools

1. `kdrive_search`
    - Search in kDrive
    - Required inputs:
      - `query` (string): Search query
    - Returns: List of files

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
        "infomaniak/mcp-server-kchat"
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
