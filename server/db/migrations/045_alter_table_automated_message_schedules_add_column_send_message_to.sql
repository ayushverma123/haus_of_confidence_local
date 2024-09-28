ALTER TABLE "public"."automated_message_schedules" 
ADD COLUMN "send_message_to" automated_message_for NOT NULL DEFAULT 'client';
