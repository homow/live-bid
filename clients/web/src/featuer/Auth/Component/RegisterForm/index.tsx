"use client";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";
import { Muted } from "@/Components/Ui/typography/typography";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  RegisterUserSchema,
  type RegisterUserSchemaType,
} from "@live-bid/contracts/schemas";

import { useRegister } from "../../hooks/useRegister";

type RegisterFormProps = {
  onLoginClick: () => void;
  onSuccess: () => void;
};

const RegisterForm = ({ onLoginClick, onSuccess }: RegisterFormProps) => {
  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterUserSchemaType>({
    resolver: zodResolver(RegisterUserSchema),
  });

  const { register, loading } = useRegister(() => {
    reset();
    onSuccess();
  });

  return (
    <>
      <form onSubmit={handleSubmit(register)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="register-name">Display Name</label>

          <Input
            id="register-name"
            type="text"
            placeholder="test"
            {...registerField("display_name")}
          />

          {errors.display_name && (
            <Muted className="text-red-500">
              {errors.display_name.message}
            </Muted>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="register-email">Email</label>

          <Input
            id="register-email"
            type="email"
            placeholder="test@example.com"
            {...registerField("email")}
          />

          {errors.email && (
            <Muted className="text-red-500">{errors.email.message}</Muted>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="register-password">Password</label>

          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            {...registerField("password")}
          />

          {errors.password && (
            <Muted className="text-red-500">{errors.password.message}</Muted>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      <Muted>
        Already have an account?{" "}
        <Button type="button" onClick={onLoginClick} variant="link">
          Sign In
        </Button>
      </Muted>
    </>
  );
};

export default RegisterForm;
