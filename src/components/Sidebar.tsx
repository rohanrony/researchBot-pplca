'use client';

import React, { useState } from 'react';
import { BookOpenText, Home, Search, SquarePen, Settings } from 'lucide-react';
import { useSelectedLayoutSegments } from 'next/navigation';
import { FloatingDock } from './ui/FloatingDock';
import Layout from './Layout';
import {
  SidebarProvider,
  Sidebar as NewSidebar,
  SidebarBody,
  useSidebar,
} from './ui/sidebar_new';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import FileExplorer from './file-explorer';

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Perplexica
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

const BorderFloatingDock = ({
  navItems,
  open,
}: {
  navItems: any[];
  open: boolean;
}) => {
  return (
    <motion.div
      className="fixed top-1/2 -translate-y-1/2 z-50 hidden md:block"
      // animate={{
      //   marginLeft: open ? '280px' : '30px', // Adjust based on sidebar width
      // }}
    >
      <FloatingDock items={navItems} open={open} />
    </motion.div>
  );
};

// Main content wrapper with proper scrolling
const MainContent = ({ children }: { children: React.ReactNode }) => {
  const { open } = useSidebar();

  return (
    <div className="flex flex-1 min-h-0">
      {' '}
      {/* min-h-0 allows flex child to shrink */}
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden">
        <div className="flex-1">
          {' '}
          {/* This div handles the scrolling */}
          <Layout>{children}</Layout>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();
  const [open, setOpen] = useState(false);

  // Define navigation items for the dock
  const navItems = [
    {
      title: 'Write',
      icon: <SquarePen className="h-5 w-5" />,
      href: '/',
      active: false,
    },
    {
      title: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/',
      active: segments.length === 0 || segments.includes('c'),
    },
    {
      title: 'Discover',
      icon: <Search className="h-5 w-5" />,
      href: '/discover',
      active: segments.includes('discover'),
    },
    {
      title: 'Library',
      icon: <BookOpenText className="h-5 w-5" />,
      href: '/library',
      active: segments.includes('library'),
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
      active: segments.includes('settings'),
    },
  ];

  return (
    <SidebarProvider>
      <div
        className={cn(
          'flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-900',
          'h-screen', // Full height container
        )}
      >
        
        
        {/* Floating dock at sidebar border */}
        <BorderFloatingDock navItems={navItems} open={open} />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
};

export default Sidebar;
