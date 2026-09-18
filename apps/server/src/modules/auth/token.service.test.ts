import jwt from "jsonwebtoken";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  createRefreshToken: vi.fn(),
  findRefreshTokenByHash: vi.fn(),
  replaceRefreshToken: vi.fn(),
  revokeRefreshTokenByHash: vi.fn(),
}));

vi.mock("./auth.repository.js", () => repositoryMocks);

let tokenService: typeof import("./token.service.js");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://zexn:zexn@localhost:5432/zexn?schema=public";
  process.env.JWT_ACCESS_SECRET = "test-access-secret-at-least-32-characters";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-32-characters";
  tokenService = await import("./token.service.js");
});

beforeEach(() => {
  vi.clearAllMocks();
  repositoryMocks.createRefreshToken.mockResolvedValue({});
  repositoryMocks.replaceRefreshToken.mockResolvedValue(true);
  repositoryMocks.revokeRefreshTokenByHash.mockResolvedValue({ count: 1 });
});

describe("token.service", () => {
  it("access tokenni yaratadi va tekshiradi", async () => {
    const session = await tokenService.issueSession(
      { id: "user-1", isSuperAdmin: false },
      { centerId: "center-1", role: "STUDENT" },
    );

    expect(tokenService.verifyAccessToken(session.accessToken)).toEqual({
      sub: "user-1",
      isSuperAdmin: false,
      membership: { centerId: "center-1", role: "STUDENT" },
    });
  });

  it("muddati tugagan access token uchun TOKEN_EXPIRED qaytaradi", () => {
    const expired = jwt.sign(
      { sub: "user-1", isSuperAdmin: false },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: -1 },
    );

    expect(() => tokenService.verifyAccessToken(expired)).toThrowError(
      expect.objectContaining({ code: "TOKEN_EXPIRED", statusCode: 401 }),
    );
  });

  it("amal qiluvchi refresh tokenni rotation qiladi", async () => {
    const session = await tokenService.issueSession({ id: "user-1", isSuperAdmin: false });
    repositoryMocks.findRefreshTokenByHash.mockResolvedValue({
      id: "refresh-1",
      userId: "user-1",
      tokenHash: "hash",
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      createdAt: new Date(),
    });

    const rotated = await tokenService.rotateRefreshToken(session.refreshToken);

    expect(rotated.userId).toBe("user-1");
    expect(repositoryMocks.replaceRefreshToken).toHaveBeenCalledOnce();
  });

  it("bekor qilingan refresh tokenni rad etadi", async () => {
    const session = await tokenService.issueSession({ id: "user-1", isSuperAdmin: false });
    repositoryMocks.findRefreshTokenByHash.mockResolvedValue({
      id: "refresh-1",
      userId: "user-1",
      tokenHash: "hash",
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
      createdAt: new Date(),
    });

    await expect(tokenService.rotateRefreshToken(session.refreshToken)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      statusCode: 401,
    });
  });
});
