'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/app/AppShell';
import { supabase } from '@/lib/supabase/client';

const mockUser = {
  name: 'Joao Silva',
  role: 'Consultor',
  org: 'Associacao Vida',
};
const isDevelopment = process.env.NODE_ENV === 'development';

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (isDevelopment) {
        if (isMounted) {
          setIsCheckingSession(false);
        }
        return;
      }

      if (!supabase) {
        router.replace('/login');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      if (isMounted) {
        setIsCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-light text-slate-600">
        Verificando sessao...
      </main>
    );
  }

  return <AppShell user={mockUser}>{children}</AppShell>;
}
