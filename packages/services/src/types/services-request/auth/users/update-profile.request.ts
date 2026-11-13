export interface UpdateProfileRequestService {
  userId: string;
  updatableData: {
    username?: string;
    display_name?: string;
  };
}
