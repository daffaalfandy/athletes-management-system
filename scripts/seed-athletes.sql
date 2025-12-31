CREATE TABLE IF NOT EXISTS athletes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthDate TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
  weight REAL NOT NULL,
  rank TEXT NOT NULL,
  clubId INTEGER,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_athlete_name_dob UNIQUE (name, birthDate)
);

CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);

INSERT OR IGNORE INTO athletes (name, birthDate, gender, weight, rank, clubId, createdAt, updatedAt) VALUES
('Kenji Yamamoto', '1995-01-01', 'male', 73.5, 'Black (DAN 1)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Maria Rodriguez', '2002-01-01', 'female', 63.0, 'Blue', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Liam O''Connell', '2004-01-01', 'male', 81.2, 'Orange', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sarah Chen', '2001-01-01', 'female', 57.5, 'Green', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('David Kim', '1999-01-01', 'male', 66.8, 'Brown', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Emma Watson', '2006-01-01', 'female', 52.0, 'Yellow', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lucas Silva', '2005-01-01', 'male', 90.0, 'White', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hana Sato', '1998-01-01', 'female', 48.0, 'Black (DAN 2)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('James Smith', '2000-01-01', 'male', 100.0, 'Blue', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Olivia Jones', '2003-01-01', 'female', 70.0, 'Green', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hiroshi Tanahashi', '1985-01-01', 'male', 95.0, 'Black (DAN 4)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kazuchika Okada', '1987-01-01', 'male', 105.0, 'Black (DAN 3)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tetsuya Naito', '1988-01-01', 'male', 92.0, 'Black (DAN 2)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kota Ibushi', '1989-01-01', 'male', 88.0, 'Black (DAN 1)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomohiro Ishii', '1980-01-01', 'male', 98.0, 'Brown', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Minoru Suzuki', '1975-01-01', 'male', 85.0, 'Black (DAN 6)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Zack Sabre Jr', '1990-01-01', 'male', 78.0, 'Brown', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Will Ospreay', '1993-01-01', 'male', 82.0, 'Brown', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kenny Omega', '1983-01-01', 'male', 90.0, 'Black (DAN 3)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bryan Danielson', '1981-01-01', 'male', 80.0, 'Black (DAN 5)', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
