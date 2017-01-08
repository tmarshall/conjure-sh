CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  email VARCHAR(100) NOT NULL,
  added TIMESTAMP WITH TIME ZONE NOT NULL,
  updated TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE account IS 'cosmo user records';