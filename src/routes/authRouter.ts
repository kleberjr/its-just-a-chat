import { PrismaClient } from "@prisma/client";
import { Application, NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { join } from "path";
import { WrongCredentialsError } from "../errors/wrongCredentials.error";
import { daysToMiliseconds } from "../libs/utils/daysToMilliseconds";

export const registerAuthRoutes = (app: Application) => {
  app.route('/login')
    .get((req: Request, res: Response) => {
      res.sendFile(join(__dirname, '/pages/login.html'));
    })

    .post(async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({
        where: { email, password }
      });
  
      if (!user) {
        next(new WrongCredentialsError())
        return;
      }
  
      const token = jwt.sign(
        { email, password },
        process.env.SECRET ?? ''
      );
  
      res.cookie('session', token, {
        maxAge: daysToMiliseconds(2),
        secure: process.env.ENV === 'PROD',
        httpOnly: true,
        sameSite: 'strict',
      });
  
      res.send({ message: 'success' });
    });

  app.route('/logout')
    .post((req: Request, res: Response) => {
      res.clearCookie('session');
      res.send({ message: 'success' });
    });
}