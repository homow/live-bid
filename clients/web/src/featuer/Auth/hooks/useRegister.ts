"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import type { RegisterUserSchemaType } from "@live-bid/contracts/schemas";

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterUserInput!) {
    register(input: $input) {
      id
      display_name
      email
    }
  }
`;

export const useRegister = (onSuccess: () => void) => {
  const [registerUser, { loading }] = useMutation(REGISTER_MUTATION);

  const register = async (data: RegisterUserSchemaType) => {
    try {
      await registerUser({
        variables: {
          input: {
            display_name: data.display_name,
            email: data.email,
            password: data.password,
          },
        },
      });

      toast.success("Registration successful :)");
      onSuccess();
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return {
    register,
    loading,
  };
};
