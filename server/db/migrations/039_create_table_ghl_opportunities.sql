CREATE TABLE ghl_opportunities (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status ghl_opportunity_status NOT NULL DEFAULT 'open'::ghl_opportunity_status,
    opportunity jsonb NOT NULL,
    ghl_contact_id text NOT NULL,
    contact jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);
