'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const ProfileSection = () => {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
    <div className="flex flex-col items-center">
      <Link href="/auth" className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
        <User className="w-5 h-5" />
        </div>
        <span className="text-xs mt-1 text-center text-black dark:text-white">
        Sign In
        </span>
      </Link>
      <Link href="/auth" className="mt-2">
        <span className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition flex items-center justify-center">
          Create account
        </span>
      </Link>
    </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Link href="/profile" className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
          {session.user.name ? (
            session.user.name.charAt(0).toUpperCase()
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <span className="text-xs mt-1 text-center text-black dark:text-white">
          {session.user.name || 'Profile'}
        </span>
      </Link>
      <button
        onClick={() => signOut()}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileSection;