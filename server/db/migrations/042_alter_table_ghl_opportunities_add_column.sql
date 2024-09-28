ALTER TABLE "public"."ghl_opportunities"
  ADD COLUMN "general_contact_id" integer,
  ADD FOREIGN KEY ("general_contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;