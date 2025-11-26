import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import database from '../../database/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fynx_secret_key_change_me';
const SALT_ROUNDS = 10;

export class AuthService {
    static async register(name: string, email: string, password: string) {
        // Verificar se usuário já existe
        const existingUser = await database.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Criar usuário
        const result = await database.run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const userId = result.lastID;

        // Inicializar pontuação
        await database.run(
            'INSERT INTO user_scores (user_id, total_score, level) VALUES (?, ?, ?)',
            [userId, 0, 1]
        );

        // Gerar token
        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });

        return {
            user: { id: userId, name, email },
            token
        };
    }

    static async login(email: string, password: string) {
        console.log('[AuthService] Attempting login for:', email);
        // Buscar usuário
        const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            console.log('[AuthService] User not found:', email);
            throw new Error('Credenciais inválidas');
        }

        console.log('[AuthService] User found, verifying password...');
        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password || '');
        if (!validPassword) {
            console.log('[AuthService] Invalid password for:', email);
            throw new Error('Credenciais inválidas');
        }

        console.log('[AuthService] Password verified, generating token...');
        // Gerar token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        return {
            user: { id: user.id, name: user.name, email: user.email },
            token
        };
    }
}
