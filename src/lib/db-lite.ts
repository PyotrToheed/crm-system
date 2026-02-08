import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

// Connect to PostgreSQL
export const sql = postgres(connectionString, {
    ssl: "require", // Supabase requires SSL
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
});
