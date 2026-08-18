import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core/errors/AppError';
import { JwtProvider } from '../../../core/security/jwtProvider';

export function ensureAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token de autenticação não fornecido.', 401, 'TOKEN_MISSING');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError('Formato de token inválido.', 401, 'TOKEN_MALFORMED');
  }

  const token = parts[1];

  try {
    const payload = JwtProvider.verify(token);

    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (error) {
    throw new AppError('Token inválido ou expirado.', 401, 'TOKEN_INVALID');
  }
}
