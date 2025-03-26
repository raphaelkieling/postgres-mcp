import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataSource } from "typeorm";
import "reflect-metadata";

export function createServer(databaseUrl: string) {
  const server = new McpServer({
    name: "DatabaseMCP",
    version: "1.0.0",
  });

  // Parse database URL and create DataSource options
  const url = new URL(databaseUrl);
  const dataSourceOptions = {
    type: url.protocol.replace(":", "") as any,
    host: url.hostname,
    port: parseInt(url.port),
    username: url.username,
    password: url.password,
    database: url.pathname.replace("/", ""),
    synchronize: false,
    logging: false,
  };

  const dataSource = new DataSource(dataSourceOptions);

  server.tool(
    "get_all_schemas",
    "Use this tool to get all the schemas in the database",
    {},
    async ({}) => {
      await dataSource.initialize();
      try {
        const result = await dataSource.query(
          `SELECT table_schema, table_name 
           FROM information_schema.tables 
           WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
           ORDER BY table_schema, table_name;`
        );

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } finally {
        await dataSource.destroy();
      }
    }
  );

  server.tool(
    "get_table_schema",
    "Use this tool to get the schema of a table",
    {
      schema: z.string().describe("The schema of the table"),
      table: z.string().describe("The table to get the schema of"),
    },
    async ({ schema, table }) => {
      await dataSource.initialize();
      try {
        const result = await dataSource.query(
          `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2`,
          [schema, table]
        );

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } finally {
        await dataSource.destroy();
      }
    }
  );

  server.tool(
    "run_query",
    "Use this tool to run a query on the database",
    { query: z.string().describe("The query to run") },
    async ({ query }) => {
      await dataSource.initialize();
      try {
        const result = await dataSource.query(query);

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } finally {
        await dataSource.destroy();
      }
    }
  );

  return server;
}
