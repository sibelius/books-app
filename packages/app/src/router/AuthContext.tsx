import { createContext } from 'react';

interface IAuthContext {
  signIn: (data: any) => Promise<void>;
  signOut: () => void;
  signUp: (data: any) => Promise<void>;
}

const AuthContext = createContext<IAuthContext>();

export default AuthContext;
