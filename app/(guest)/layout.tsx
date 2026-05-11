import { Mail, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { GuestNavbar } from '@/components/ui/GuestNavbar'
import { GuestFooter } from '@/components/ui/GuestFooter'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-dark text-foreground selection:bg-primary/30 overflow-x-hidden">
            <GuestNavbar />
            {children}
            <GuestFooter />
        </div>
    )
}
