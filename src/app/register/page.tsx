import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "註冊｜Interview Atelier" };

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
