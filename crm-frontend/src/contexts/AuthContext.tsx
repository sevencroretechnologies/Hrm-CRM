import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, User } from "../services/api";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    signUp: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // Optionally verify token with profile endpoint
            authApi.getProfile()
                .then(res => {
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    setUser(res.data.user);
                })
                .catch(() => {
                    logout();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (data: any) => {
        const res = await authApi.signIn(data);
        const { token, user, token_type } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);
        localStorage.setItem("token_type", token_type || "Bearer");
        localStorage.setItem("user_id", user.id.toString());
        setUser(user);
    };

    const signUp = async (data: any) => {
        const res = await authApi.signUp(data);
        const { token, user, token_type } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);
        localStorage.setItem("token_type", token_type || "Bearer");
        localStorage.setItem("user_id", user.id.toString());
        setUser(user);
    };

    const logout = async () => {
        try {
            await authApi.signOut();
        } catch (e) {
            console.error("Signout error", e);
        } finally {
            localStorage.clear();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
