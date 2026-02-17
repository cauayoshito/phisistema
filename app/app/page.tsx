import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // Redirect the base /app route to the dashboard
  redirect('/app/dashboard');
}