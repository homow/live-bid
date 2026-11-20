"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ShieldCheck } from "lucide-react";

import {
  UpdateProfileSchema,
  UpdateProfileSchemaType,
} from "@live-bid/contracts/schemas";

import {
  SectionTitle,
  P,
  Label,
  InputErrorMessage,
  Small,
} from "@/Components/Ui/typography/typography";

import { Input } from "@/Components/Ui/input";
import { Button } from "@/Components/Ui/button/button";

type ProfileFormProps = {
  showAccountInfo?: boolean;
};

export default function ProfileForm({
  showAccountInfo = false,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      display_name: "",
      username: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(data: UpdateProfileSchemaType) {}

  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-7">
      <div className="mb-6 space-y-2">
        <SectionTitle>Profile Information</SectionTitle>
        <P>Manage your account information and personal details.</P>
      </div>

      {showAccountInfo && (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <div className="flex h-10 items-center gap-3 rounded-xl border border-border bg-muted px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Small>niya@example.com</Small>
            </div>
          </div>

          <div>
            <Label>Role</Label>
            <div className="flex h-10 items-center gap-3 rounded-xl border border-border bg-muted px-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <Small>User</Small>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label>Display Name</Label>
            <Input
              type="text"
              placeholder="Enter display name"
              {...register("display_name")}
            />
            <InputErrorMessage>
              {errors.display_name?.message}
            </InputErrorMessage>
          </div>

          <div>
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter username"
              {...register("username")}
            />
            <InputErrorMessage>{errors.username?.message}</InputErrorMessage>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
