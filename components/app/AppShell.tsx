'use client';

import { ReactNode, useState } from 'react';
import Sidebar from '@/components/app/Sidebar';
import Topbar from '@/components/app/Topbar';

type UserInfo = {
  name: string;
  role: string;
  org: string;
};

type AppShellProps = {
  children: ReactNode;
  user: UserInfo;
};

export default function AppShell({ children, user }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={{ name: user.name, role: user.role }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
