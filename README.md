## Postgres MCP

Simple study around the Cursor MCP support.

- Install `Bun`
- Install `Cursor`
- Paste the following json at the `MCP` specification in the `Cursor` settings

```json
{
  "mcpServers": {
    "postgres": {
      "command": "bun",
      "args": ["/path/to/this/repository/main.ts"],
      "env": {
        "DATABASE_URL": "postgres://xx:xx@localhost/xx"
      }
    }
  }
}
```
