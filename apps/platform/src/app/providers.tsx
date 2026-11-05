"use client";

import { SessionProvider } from "next-auth/react";
import { AdminToastProvider } from "@nexis/ui/admin";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminToastProvider>
        {children}
      </AdminToastProvider>
    </SessionProvider>
  );
}