"use client";

import { Mail, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { GuestNavbar } from '@/components/ui/GuestNavbar'
import { GuestFooter } from '@/components/ui/GuestFooter'
import { usePathname } from 'next/navigation'

export default function layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isVerificationPage = pathname === '/auth/verification-sent';

    return (
        <div className="min-h-screen bg-bg-dark text-foreground selection:bg-primary/30 overflow-x-hidden">
            {!isVerificationPage && <GuestNavbar />}
            {children}
            {!isVerificationPage && <GuestFooter />}
        </div>
    )
}
