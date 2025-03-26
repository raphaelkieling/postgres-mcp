import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pg from "pg";

export function createServer(databaseUrl: string) {
  const server = new McpServer({
    name: "PostgresMCP",
    version: "1.0.0",
  });

  // Tools
  const pool = new pg.Pool({
    connectionString: databaseUrl,
  });

  server.tool(
    "get_all_schemas",
    "Use this tool to get all the schemas in the database",
    {},
    async ({}) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT table_schema,table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema,table_name;`
        );

        return {
          content: [
            { type: "text", text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      } finally {
        client.release();
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
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2`,
          [schema, table]
        );

        return {
          content: [
            { type: "text", text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      } finally {
        client.release();
      }
    }
  );

  server.tool(
    "run_query",
    "Use this tool to run a query on the database",
    { query: z.string().describe("The query to run") },
    async ({ query }) => {
      const client = await pool.connect();
      try {
        const result = await client.query(query);

        return {
          content: [
            { type: "text", text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      } finally {
        client.release();
      }
    }
  );

  return server;
}
