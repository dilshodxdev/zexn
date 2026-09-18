import bcrypt from "bcrypt";
import { API_ERROR_CODES, loginBodySchema } from "@zexn/shared";
import { AppError } from "../../../lib/AppError.js";
import * as authRepository from "../auth.repository.js";
import type { AuthStrategy } from "./AuthStrategy.js";

const INVALID_CREDENTIALS_MESSAGE = "Login yoki parol noto'g'ri";

export class PasswordStrategy implements AuthStrategy {
  readonly name = "password";

  async verify(input: unknown) {
    const parsed = loginBodySchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(401, INVALID_CREDENTIALS_MESSAGE, API_ERROR_CODES.INVALID_CREDENTIALS);
    }

    const user = await authRepository.findUserCredentials(parsed.data.login);
    if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      throw new AppError(401, INVALID_CREDENTIALS_MESSAGE, API_ERROR_CODES.INVALID_CREDENTIALS);
    }
    return user;
  }
}

export const passwordStrategy = new PasswordStrategy();
