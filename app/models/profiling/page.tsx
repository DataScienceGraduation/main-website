import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ProfilingPageContent = dynamic(() => import('./ProfilingPageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl font-semibold">Loading...</div>
      </div>
    </div>
  )
});

export default function ProfilingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilingPageContent />
    </Suspense>
  );
}