import { createContext } from 'react';

interface IAuthContext {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (token: string) => Promise<void>;
}

const AuthContext = createContext<IAuthContext>();

export default AuthContext;
