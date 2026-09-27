"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/Ui/dialog/dialog";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";
import { Checkbox } from "@/Components/Ui/checkbox";

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

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email">Email</label>

                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="login-username">Username</label>

                <Input id="login-username" type="text" placeholder="Username" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="login-password">Password</label>

                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />

                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground"
                >
                  Remember me
                </label>
              </div>

              <Button className="w-full">Sign In</Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                type="button"
                onClick={() => setMode("register")}
                variant="link"
              >
                Create one
              </Button>
            </p>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>

              <DialogDescription>
                Create your Live Bid account.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="register-name">Display Name</label>

                <Input id="register-name" type="text" placeholder="Niyayesh" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="register-email">Email</label>

                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="register-password">Password</label>

                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <Button className="w-full">Create Account</Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                type="button"
                onClick={() => setMode("login")}
                variant="link"
              >
                Sign In
              </Button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
