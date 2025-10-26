'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FolderKanban, 
  Network, 
  Settings, 
  LogOut,
  GraduationCap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/dashboard/canvas', icon: Network, label: 'Flow Canvas' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function VerticalNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        <span className="text-xl font-bold text-gray-900">EduFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <Link href="/api/auth/logout">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </Link>
      </div>
    </div>
  );
}
