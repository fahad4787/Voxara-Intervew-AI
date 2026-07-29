import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollPerfRoot } from "@/components/layout/ScrollPerfRoot";
import { RevealInit } from "@/components/marketing/RevealInit";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollPerfRoot>
      <RevealInit />
      <div className="flex min-h-full flex-col bg-[var(--bg)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ScrollPerfRoot>
  );
}
