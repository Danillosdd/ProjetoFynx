import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
            }

            const result = await AuthService.register(name, email, password);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        console.log('[AuthController] Login request received:', { email: req.body.email });
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                console.log('[AuthController] Missing email or password');
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            const result = await AuthService.login(email, password);
            console.log('[AuthController] Login successful for:', email);
            res.status(200).json(result);
        } catch (error: any) {
            console.error('[AuthController] Login error:', error.message);
            res.status(401).json({ error: error.message });
        }
    }
}
