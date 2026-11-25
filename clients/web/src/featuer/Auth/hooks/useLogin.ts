"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import type { LoginUserSchemaType } from "@live-bid/contracts/schemas";

interface LoginResponse {
  login: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface LoginVariables {
  input: {
    username?: string;
    email?: string;
    password: string;
    remember: boolean;
  };
}

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginUserInput!) {
    login(input: $input) {
      id
      username
      email
      role
    }
  }
`;

export const useLogin = (onSuccess: () => void) => {
  const [loginUser, { loading }] = useMutation<LoginResponse, LoginVariables>(
    LOGIN_MUTATION,
  );

  const login = async (data: LoginUserSchemaType) => {
    try {
      const { data: response } = await loginUser({
        variables: {
          input: {
            username: data.username || undefined,
            email: data.email || undefined,
            password: data.password,
            remember: data.remember,
          },
        },
      });

      if (!response?.login) {
        toast.error("Login failed. Please try again.");
        return null;
      }

      toast.success("Login successful :)");
      onSuccess();

      return response.login;
    } catch (error) {
      toast.error("Login failed. Please try again.");
      return null;
    }
  };

  return {
    login,
    loading,
  };
};
