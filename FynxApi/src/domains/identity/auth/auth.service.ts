import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import database from '../../../infrastructure/database/database.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined. The server cannot start without it.');
}

const JWT_SECRET_DEFINED: string = JWT_SECRET;

const SALT_ROUNDS = 10;

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existingUser = await database.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = result.lastID;

    await database.run(
      'INSERT INTO user_scores (user_id, total_score, level) VALUES (?, ?, ?)',
      [userId, 0, 1]
    );

    const token = jwt.sign({ id: userId, email }, JWT_SECRET_DEFINED, { expiresIn: '24h' });

    return {
      user: { id: userId, name, email },
      token
    };
  }

  static async login(email: string, password: string) {
    const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password || '');
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET_DEFINED, { expiresIn: '24h' });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      token
    };
  }
}

