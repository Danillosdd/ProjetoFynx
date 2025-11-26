import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fynx_secret_key_change_me';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log(`[AuthMiddleware] Request: ${req.method} ${req.originalUrl}`);
    // console.log('[AuthMiddleware] Auth Header:', authHeader); // Be careful logging full headers in prod

    if (!token) {
        console.log('[AuthMiddleware] No token provided');
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log('[AuthMiddleware] Token verification failed:', err.message);
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }

        // console.log('[AuthMiddleware] Token verified for user:', user.id);
        req.user = user;
        next();
    });
};
