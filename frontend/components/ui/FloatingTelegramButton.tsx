import { Send } from "lucide-react";
import telegramLogo from "@/public/images/Telegram_logo.svg.webp"
import Image from "next/image";

export default function FloatingTelegramButton() {
  return (
    <div className="group fixed bottom-6 right-6 z-50">
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-sky-500 blur-xl opacity-50 animate-pulse" />

      {/* Tooltip */}
      <div
        className="
          absolute right-20 top-1/2 -translate-y-1/2
          whitespace-nowrap rounded-lg
          bg-slate-900 px-3 py-2 text-sm text-white
          opacity-0 shadow-lg
          transition-all duration-300
          group-hover:opacity-100
        "
      >
        Join our Telegram
      </div>

      {/* Button */}
      <a
        href="https://t.me/boyztrade"
        target="_blank"
        rel="noopener noreferrer"
        className="
          relative flex  items-center justify-center
          rounded-full
          text-white
          shadow-[0_0_30px_rgba(34,158,217,0.6)]
          transition-all duration-300
          hover:scale-110
          hover:rotate-12
          hover:shadow-[0_0_60px_rgba(34,158,217,0.9)]
        "
      >
        <Image src={telegramLogo} alt="Telegram" className="h-16 w-16" />
      </a>
    </div>
  );
}