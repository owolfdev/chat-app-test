import { createContext, useContext } from "react";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  info?: string;
  // add other properties of user if needed...
}

interface UserContextValue {
  user: User | null;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue | null {
  return useContext(UserContext);
}

export default UserContext;
