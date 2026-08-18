import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { registerSchema, loginSchema } from '../dtos/authSchemas';

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    const validatedData = registerSchema.parse(req.body);
    const result = await AuthService.register(validatedData);
    return res.status(201).json(result);
  }

  static async login(req: Request, res: Response): Promise<Response> {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);
    return res.status(200).json(result);
  }

  static async me(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const user = await AuthService.me(userId);
    return res.status(200).json({ user });
  }
}
