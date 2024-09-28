CREATE TABLE webhooks (
    id text PRIMARY KEY,
    secret text,
    registered boolean NOT NULL DEFAULT false,
    webhook jsonb
);

ALTER TABLE "public"."webhooks" ADD COLUMN "service" text NOT NULL;

