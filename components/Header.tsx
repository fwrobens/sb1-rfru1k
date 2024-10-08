"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          NoteNest
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost">Analytics</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <Button onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}