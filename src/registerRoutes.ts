import { Application } from "express";
import { registerAuthRoutes } from "./routes/authRouter";
import { registerBaseRoutes } from "./routes/baseRouter";

export const registerRoutes = (app: Application) => {
  registerBaseRoutes(app);
  registerAuthRoutes(app);
}