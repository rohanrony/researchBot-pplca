'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const UserMenu = ({
  isVertical = false,
  asDockItem = false,
  placement = 'right', // default placement is "right"
}: {
  isVertical?: boolean;
  asDockItem?: boolean;
  placement?: 'top' | 'right';
}) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    if (session?.user) {
      setIsOpen(!isOpen);
    }
  };

  const getInitials = () => {
    if (!session?.user?.name) return '';
    return session.user.name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const menuButton = (
    <motion.button
      onClick={handleClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {session?.user?.image ? (
        <img
          src={session.user.image}
          alt="Profile"
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-sm font-medium">{getInitials()}</span>
      )}
    </motion.button>
  );

  // Set placementClass based on placement:
  // In mobile ("top"), we center horizontally
  // In desktop ("right"), we center vertically
  const placementClass =
    placement === 'top'
      ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
      : 'left-full ml-2 top-1/2 transform -translate-y-1/2';

  // Ensure the container has proper positioning
  const containerClass = asDockItem ? '' : 'relative';

  return (
    <div ref={menuRef} className={containerClass}>
      {menuButton}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'absolute z-10 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-lg dark:border-gray-700 dark:bg-neutral-800',
              placementClass,
            )}
          >
            <div className="flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-700 p-3">
                <p className="font-medium text-sm text-black dark:text-white">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
              <div className="p-1">
                <Link href="/profile">
                  <button
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-neutral-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </button>
                </Link>
                <Link href="/settings">
                  <button
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-neutral-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
