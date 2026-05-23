import "dotenv/config";
import { defineConfig } from "budget-service/prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  earlyAccess: true,
});