import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 async controller'dagi xatoni ushlamaydi (Express 5 ushlaydi).
 * Bu wrapper rejected promise'ni next(err) ga uzatadi -> errorHandler ishlaydi.
 * Har controller funksiyasi shunga o'raladi.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
