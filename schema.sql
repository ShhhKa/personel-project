-- ============================================
-- 个人记忆库 v3 Schema
-- 4 tables: memories / todos / recurrence_rules / habits
-- ============================================

CREATE TABLE IF NOT EXISTS memories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  layer      TEXT NOT NULL CHECK(layer IN ('core','daily','diary')),
  title      TEXT NOT NULL,
  content    TEXT,
  tags       TEXT,
  mood       TEXT,
  meta       TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS todos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  notes         TEXT,
  start_time    TEXT,
  end_time      TEXT,
  due_date      TEXT,
  location      TEXT,
  category      TEXT DEFAULT '生活',
  priority      TEXT DEFAULT 'medium',
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','done','postponed','cancelled')),
  postponed_to  TEXT,
  rule_id       INTEGER,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurrence_rules (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  freq         TEXT NOT NULL CHECK(freq IN ('daily','weekly','monthly','yearly')),
  interval_val INTEGER DEFAULT 1,
  by_day       TEXT,
  by_monthday  INTEGER,
  time         TEXT,
  end_time     TEXT,
  location     TEXT,
  category     TEXT DEFAULT '生活',
  priority     TEXT DEFAULT 'medium',
  start_date   TEXT,
  end_date     TEXT,
  active       INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habits (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  freq          TEXT DEFAULT 'daily',
  times_per_day INTEGER DEFAULT 1,
  log           TEXT DEFAULT '',
  active        INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mem_layer    ON memories(layer);
CREATE INDEX IF NOT EXISTS idx_mem_created  ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_todo_status  ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todo_start   ON todos(start_time);
CREATE INDEX IF NOT EXISTS idx_todo_due     ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_cat     ON todos(category);
CREATE INDEX IF NOT EXISTS idx_todo_rule    ON todos(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_active  ON recurrence_rules(active);
CREATE INDEX IF NOT EXISTS idx_habit_active ON habits(active);
