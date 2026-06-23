"use client";

import { GuestNavbar } from '@/components/ui/GuestNavbar'
import { GuestFooter } from '@/components/ui/GuestFooter'
import { usePathname } from 'next/navigation'
import FloatingTelegramButton from '@/components/ui/FloatingTelegramButton';
import PriceTicker from '@/components/guest/PriceTicker';

export default function layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isVerificationPage = pathname === '/auth/verification-sent';

    return (
        <div className="min-h-screen bg-bg-dark text-foreground selection:bg-primary/30 overflow-x-hidden">
            <PriceTicker />
            {!isVerificationPage && <GuestNavbar />}
            {children}
            <FloatingTelegramButton />
            {!isVerificationPage && <GuestFooter />}
        </div>
    )
}
