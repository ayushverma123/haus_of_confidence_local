ALTER TABLE "public"."automated_message_schedules"
  DROP COLUMN "custom_trigger_function",
  DROP COLUMN "contact_criteria_custom_function",
  ADD COLUMN "custom_trigger_config" jsonb,
  ADD COLUMN "contact_criteria_config" jsonb;
