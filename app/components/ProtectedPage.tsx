"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
};

export default ProtectedPage;
