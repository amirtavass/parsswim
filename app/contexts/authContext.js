"use client";
import { CreateAuthContext } from "./CreateAuthContext";

export const { Provider: AuthProvider, useAuth } = CreateAuthContext(
  "auth",
  "user",
);
