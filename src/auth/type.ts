export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;  // or number, depending on your userId type
    // add any other properties attached to user here
  };
}
