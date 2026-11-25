import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export const useResetPassword = () => {
  const [resetPasswordMutation, { loading }] = useMutation(
    RESET_PASSWORD_MUTATION,
  );

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      await resetPasswordMutation({
        variables: {
          input: {
            token,
            newPassword,
          },
        },
      });

      toast.success("Password reset successfully.");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password.",
      );
      return false;
    }
  };
  return { resetPassword, loading };
};
