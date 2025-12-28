'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const refreshSession = async () => {
    await update();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    role: user?.role,
    userId: user?.id,
  };
}