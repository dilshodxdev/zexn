import type { User } from "@prisma/client";

export interface AuthStrategy {
  readonly name: string;
  verify(input: unknown): Promise<User>;
}
