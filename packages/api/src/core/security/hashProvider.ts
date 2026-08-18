import bcrypt from 'bcryptjs';

export class HashProvider {
  private static readonly SALT_ROUNDS = 10;

  static async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, this.SALT_ROUNDS);
  }

  static async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
