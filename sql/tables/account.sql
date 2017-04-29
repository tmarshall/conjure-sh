CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  added TIMESTAMP WITH TIME ZONE NOT NULL,
  updated TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE account IS 'conjure user records';
