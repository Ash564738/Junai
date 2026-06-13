// src/app/api/sync-all/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export { GET, POST } from "../cron/sync/route";