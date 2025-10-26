'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  // Redirect to projects page (the main view)
  useEffect(() => {
    router.push('/dashboard/projects');
  }, [router]);

  return null;
}
