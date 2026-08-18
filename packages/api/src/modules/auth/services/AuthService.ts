import { prisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/AppError';
import { HashProvider } from '../../../core/security/hashProvider';
import { JwtProvider } from '../../../core/security/jwtProvider';
import { RegisterInput, LoginInput } from '../dtos/authSchemas';

export class AuthService {
  static async register(data: RegisterInput) {
    const userAlreadyExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userAlreadyExists) {
      throw new AppError('Este e-mail já está cadastrado no sistema.', 409, 'USER_ALREADY_EXISTS');
    }

    const hashedPassword = await HashProvider.hash(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = JwtProvider.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await HashProvider.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
    }

    const token = JwtProvider.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userWithoutPassword, token };
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    return user;
  }
}
