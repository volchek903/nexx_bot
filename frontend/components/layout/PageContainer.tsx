import type { PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <main className="relative min-h-dvh overflow-hidden px-3.5 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pt-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-4rem] h-48 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.2),transparent_62%)]" />
        <div className="absolute left-[-4rem] top-[4rem] h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-60 w-60 rounded-full bg-fuchsia-500/12 blur-3xl" />
        <div className="absolute bottom-[7rem] left-[12%] h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-x-10 top-[7.25rem] h-px bg-brand-gradient opacity-40" />
        <div className="absolute inset-x-[-18%] top-[18rem] h-px rotate-[-10deg] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="relative mx-auto w-full max-w-[430px]">{children}</div>
    </main>
  );
}
