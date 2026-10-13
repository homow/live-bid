import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

import { Button } from "@/Components/Ui/button/button";
import { Input } from "@/Components/Ui/input";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>

          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Register: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Create Account</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>

          <DialogDescription>
            Create your Live Bid account to start bidding.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="display-name">Display Name</label>
            <Input
              id="display-name"
              type="text"
              placeholder="Niyayesh"
            />
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
        </div>

        <DialogFooter>
          <Button className="w-full">Create Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Login: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Sign In</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>

          <DialogDescription>
            Sign in to your Live Bid account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full">Sign In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>
        Open Dialog
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Dialog without close button</DialogTitle>

          <DialogDescription>
            This dialog does not have the X button.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};