import React, { Suspense } from "react";
import ClientModelPage from "./ClientModelPage";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ClientModelPage />
    </Suspense>
  );
}