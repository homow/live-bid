"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";

import { useResetPassword } from "../../hooks/useResetPassword";

import {
  ResetPasswordSchema,
  type ResetPasswordSchemaType,
} from "@live-bid/contracts/schemas";

type ResetPasswordProps = {
  onSuccess: () => void;
};

const ResetPassword = ({ onSuccess }: ResetPasswordProps) => {
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { resetPassword, loading } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordSchemaType) => {
    const result = await resetPassword(values.token, values.newPassword);

    if (result) {
      setSuccess(true);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-500">
          Invalid or missing reset link. Please request a new one.
        </p>

        <Button className="w-full" onClick={onSuccess}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-500/10">
          <LockKeyhole className="size-8 text-indigo-400" />
        </div>

        <h3 className="text-lg font-semibold">Password Changed Successfully</h3>

        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now sign in with your new
          password.
        </p>

        <Button className="w-full" onClick={onSuccess}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">
          New Password
        </label>

        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="new-password"
              type="password"
              placeholder="Enter new password"
              disabled={loading}
            />
          )}
        />

        {errors.newPassword && (
          <p className="text-sm text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Resetting Password..." : "Reset Password"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onSuccess}
      >
        Back to Sign In
      </Button>
    </form>
  );
};

export default ResetPassword;
