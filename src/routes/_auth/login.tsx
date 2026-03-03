import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth";

const LoginPage = () => <LoginForm />;

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});
