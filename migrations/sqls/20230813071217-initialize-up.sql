-- EXTENSIONS --
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SEQUENCES --
CREATE SEQUENCE IF NOT EXISTS products_seq;

CREATE SEQUENCE IF NOT EXISTS reports_seq;

/* Replace with your SQL commands */
--- TABLES ---
CREATE TABLE IF NOT EXISTS tennants (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  store_name VARCHAR(63) NOT NULL UNIQUE,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL DEFAULT NEXTVAL ('products_seq'),
  tennant_id UUID REFERENCES tennants(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  sale_price NUMERIC DEFAULT 0,
  compare_price NUMERIC DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  product_description TEXT NOT NULL,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (compare_price > sale_price OR compare_price = 0),
  PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS reports(
  id INT NOT NULL DEFAULT NEXTVAL ('reports_seq'),
  csv_name VARCHAR(255),
  tennant_id UUID REFERENCES tennants(id) ON DELETE SET NULL,
  total_rows INTEGER DEFAULT 0,
  total_uploaded INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_status VARCHAR(255),
  PRIMARY KEY (id)
);


-- RLS POLICIES -- 
ALTER TABLE tennants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tennant_isolation_policy ON tennants 
USING (store_name = current_setting('app.current_tennant_name')::VARCHAR(63));

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_isolation_policy ON products 
USING (tennant_id = current_setting('app.current_tennant_id')::UUID);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_isolation_policy ON reports 
USING (tennant_id = current_setting('app.current_tennant_id')::UUID);

-- INDEXES --
CREATE INDEX idx_tennant_id ON products (tennant_id);



