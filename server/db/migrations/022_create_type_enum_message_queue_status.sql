CREATE TYPE message_queue_status AS ENUM (
    'sent',
    'pending',
    'failed'
);