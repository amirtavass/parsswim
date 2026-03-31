"use client";
import { CreateAuthContext } from "./CreateAuthContext";

export const { Provider: AdminProvider, useAuth: useAdminAuth } =
  CreateAuthContext("admin", "admin");
