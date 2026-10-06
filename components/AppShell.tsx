"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import BrandRail from "./BrandRail";
import Footer from "./Footer";
import DemoNotice from "./DemoNotice";

// /submit and everything under it (the QR entry point, plus the clinical/
// organizational forms it hands off to) is a standalone public intake flow
// opened on staff phones — it must never show the internal Sidebar/BrandRail/
// TopHeader/Footer chrome or any dashboard/navigation, so it skips the shell
// entirely for that whole subtree.
export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/submit")) {
    return (
      <div className="min-h-screen bg-bgsoft font-arabic">
        <DemoNotice />
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bgsoft font-arabic">
      <DemoNotice />
      <div className="flex flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader onMenuClick={() => setMobileNavOpen(true)} />
          <div className="flex flex-1">
            <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
            <main className="min-w-0 flex-1 bg-gradient-to-b from-[#F7FAFC] via-[#E6F0FA] to-[#F7FAFC]">
              {children}
            </main>
          </div>
        </div>
        <BrandRail />
      </div>
      <Footer />
    </div>
  );
}
