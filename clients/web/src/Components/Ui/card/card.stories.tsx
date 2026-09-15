import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  argTypes: {
    className: {
      control: false,
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Title Card</CardTitle>
          <CardDescription>Description Card</CardDescription>
        </CardHeader>

        <CardContent>Content Card</CardContent>

        <CardFooter>Footer Card</CardFooter>
      </>
    ),
  },
};
