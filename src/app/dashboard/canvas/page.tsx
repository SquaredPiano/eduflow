'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CanvasContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('project');

  return (
    <div className="h-full bg-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Flow Canvas
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Visual map and flow for your project
          {projectId && ` (Project ID: ${projectId})`}
        </p>
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12">
          <p className="text-gray-500">
            FlowCanvas visualization coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CanvasContent />
    </Suspense>
  );
}
