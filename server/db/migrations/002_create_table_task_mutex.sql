CREATE TABLE task_mutex (
    id text PRIMARY KEY,
    locked boolean NOT NULL DEFAULT false
);