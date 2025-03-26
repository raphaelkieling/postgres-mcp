import { createMcpClient } from "./setup";
import { expect, it, afterAll, describe } from "bun:test";

describe("Server", async () => {
  const client = await createMcpClient();

  afterAll(async () => {
    await client.close();
  });

  it("should be able to get all the schemas in the database", async () => {
    const schemas = await client.callTool({
      name: "get_all_schemas",
      arguments: {},
    });

    expect(schemas).toEqual({
      content: [
        {
          type: "text",
          text: '[\n  {\n    "table_schema": "public",\n    "table_name": "posts"\n  },\n  {\n    "table_schema": "public",\n    "table_name": "users"\n  }\n]',
        },
      ],
    });
  });

  it("should be able to get all the tables in the database", async () => {
    const tables = await client.callTool({
      name: "get_table_schema",
      arguments: {
        schema: "public",
        table: "users",
      },
    });

    expect(tables).toEqual({
      content: [
        {
          type: "text",
          text: '[\n  {\n    "column_name": "id",\n    "data_type": "integer",\n    "is_nullable": "NO",\n    "column_default": "nextval(\'users_id_seq\'::regclass)"\n  },\n  {\n    "column_name": "name",\n    "data_type": "character varying",\n    "is_nullable": "NO",\n    "column_default": null\n  },\n  {\n    "column_name": "email",\n    "data_type": "character varying",\n    "is_nullable": "NO",\n    "column_default": null\n  }\n]',
        },
      ],
    });
  });
});
