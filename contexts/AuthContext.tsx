"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { auth } from "../lib/firebase"
import { authService } from "../lib/auth"
import { onAuthStateChanged, User } from "firebase/auth"


interface AuthContextType {
    user: User | null,
    loading: boolean,
    logout: () => Promise<void>,
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    refreshUser: async () => { }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    async function refreshUser() {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser({ ...auth.currentUser });
        }
    }

    async function logout() {
        try {
            await authService.logout()
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    const value = { user, loading, logout, refreshUser }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}


export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
