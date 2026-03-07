// Generic database row type helper.
// Tables<'table_name'> resolves to the record type for that table.
// Since the project uses a dynamic Azure runtime backend, rows are typed as
// Record<string, unknown> by default. Specific table types can be added here
// as the schema evolves.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Tables<_T extends string> = Record<string, unknown>;
