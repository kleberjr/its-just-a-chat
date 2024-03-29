import { NextFunction, Request as Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { getFromEnv } from "../libs/utils/getFromEnv";
import { MissingCookieError } from "../errors/missingCookie.error";
import { InvalidTokenError } from "../errors/invalidToken.error";

const PASSTHROUGH_ROUTES = [
  '/dev',
  '/login',
  '/logout',
  '/swagger',
  '/css',
  '/js',
];

export const authenticationMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.log('');
  console.log('>>> Request passing through Authentication Middleware...');
  console.log('>>> METHOD:', req.method);
  console.log('>>> PATH:', req.path);
  console.log('');

  if (isPassthroughRoute(req.path)) {
    return next();
  }

  const sessionToken = req.cookies.session;
  if (!sessionToken) {
    throw new MissingCookieError();
  }

  try {
    jwt.verify(sessionToken, getFromEnv('SECRET'));
  } catch (e) {
    throw new InvalidTokenError();
  }

  next();
}

const isPassthroughRoute = (path: string) => {
  for (const route of PASSTHROUGH_ROUTES) {
    if (path.startsWith(route)) {
      return true;
    }
  }

  return false;
}