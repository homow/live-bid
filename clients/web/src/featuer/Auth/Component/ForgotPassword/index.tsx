"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";

import { useForgotPassword } from "../../hooks/useForgotPassword";

import {
  ForgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "./forgot-password.schema";

type ForgotPasswordProps = {
  onLoginClick: () => void;
  onResetPasswordClick: () => void;
};

const ForgotPassword = ({
  onLoginClick,
  onResetPasswordClick,
}: ForgotPasswordProps) => {
  const [emailSent, setEmailSent] = useState(false);

  const { forgotPassword, loading } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordSchemaType) => {
    const success = await forgotPassword(values.email);

    if (success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-500/10">
          <MailCheck className="size-8 text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Check Your Email</h3>

          <p className="text-sm leading-6 text-muted-foreground">
            If an account with this email exists, we've sent a password reset
            link. Please check your inbox.
          </p>

          <p className="text-xs text-muted-foreground">
            Don't forget to check your spam folder.
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onResetPasswordClick}
        >
          Enter New Password
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onLoginClick}
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="forgot-email" className="text-sm font-medium">
          Email Address
        </label>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              disabled={loading}
            />
          )}
        />

        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onLoginClick}
      >
        Back to Sign In
      </Button>
    </form>
  );
};

export default ForgotPassword;
