import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </section>
      <section className="gov-band hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-white/15">
            <ShieldCheck className="size-7" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">DepEd Kulaman District</p>
            <p className="text-2xl font-bold">{APP_NAME}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-center pb-20 pt-10">
          <Image
            src="/cyong-logo-bg50.png"
            alt="CYONG logo"
            width={2048}
            height={683}
            priority
            className="h-auto w-full max-w-[640px] object-contain"
          />
        </div>
      </section>
    </main>
  );
}
