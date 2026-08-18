import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core/errors/AppError';

type Role = 'ORGANIZER' | 'CUSTOMER' | 'GATEKEEPER';

export function ensureRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        'Acesso negado: seu perfil não possui permissão para este recurso.',
        403,
        'FORBIDDEN'
      );
    }

    return next();
  };
}
