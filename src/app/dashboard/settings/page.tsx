'use client';

import { useQuery } from '@tanstack/react-query';
import { User, Mail, Key, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface UserData {
  user: {
    name: string;
    email: string;
    picture?: string;
    sub: string;
  };
}

export default function SettingsPage() {
  const { data: userData } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-12">Manage your account and preferences</p>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            </div>

            <div className="space-y-4">
              {userData?.user.picture && (
                <div>
                  <Label className="text-gray-700 mb-2 block">Profile Picture</Label>
                  <img 
                    src={userData.user.picture} 
                    alt={userData.user.name}
                    className="h-20 w-20 rounded-full border-2 border-gray-200"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="name" className="text-gray-700">Name</Label>
                <Input
                  id="name"
                  value={userData?.user.name || ''}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData?.user.email || ''}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="auth0Id" className="text-gray-700">User ID</Label>
                <Input
                  id="auth0Id"
                  value={userData?.user.sub || ''}
                  disabled
                  className="mt-1 bg-gray-50 font-mono text-sm"
                />
              </div>

              <p className="text-sm text-gray-500">
                Profile information is managed through Auth0. To update your profile, 
                please contact support or manage your account through the Auth0 dashboard.
              </p>
            </div>
          </div>

          {/* Canvas API Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Key className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Canvas Integration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="canvasUrl" className="text-gray-700">Canvas URL</Label>
                <Input
                  id="canvasUrl"
                  placeholder="https://canvas.instructure.com"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your institution's Canvas LMS URL
                </p>
              </div>

              <div>
                <Label htmlFor="canvasToken" className="text-gray-700">API Token</Label>
                <Input
                  id="canvasToken"
                  type="password"
                  placeholder="Enter your Canvas API token"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate a token from Canvas → Settings → Approved Integrations
                </p>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Canvas Settings
              </Button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
                <Link href="/api/auth/logout">
                  <Button variant="outline" className="border-gray-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-red-600">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
