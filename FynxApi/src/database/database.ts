import pkg from 'sqlite3';
const { Database: SQLiteDatabase } = pkg;
import type { RunResult } from 'sqlite3';
import { promisify } from 'util';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco SQLite
const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'fynx.db');

// Garantir que o diretório existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
  private db: InstanceType<typeof SQLiteDatabase>;

  constructor() {
    try {
      this.db = new SQLiteDatabase(dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco de dados:', err.message);
        } else {
          console.log('Conectado ao banco de dados SQLite.');
          this.initializeTables();
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  // Promisificar métodos do SQLite para usar async/await
  run(sql: string, params: any[] = []): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (this: RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  private async initializeTables() {
    try {
      // Tabela de usuários
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de categorias
      await this.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          color TEXT,
          icon TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de transações
      await this.run(`
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
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (spending_goal_id) REFERENCES spending_goals (id)
        )
      `);

      // Tabela de metas de economia
      await this.run(`
        CREATE TABLE IF NOT EXISTS saving_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          target_amount DECIMAL(10,2) NOT NULL,
          current_amount DECIMAL(10,2) DEFAULT 0,
          target_date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de metas de gasto (utilizada pelo GoalsService)
      await this.run(`
        CREATE TABLE IF NOT EXISTS spending_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
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
      `);

      // Tabela de limites de gastos
      await this.run(`
        CREATE TABLE IF NOT EXISTS spending_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category TEXT NOT NULL,
          limit_amount DECIMAL(10,2) NOT NULL,
          current_amount DECIMAL(10,2) DEFAULT 0,
          period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de orçamentos
      // Ensure custom_categories table exists for user-defined categories
      try {
        await this.run(`
          CREATE TABLE IF NOT EXISTS custom_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);
      } catch (err) {
        console.error('Erro ao criar tabela custom_categories:', err);
      }
      await this.run(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          spent_amount DECIMAL(10,2) DEFAULT 0,
          period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de conquistas/badges
      await this.run(`
        CREATE TABLE IF NOT EXISTS achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          points INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de conquistas do usuário
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          achievement_id INTEGER NOT NULL,
          earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (achievement_id) REFERENCES achievements (id),
          UNIQUE(user_id, achievement_id)
        )
      `);

      // Tabela de pontuação do usuário
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          total_score INTEGER DEFAULT 0,
          carry_over_score INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          league TEXT DEFAULT 'Bronze',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      console.log('Tabelas do banco de dados inicializadas com sucesso.');

      // Inserir dados iniciais
      await this.seedInitialData();

      // Migrations for user_scores
      try {
        const userScoresCols = await this.all("PRAGMA table_info('user_scores')");
        const hasLeague = userScoresCols.some((col: any) => col.name === 'league');
        const hasCarryOver = userScoresCols.some((col: any) => col.name === 'carry_over_score');

        if (!hasLeague) {
          console.log('Applying migration: adding league to user_scores');
          await this.run("ALTER TABLE user_scores ADD COLUMN league TEXT DEFAULT 'Bronze'");
        }
        if (!hasCarryOver) {
          console.log('Applying migration: adding carry_over_score to user_scores');
          await this.run("ALTER TABLE user_scores ADD COLUMN carry_over_score INTEGER DEFAULT 0");
        }
      } catch (err) {
        console.error('Error applying user_scores migrations:', err);
      }

      // Migration for transactions table - add saving_goal_id if not exists
      try {
        const transactionsCols = await this.all("PRAGMA table_info('transactions')");
        const hasSavingGoalId = transactionsCols.some((col: any) => col.name === 'saving_goal_id');

        if (!hasSavingGoalId) {
          console.log('Applying migration: adding saving_goal_id to transactions');
          await this.run("ALTER TABLE transactions ADD COLUMN saving_goal_id INTEGER REFERENCES spending_goals(id)");
        }
      } catch (err) {
        console.error('Error applying transactions migrations:', err);
      }

      // Ensure migrations: add spending_goal_id column to transactions if missing
      try {
        const tableInfo = await this.get("PRAGMA table_info('transactions')");
        // tableInfo may be a single row or array depending on sqlite3 wrapper; fetch list instead
        const columns = await this.all("PRAGMA table_info('transactions')");
        const hasSpendingGoal = columns.some((col: any) => col.name === 'spending_goal_id');
        if (!hasSpendingGoal) {
          console.log('Applying migration: adding spending_goal_id to transactions');
          await this.run('ALTER TABLE transactions ADD COLUMN spending_goal_id INTEGER');
        }
      } catch (err) {
        // If migration fails, log but continue
        console.error('Erro ao aplicar migração de coluna spending_goal_id:', err);
      }
      // Ensure migrations: add goal_type column to spending_goals if missing
      try {
        const spendingCols = await this.all("PRAGMA table_info('spending_goals')");
        const hasGoalType = spendingCols.some((col: any) => col.name === 'goal_type');
        if (!hasGoalType) {
          console.log('Applying migration: adding goal_type to spending_goals');
          await this.run("ALTER TABLE spending_goals ADD COLUMN goal_type TEXT DEFAULT 'spending'");
        }

        // Also ensure start_date and end_date are nullable for spending_goals
        try {
          // PRAGMA table_info returns an array of column infos, with `notnull` flag
          const startCol = spendingCols.find((col: any) => col.name === 'start_date');
          const endCol = spendingCols.find((col: any) => col.name === 'end_date');

          const startNotNull = startCol ? Boolean(startCol.notnull) : false;
          const endNotNull = endCol ? Boolean(endCol.notnull) : false;

          // If either column has NOT NULL constraint, perform a safe table migration to make them nullable
          if (startNotNull || endNotNull) {
            console.log('Applying migration: making start_date and/or end_date nullable in spending_goals');

            // Create new table with nullable start_date/end_date and goal_type column
            await this.run(`
              CREATE TABLE IF NOT EXISTS spending_goals_new (
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
            `);

            // Copy data from old table into new table. If goal_type doesn't exist in old table, coalesce to 'spending'.
            // Use column names that should exist in the original table; this preserves existing data.
            await this.run(`
              INSERT INTO spending_goals_new (id, user_id, title, category, goal_type, target_amount, current_amount, period, start_date, end_date, status, description, created_at, updated_at)
              SELECT id, user_id, title, category, COALESCE(goal_type, 'spending') as goal_type, target_amount, current_amount, period, start_date, end_date, status, description, created_at, updated_at
              FROM spending_goals
            `);

            // Replace old table
            await this.run('ALTER TABLE spending_goals RENAME TO spending_goals_old');
            await this.run('ALTER TABLE spending_goals_new RENAME TO spending_goals');
            // drop old table if exists
            await this.run('DROP TABLE IF EXISTS spending_goals_old');

            console.log('Migration completed: spending_goals start_date/end_date are now nullable.');
          }
        } catch (innerErr) {
          console.error('Erro ao aplicar migração para tornar start_date/end_date nullable:', innerErr);
        }
      } catch (err) {
        console.error('Erro ao aplicar migração de coluna goal_type em spending_goals:', err);
      }

    } catch (error) {
      console.error('Erro ao inicializar tabelas:', error);
    }
  }

  private async seedInitialData() {
    try {
      // Verificar se já existem categorias
      const existingCategories = await this.get('SELECT COUNT(*) as count FROM categories');

      if (existingCategories.count === 0) {
        // Inserir categorias padrão
        const categories = [
          { name: 'Alimentação', type: 'expense', color: '#FF6B6B', icon: '🍽️' },
          { name: 'Transporte', type: 'expense', color: '#4ECDC4', icon: '🚗' },
          { name: 'Moradia', type: 'expense', color: '#45B7D1', icon: '🏠' },
          { name: 'Saúde', type: 'expense', color: '#96CEB4', icon: '🏥' },
          { name: 'Educação', type: 'expense', color: '#FFEAA7', icon: '📚' },
          { name: 'Entretenimento', type: 'expense', color: '#DDA0DD', icon: '🎬' },
          { name: 'Compras', type: 'expense', color: '#98D8C8', icon: '🛍️' },
          { name: 'Outros Gastos', type: 'expense', color: '#F7DC6F', icon: '💸' },
          { name: 'Salário', type: 'income', color: '#58D68D', icon: '💰' },
          { name: 'Freelance', type: 'income', color: '#85C1E9', icon: '💻' },
          { name: 'Investimentos', type: 'income', color: '#F8C471', icon: '📈' },
          { name: 'Outros Ganhos', type: 'income', color: '#BB8FCE', icon: '💎' }
        ];

        for (const category of categories) {
          await this.run(
            'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
            [category.name, category.type, category.color, category.icon]
          );
        }

        console.log('Categorias padrão inseridas com sucesso.');
      }

      // Verificar se já existe um usuário padrão
      const existingUser = await this.get('SELECT COUNT(*) as count FROM users');

      if (existingUser.count === 0) {
        // Inserir usuário padrão
        await this.run(
          'INSERT INTO users (name, email) VALUES (?, ?)',
          ['Usuário Demo', 'demo@fynx.com']
        );

        // Inserir pontuação inicial para o usuário
        await this.run(
          'INSERT INTO user_scores (user_id, total_score, level) VALUES (?, ?, ?)',
          [1, 0, 1]
        );

        console.log('Usuário padrão criado com sucesso.');
      }

      // Inserir conquistas padrão
      const existingAchievements = await this.get('SELECT COUNT(*) as count FROM achievements');

      if (existingAchievements.count === 0) {
        const achievements = [
          { name: 'Primeira Transação', description: 'Registrou sua primeira transação', icon: '🎯', points: 10 },
          { name: 'Meta Alcançada', description: 'Atingiu sua primeira meta de economia', icon: '🏆', points: 50 },
          { name: 'Economizador', description: 'Economizou R$ 1.000', icon: '💰', points: 100 },
          { name: 'Disciplinado', description: 'Manteve gastos dentro do limite por 30 dias', icon: '📊', points: 75 },
          { name: 'Investidor', description: 'Registrou 10 transações de investimento', icon: '📈', points: 150 }
        ];

        for (const achievement of achievements) {
          await this.run(
            'INSERT INTO achievements (name, description, icon, points) VALUES (?, ?, ?, ?)',
            [achievement.name, achievement.description, achievement.icon, achievement.points]
          );
        }

        console.log('Conquistas padrão inseridas com sucesso.');
      }

    } catch (error) {
      console.error('Erro ao inserir dados iniciais:', error);
    }
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Instância singleton do banco
export const database = new Database();
export default database;