ALTER TABLE "public"."webhooks_queue"
  ADD COLUMN "success" boolean,
  ADD COLUMN "error" jsonb;
