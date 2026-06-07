import Image from "next/image";
import { cn } from "@/lib/utils";

export function FooterCredit({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "flex flex-col items-center justify-center gap-2 border-t py-4 text-center text-xs text-muted-foreground sm:flex-row sm:gap-3",
        className
      )}
    >
      <span>© 2026 Kulaman Schools</span>
      <span className="hidden h-4 w-px bg-border sm:block" />
      <span className="flex items-center justify-center gap-2">
        <span>Designed &amp; Developed by</span>
        <Image
          src="/company-footer-logo.png"
          alt="CYONG"
          width={2048}
          height={683}
          className="h-7 w-auto rounded-sm object-contain"
        />
      </span>
    </footer>
  );
}
