import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // No localStorage in this environment — state resets on refresh.
  // When you run this locally outside Claude artifacts, swap to localStorage if you want persistence.
  const [user, setUser] = useState(null);

  const loginUser = (userData) => setUser(userData);
  const logoutUser = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
