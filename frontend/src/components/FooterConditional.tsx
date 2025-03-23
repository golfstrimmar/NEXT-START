"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "./Footer";
export default function FooterConditional() {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    setIsAdminPage(pathname?.startsWith("/admin") ?? false);
  }, [pathname]);

  if (isAdminPage) return null;
  return <Footer />;
}
