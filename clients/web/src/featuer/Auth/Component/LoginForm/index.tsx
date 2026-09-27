"use client";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";
import { Checkbox } from "@/Components/Ui/checkbox";
import { Muted } from "@/Components/Ui/typography/typography";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  LoginUserSchema,
  type LoginUserSchemaType,
} from "@live-bid/contracts/schemas";

type LoginFormProps = {
  onRegisterClick: () => void;
};

const LoginForm = ({ onRegisterClick }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserSchemaType>({
    resolver: zodResolver(LoginUserSchema),
  });

  const onLogin = (data: LoginUserSchemaType) => {
    console.log("LOGIN DATA:", data);
  };

  const onLoginError = (errors: unknown) => {
    console.log("LOGIN ERRORS:", errors);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onLogin, onLoginError)}
        className="flex flex-col gap-4"
      >
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
        </div>

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
          <label htmlFor="login-password">Password</label>

          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />

          {errors.password && (
            <Muted className="text-red-500">{errors.password.message}</Muted>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" {...register("remember")} />

          <label htmlFor="remember" className="text-sm text-muted-foreground">
            Remember me
          </label>
        </div>

        <Button type="submit" className="w-full">
          Sign In
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
