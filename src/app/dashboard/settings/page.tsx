'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Key, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '@/lib/apiClient';

interface UserData {
  user: {
    name: string;
    email: string;
    picture?: string;
    sub: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [canvasUrl, setCanvasUrl] = useState('https://q.utoronto.ca');
  const [canvasToken, setCanvasToken] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const { data: userData } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
  });

  // Save Canvas settings mutation
  const saveCanvasMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/user/canvas', {
        canvasUrl,
        canvasToken,
      });
    },
    onSuccess: () => {
      toast.success('Canvas settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save Canvas settings');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return api.delete('/api/user/account');
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      // Redirect to logout after a brief delay
      setTimeout(() => {
        window.location.href = '/api/auth/logout';
      }, 1500);
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    deleteAccountMutation.mutate();
  };

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
                  placeholder="e.g., https://q.utoronto.ca or https://canvas.instructure.com"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your institution's Canvas LMS URL (e.g., Quercus for UofT)
                </p>
              </div>

              <div>
                <Label htmlFor="canvasToken" className="text-gray-700">API Token</Label>
                <Input
                  id="canvasToken"
                  type="password"
                  placeholder="Enter your Canvas API token"
                  value={canvasToken}
                  onChange={(e) => setCanvasToken(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate a token from Canvas → Account → Settings → Approved Integrations → New Access Token
                </p>
              </div>

              <Button 
                onClick={() => saveCanvasMutation.mutate()}
                disabled={saveCanvasMutation.isPending || !canvasUrl || !canvasToken}
                className="bg-[#0b8e16] hover:bg-[#097a12]"
              >
                {saveCanvasMutation.isPending ? 'Saving...' : 'Save Canvas Settings'}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-red-600">Delete Account</h3>
                  <p className="text-sm text-gray-700">Permanently delete your account and all data. This action cannot be undone.</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-600 hover:bg-red-100"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently delete your account and all associated data including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All projects and files</li>
                <li>AI-generated content (notes, flashcards, quizzes, slides)</li>
                <li>Canvas integrations and settings</li>
                <li>Account preferences</li>
              </ul>
              <p className="font-semibold text-red-600">
                This action cannot be undone!
              </p>
              <div className="mt-4">
                <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="mt-2 font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleteAccountMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
