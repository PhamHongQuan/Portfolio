import Image from "next/image";
import mark from "@/public/logo-mark.png"; // cropped from public/logo.png

export default function Logo({ className = "h-9", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={mark}
      alt=""
      priority={priority}
      sizes="160px"
      className={`w-auto drop-shadow-[0_2px_10px_rgb(10_60_40/0.35)] ${className}`}
    />
  );
}
