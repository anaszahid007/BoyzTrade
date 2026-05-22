"use client"

import { createContext, useState, useEffect, useContext, useRef } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../lib/firebase"
import { authService } from "../lib/auth"
import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth"


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
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const authStateResolved = useRef(false)
    const redirectResultResolved = useRef(false)

    useEffect(() => {
        let isMounted = true

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!isMounted) return
            // console.debug("AuthProvider onAuthStateChanged", { currentUser })
            setUser(currentUser)
            authStateResolved.current = true
            if (redirectResultResolved.current) {
                setLoading(false)
            }
        })

        getRedirectResult(auth)
            .then((result) => {
                if (!isMounted) return
                // console.debug("AuthProvider getRedirectResult", { result })
                if (result?.user) {
                    if (!result.user.emailVerified) {
                        router.replace("/auth/verification-sent")
                    } else {
                        router.replace("/dashboard")
                    }
                }
            })
            .catch((error) => {
                // console.error("Google redirect sign-in error:", error)
            })
            .finally(() => {
                if (!isMounted) return
                redirectResultResolved.current = true
                if (authStateResolved.current) {
                    setLoading(false)
                }
            })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [router])

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
