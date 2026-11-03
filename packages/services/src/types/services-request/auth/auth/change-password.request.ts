export interface ChangePasswordRequestService {
  userId: string;
  oldPassword: string;
  newPassword: string;
}
