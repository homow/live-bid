"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const useForgotPassword = () => {
  const [forgotPasswordMutation, { loading }] = useMutation(
    FORGOT_PASSWORD_MUTATION,
  );

  const forgotPassword = async (email: string) => {
    try {
      await forgotPasswordMutation({
        variables: {
          email,
        },
      });

      return true;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      return false;
    }
  };
  return {
    forgotPassword,
    loading,
  };
};
