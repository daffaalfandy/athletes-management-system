CREATE TABLE IF NOT EXISTS athletes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthDate TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
  weight REAL NOT NULL,
  rank TEXT NOT NULL,
  clubId INTEGER,
  profile_photo_path TEXT,
  
  -- Detailed information fields for tournament registration
  birth_place TEXT,
  region TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  parent_guardian TEXT,
  parent_phone TEXT,
  
  -- Activity Status (Story 7.2)
  activity_status TEXT DEFAULT 'Constant' CHECK(activity_status IN ('Constant', 'Intermittent', 'Dormant')),
  
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_athlete_name_dob UNIQUE (name, birthDate)
);

CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
CREATE INDEX IF NOT EXISTS idx_athletes_birth_place ON athletes(birth_place);
CREATE INDEX IF NOT EXISTS idx_athletes_region ON athletes(region);
CREATE INDEX IF NOT EXISTS idx_athletes_clubId ON athletes(clubId);
CREATE INDEX IF NOT EXISTS idx_athletes_activity_status ON athletes(activity_status);

-- Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  logo_path TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);

-- Insert sample clubs
INSERT OR IGNORE INTO clubs (id, name, location, contact_person, contact_phone, contact_email) VALUES
(1, 'Tokyo Judo Academy', 'Tokyo, Japan', 'Sensei Yamamoto', '+81-3-1234-5678', 'info@tokyojudo.jp'),
(2, 'Madrid Judo Club', 'Madrid, Spain', 'Coach Rodriguez', '+34-91-234-5678', 'contact@madridjudo.es'),
(3, 'London Judo Federation', 'London, UK', 'Master Smith', '+44-20-1234-5678', 'admin@londonjudo.co.uk');


CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athleteId INTEGER NOT NULL,
    rank TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    proof_image_path TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athleteId INTEGER NOT NULL,
    tournament TEXT NOT NULL,
    date TEXT NOT NULL,
    medal TEXT NOT NULL,
    category TEXT,
    proof_image_path TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_promotions_athleteId ON promotions(athleteId);
CREATE INDEX IF NOT EXISTS idx_medals_athleteId ON medals(athleteId);

CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    ruleset_snapshot TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);

CREATE TABLE IF NOT EXISTS tournament_rosters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    athlete_id INTEGER NOT NULL,
    weight_class TEXT NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    UNIQUE(tournament_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_rosters_tournament ON tournament_rosters(tournament_id);

-- App Settings Table - Key-Value store for system-wide configuration
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Insert default branding settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES
('kabupaten_name', 'Kabupaten Bogor'),
('kabupaten_logo_path', '');


INSERT OR IGNORE INTO athletes (name, birthDate, gender, weight, rank, clubId, profile_photo_path, birth_place, region, address, phone, email, parent_guardian, parent_phone, createdAt, updatedAt) VALUES
('Kenji Yamamoto', '1995-01-01', 'male', 73.5, 'Black (DAN 1)', 1, NULL, 'Tokyo', 'Kanto', '123 Sakura Street, Tokyo', '+81-3-1234-5678', 'kenji.yamamoto@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Maria Rodriguez', '2002-01-01', 'female', 63.0, 'Blue', 2, NULL, 'Madrid', 'Community of Madrid', '456 Gran Via, Madrid', '+34-91-234-5678', 'maria.rodriguez@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Liam O''Connell', '2004-01-01', 'male', 81.2, 'Orange', NULL, NULL, 'Dublin', 'Leinster', '789 O''Connell Street, Dublin', '+353-1-234-5678', 'liam.oconnell@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sarah Chen', '2001-01-01', 'female', 57.5, 'Green', NULL, NULL, 'Shanghai', 'Shanghai', '321 Nanjing Road, Shanghai', '+86-21-1234-5678', 'sarah.chen@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('David Kim', '1999-01-01', 'male', 66.8, 'Brown', 1, NULL, 'Seoul', 'Seoul', '654 Gangnam-gu, Seoul', '+82-2-1234-5678', 'david.kim@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Emma Watson', '2006-01-01', 'female', 52.0, 'Yellow', 3, NULL, 'London', 'Greater London', '987 Baker Street, London', '+44-20-1234-5678', 'emma.watson@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lucas Silva', '2005-01-01', 'male', 90.0, 'White', NULL, NULL, 'São Paulo', 'São Paulo', '147 Avenida Paulista, São Paulo', '+55-11-1234-5678', 'lucas.silva@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hana Sato', '1998-01-01', 'female', 48.0, 'Black (DAN 2)', NULL, NULL, 'Osaka', 'Kansai', '258 Dotonbori, Osaka', '+81-6-1234-5678', 'hana.sato@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('James Smith', '2000-01-01', 'male', 100.0, 'Blue', NULL, NULL, 'New York', 'New York', '369 Broadway, New York', '+1-212-123-4567', 'james.smith@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Olivia Jones', '2003-01-01', 'female', 70.0, 'Green', NULL, NULL, 'Sydney', 'New South Wales', '741 George Street, Sydney', '+61-2-1234-5678', 'olivia.jones@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hiroshi Tanahashi', '1985-01-01', 'male', 95.0, 'Black (DAN 4)', 1, NULL, 'Nagoya', 'Chubu', '852 Sakae, Nagoya', '+81-52-1234-5678', 'hiroshi.tanahashi@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kazuchika Okada', '1987-01-01', 'male', 105.0, 'Black (DAN 3)', NULL, NULL, 'Yokohama', 'Kanto', '963 Minato Mirai, Yokohama', '+81-45-1234-5678', 'kazuchika.okada@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tetsuya Naito', '1988-01-01', 'male', 92.0, 'Black (DAN 2)', NULL, NULL, 'Kyoto', 'Kansai', '159 Gion, Kyoto', '+81-75-1234-5678', 'tetsuya.naito@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kota Ibushi', '1989-01-01', 'male', 88.0, 'Black (DAN 1)', NULL, NULL, 'Sapporo', 'Hokkaido', '357 Susukino, Sapporo', '+81-11-1234-5678', 'kota.ibushi@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomohiro Ishii', '1980-01-01', 'male', 98.0, 'Brown', NULL, NULL, 'Fukuoka', 'Kyushu', '486 Tenjin, Fukuoka', '+81-92-1234-5678', 'tomohiro.ishii@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Minoru Suzuki', '1975-01-01', 'male', 85.0, 'Black (DAN 6)', NULL, NULL, 'Kobe', 'Kansai', '753 Sannomiya, Kobe', '+81-78-1234-5678', 'minoru.suzuki@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Zack Sabre Jr', '1990-01-01', 'male', 78.0, 'Brown', NULL, NULL, 'London', 'Greater London', '951 Camden Town, London', '+44-20-9876-5432', 'zack.sabre@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Will Ospreay', '1993-01-01', 'male', 82.0, 'Brown', NULL, NULL, 'Essex', 'East of England', '159 High Street, Essex', '+44-1234-567890', 'will.ospreay@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kenny Omega', '1983-01-01', 'male', 90.0, 'Black (DAN 3)', NULL, NULL, 'Winnipeg', 'Manitoba', '753 Portage Avenue, Winnipeg', '+1-204-123-4567', 'kenny.omega@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bryan Danielson', '1981-01-01', 'male', 80.0, 'Black (DAN 5)', NULL, NULL, 'Aberdeen', 'Washington', '357 Main Street, Aberdeen', '+1-360-123-4567', 'bryan.danielson@example.com', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
