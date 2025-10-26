import { VerticalNav } from '@/components/layout/VerticalNav';
import { AISidebar } from '@/components/layout/AISidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      {/* Vertical Navigation */}
      <VerticalNav />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* AI Sidebar */}
      <AISidebar />
    </div>
  );
}
