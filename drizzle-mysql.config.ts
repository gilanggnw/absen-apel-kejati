import "./envConfig";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations-mysql",
  schema: "./db/schema-mysql.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD === "" ? undefined : (process.env.MYSQL_PASSWORD || undefined),
    database: process.env.MYSQL_DATABASE || "absen_apel_kejati",
  },
});
