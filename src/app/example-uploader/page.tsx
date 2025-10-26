'use client';

import { UploadDemo } from "@/components/upload";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExampleUploaderPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">File Upload Demo</h1>
              <p className="text-gray-600">Logged in as: {user.email}</p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        {/* Upload Demo */}
        <div className="bg-white rounded-2xl shadow-lg">
          <UploadDemo />
        </div>
      </div>
    </div>
  );
}

