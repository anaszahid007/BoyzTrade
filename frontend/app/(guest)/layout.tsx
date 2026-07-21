"use client";

import { GuestNavbar } from '@/components/ui/GuestNavbar'
import { GuestFooter } from '@/components/ui/GuestFooter'
import FloatingTelegramButton from '@/components/ui/FloatingTelegramButton';
import PriceTicker from '@/components/guest/PriceTicker';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-dark text-foreground selection:bg-primary/30 overflow-x-hidden">
            <PriceTicker />
            <GuestNavbar />
            {children}
            <FloatingTelegramButton />
            <GuestFooter />
        </div>
    )
}
