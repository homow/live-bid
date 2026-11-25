"use client";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";
import { Checkbox } from "@/Components/Ui/checkbox";
import { Muted } from "@/Components/Ui/typography/typography";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import {
  LoginUserSchema,
  type LoginUserSchemaType,
} from "@live-bid/contracts/schemas";

import { useLogin } from "@/featuer/Auth/hooks/useLogin";

type LoginFormProps = {
  onRegisterClick: () => void;
  onResetPasswordClick: () => void;
  onForgotPasswordClick: () => void;
};

const LoginForm = ({
  onRegisterClick,
  onForgotPasswordClick,
}: LoginFormProps) => {
  const { login, loading } = useLogin(() => {});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof LoginUserSchema>, unknown, LoginUserSchemaType>({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: {
      remember: false,
    },
  });

  const onLogin = async (data: LoginUserSchemaType) => {
    await login(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onLogin)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="login-username">Username</label>

          <Input
            id="login-username"
            type="text"
            placeholder="Username"
            {...register("username")}
          />

          {errors.username && (
            <Muted className="text-red-500">{errors.username.message}</Muted>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email">Email</label>

          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
          />

          {errors.email && (
            <Muted className="text-red-500">{errors.email.message}</Muted>
          )}

          <Muted>Enter your username or email address.</Muted>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="login-password">
            Password <span className="text-red-500">*</span>
          </label>

          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />

          {errors.password && (
            <Muted className="text-red-500">{errors.password.message}</Muted>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <label htmlFor="remember" className="text-sm text-muted-foreground">
            Remember me
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Muted>
        Don't have an account?{" "}
        <Button type="button" onClick={onRegisterClick} variant="link">
          Create one
        </Button>
      </Muted>
    </>
  );
};

export default LoginForm;
