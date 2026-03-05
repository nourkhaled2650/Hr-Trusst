import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useLogin } from "../../hooks/use-login";

export function LoginForm() {
  const { form, onSubmit, loginError, isPending, handleFieldChange } =
    useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="w-full max-w-md rounded-2xl border border shadow-lg bg-background/60">
      <CardContent>
        <div className="flex flex-col space-y-2">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/logo.png" alt="Trusst" className="h-20 w-auto" />
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your Trusst account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <FieldGroup>
              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={isPending}
                  {...register("email", { onChange: handleFieldChange })}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isPending}
                  {...register("password", { onChange: handleFieldChange })}
                />
                <FieldError errors={[errors.password]} />
              </Field>
            </FieldGroup>

            {/* Error alert — only rendered when there is an error */}
            {loginError !== null && (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
