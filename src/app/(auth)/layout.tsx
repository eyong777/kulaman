import { ShieldCheck } from "lucide-react";
import { FooterCredit } from "@/components/footer-credit";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-screen flex-col p-6">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <FooterCredit className="border-t-0 py-0" />
      </section>
      <section className="gov-band relative hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-[3.6rem] place-items-center rounded-lg bg-white/15">
            <ShieldCheck className="size-[2.1rem]" />
          </span>
          <div>
            <p className="text-[1.05rem] font-semibold uppercase leading-tight tracking-wide">DepEd Kulaman District</p>
            <p className="text-[1.8rem] font-bold leading-tight">{APP_NAME}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
