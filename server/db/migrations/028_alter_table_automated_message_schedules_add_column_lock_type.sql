ALTER TABLE "public"."automated_message_schedules" ADD COLUMN "lock_type" automated_message_lock_type NOT NULL DEFAULT 'none';
