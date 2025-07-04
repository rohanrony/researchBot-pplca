/**
 * Note: Updated positioning:
 * Desktop navbar is positioned center on the left side
 * Mobile navbar is positioned at the bottom center
 * UserMenu is properly centered in both layouts
 **/

import { cn } from '@/lib/utils';
import { IconLayoutNavbarCollapse } from '@tabler/icons-react';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User } from 'lucide-react';
import Link from 'next/link';

// Import UserMenu
import { UserMenu } from './UserMenu';

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  open,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  open: boolean;
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        open={open}
      />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 block md:hidden z-50',
        className,
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2 items-center"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
                >
                  {item.icon}
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-neutral-900 rounded-full px-3 py-2 shadow-lg">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
        >
          <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
        {/* Center the UserMenu horizontally in mobile view */}
        <div className="flex items-center justify-center">
          {!session?.user ? (
            <Link href="/auth">
              <motion.div
                className="flex h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-5 w-5" />
              </motion.div>
            </Link>
          ) : (
            <UserMenu asDockItem placement="top" />
          )}
        </div>
      </div>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  open,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  open: boolean;
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  const { data: session } = useSession();

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageY)} // Changed to pageY for vertical movement
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'fixed top-1/2 -translate-y-1/2 hidden flex-col h-auto w-16 items-center gap-4 rounded-r-2xl bg-gray-50 px-2 py-4 lg:flex bg-neutral-100 dark:bg-neutral-900 z-50',
        'custom-shadow-right', // Add custom shadow class
        className,
      )}
      style={{
        // Custom shadow that only appears on right edge and partially on top/bottom
        boxShadow:
          '-4px 0px 6px -1px rgb(38, 38, 38), 4px 0px 6px -1px rgba(255,255,255,0.2), 4px 4px 6px -2px rgba(255,255,255,0.1), 4px -4px 6px -2px rgba(255,255,255,0.1)',
      }}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
      {/* Center the UserMenu vertically in desktop view */}
      <div className="mt-auto mb-auto flex items-center justify-center">
        {!session?.user ? (
          <Link href="/auth">
            <motion.div
              className="flex h-12 w-12 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="h-6 w-6" />
            </motion.div>
          </Link>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center">
            <UserMenu asDockItem placement="right" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    // Changed to calculate vertical distance for the left side dock
    return val - bounds.y - bounds.height / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 30, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 30, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, y: '-50%' }}
              animate={{ opacity: 1, x: 0, y: '-50%' }}
              exit={{ opacity: 0, x: 2, y: '-50%' }}
              className="absolute -right-32 top-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
