import pkg from 'sqlite3';
const { Database: SQLiteDatabase } = pkg;
import type { RunResult } from 'sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import bcrypt from 'bcrypt';
import { SCHEMA } from './schema.js';
import { INITIAL_CATEGORIES, INITIAL_ACHIEVEMENTS, INITIAL_BADGES } from './seed.js';

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
                    this.initialize();
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

    private async initialize() {
        try {
            await this.createTables();
            await this.applyMigrations();
            await this.seedInitialData();
            console.log('Banco de dados inicializado com sucesso.');
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
        }
    }

    private async createTables() {
        for (const [name, sql] of Object.entries(SCHEMA)) {
            await this.run(sql as string);
        }
        // Backward compatibility for custom_categories and budgets not yet in SCHEMA
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
        await this.run(`
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                category TEXT NOT NULL DEFAULT 'Geral',
                allocated_amount DECIMAL(10,2) NOT NULL,
                spent_amount DECIMAL(10,2) DEFAULT 0,
                remaining_amount DECIMAL(10,2) DEFAULT 0,
                period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
    }

    private async applyMigrations() {
        // Migration: user_scores extensions
        try {
            const userScoresCols = await this.all("PRAGMA table_info('user_scores')");
            if (!userScoresCols.some((col: any) => col.name === 'league')) {
                await this.run("ALTER TABLE user_scores ADD COLUMN league TEXT DEFAULT 'Bronze'");
            }
            if (!userScoresCols.some((col: any) => col.name === 'carry_over_score')) {
                await this.run("ALTER TABLE user_scores ADD COLUMN carry_over_score INTEGER DEFAULT 0");
            }
        } catch (err) { console.error('Migration error (user_scores):', err); }

        // Migration: transactions goal links
        try {
            const txCols = await this.all("PRAGMA table_info('transactions')");
            if (!txCols.some((col: any) => col.name === 'saving_goal_id')) {
                await this.run("ALTER TABLE transactions ADD COLUMN saving_goal_id INTEGER REFERENCES spending_goals(id)");
            }
            if (!txCols.some((col: any) => col.name === 'spending_goal_id')) {
                await this.run("ALTER TABLE transactions ADD COLUMN spending_goal_id INTEGER");
            }
        } catch (err) { console.error('Migration error (transactions):', err); }

        // Migration: user_scores engagement extensions
        try {
            const userScoresCols = await this.all("PRAGMA table_info('user_scores')");
            if (!userScoresCols.some((col: any) => col.name === 'current_streak')) {
                await this.run("ALTER TABLE user_scores ADD COLUMN current_streak INTEGER DEFAULT 0");
            }
            if (!userScoresCols.some((col: any) => col.name === 'max_streak')) {
                await this.run("ALTER TABLE user_scores ADD COLUMN max_streak INTEGER DEFAULT 0");
            }
            if (!userScoresCols.some((col: any) => col.name === 'last_checkin')) {
                await this.run("ALTER TABLE user_scores ADD COLUMN last_checkin DATE");
            }
        } catch (err) { console.error('Migration error (user_scores engagement):', err); }

        // Migration: spending_goals type
        try {
            const goalCols = await this.all("PRAGMA table_info('spending_goals')");
            if (!goalCols.some((col: any) => col.name === 'goal_type')) {
                await this.run("ALTER TABLE spending_goals ADD COLUMN goal_type TEXT DEFAULT 'spending'");
            }
        } catch (err) { console.error('Migration error (spending_goals):', err); }

        // Migration: budgets fields expected by GoalsService
        try {
            const budgetCols = await this.all("PRAGMA table_info('budgets')");
            if (!budgetCols.some((col: any) => col.name === 'category')) {
                await this.run("ALTER TABLE budgets ADD COLUMN category TEXT NOT NULL DEFAULT 'Geral'");
            }
            if (!budgetCols.some((col: any) => col.name === 'allocated_amount')) {
                await this.run("ALTER TABLE budgets ADD COLUMN allocated_amount DECIMAL(10,2) NOT NULL DEFAULT 0");
                if (budgetCols.some((col: any) => col.name === 'total_amount')) {
                    await this.run("UPDATE budgets SET allocated_amount = total_amount WHERE allocated_amount = 0");
                }
            }
            if (!budgetCols.some((col: any) => col.name === 'remaining_amount')) {
                await this.run("ALTER TABLE budgets ADD COLUMN remaining_amount DECIMAL(10,2) DEFAULT 0");
                await this.run("UPDATE budgets SET remaining_amount = allocated_amount - COALESCE(spent_amount, 0) WHERE remaining_amount = 0");
            }
            if (!budgetCols.some((col: any) => col.name === 'status')) {
                await this.run("ALTER TABLE budgets ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
            }
        } catch (err) { console.error('Migration error (budgets):', err); }
    }

    private async seedInitialData() {
        try {
            const existingCategories = await this.get('SELECT COUNT(*) as count FROM categories');
            if (existingCategories.count === 0) {
                for (const cat of INITIAL_CATEGORIES) {
                    await this.run(
                        'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
                        [cat.name, cat.type, cat.color, cat.icon]
                    );
                }
            }

            const existingUser = await this.get('SELECT COUNT(*) as count FROM users');
            if (existingUser.count === 0) {
                const defaultHash = await bcrypt.hash('123456', 10);
                await this.run(
                    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    ['Usuário Demo', 'demo@fynx.com', defaultHash]
                );
                await this.run('INSERT INTO user_scores (user_id, total_score, level) VALUES (?, ?, ?)', [1, 0, 1]);
            }

            const existingAchievements = await this.get('SELECT COUNT(*) as count FROM achievements');
            if (existingAchievements.count === 0) {
                for (const ach of INITIAL_ACHIEVEMENTS) {
                    await this.run(
                        'INSERT INTO achievements (name, description, icon, points) VALUES (?, ?, ?, ?)',
                        [ach.name, ach.description, ach.icon, ach.points]
                    );
                }
            }

            const existingBadges = await this.get('SELECT COUNT(*) as count FROM badges');
            if (existingBadges.count === 0) {
                for (const badge of INITIAL_BADGES) {
                    await this.run(
                        'INSERT INTO badges (id, name, description, icon, category) VALUES (?, ?, ?, ?, ?)',
                        [badge.id, badge.name, badge.description, badge.icon, badge.category]
                    );
                }
            }
        } catch (error) {
            console.error('Erro ao inserir dados iniciais:', error);
        }
    }

    async withTransaction<T>(work: () => Promise<T>): Promise<T> {
        await this.run('BEGIN TRANSACTION');
        try {
            const result = await work();
            await this.run('COMMIT');
            return result;
        } catch (error) {
            await this.run('ROLLBACK');
            throw error;
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

export const database = new Database();
export default database;
