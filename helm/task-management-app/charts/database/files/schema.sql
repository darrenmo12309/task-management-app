CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE boards (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  owner_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE columns (
  id          SERIAL PRIMARY KEY,
  board_id    INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  position    INTEGER NOT NULL
);

CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  column_id   INTEGER REFERENCES columns(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL,
  due_date    TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);
