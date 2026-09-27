"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/Ui/dialog/dialog";

import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {mode === "login" ? (
          <>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>

              <DialogDescription>
                Sign in to your Live Bid account.
              </DialogDescription>
            </DialogHeader>

            <LoginForm onRegisterClick={() => setMode("register")} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>

              <DialogDescription>
                Create your Live Bid account.
              </DialogDescription>
            </DialogHeader>

            <RegisterForm onLoginClick={() => setMode("login")} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
