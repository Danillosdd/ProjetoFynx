export const SCHEMA = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      color TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  transactions: `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      notes TEXT,
      spending_goal_id INTEGER,
      saving_goal_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (spending_goal_id) REFERENCES spending_goals (id),
      FOREIGN KEY (saving_goal_id) REFERENCES spending_goals (id)
    )
  `,
  spending_goals: `
    CREATE TABLE IF NOT EXISTS spending_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      goal_type TEXT DEFAULT 'spending',
      target_amount DECIMAL(10,2) NOT NULL,
      current_amount DECIMAL(10,2) DEFAULT 0,
      period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
      start_date DATE,
      end_date DATE,
      status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `,
  user_scores: `
    CREATE TABLE IF NOT EXISTS user_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      total_score INTEGER DEFAULT 0,
      carry_over_score INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      league TEXT DEFAULT 'Bronze',
      current_streak INTEGER DEFAULT 0,
      max_streak INTEGER DEFAULT 0,
      last_checkin DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `,
  achievements: `
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  user_achievements: `
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (achievement_id) REFERENCES achievements (id),
      UNIQUE(user_id, achievement_id)
    )
  `,
  badges: `
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT,
      requirements TEXT -- JSON string of requirements
    )
  `,
  user_badges: `
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (badge_id) REFERENCES badges (id),
      UNIQUE(user_id, badge_id)
    )
  `
};
