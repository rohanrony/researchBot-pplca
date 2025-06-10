'use client';

import DeleteChat from '@/components/DeleteChat';
import { WobbleCard } from '@/components/ui/wobble-card';
import { cn, formatTimeDifference } from '@/lib/utils';
import {
  BookOpenText,
  ClockIcon,
  MessageSquare,
  Brain,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  focusMode: string;
}

const getFocusModeIcon = (focusMode: string) => {
  switch (focusMode.toLowerCase()) {
    case 'academic':
      return <BookOpenText className="w-5 h-5" />;
    case 'creative':
      return <Brain className="w-5 h-5" />;
    case 'coding':
      return <Zap className="w-5 h-5" />;
    default:
      return <MessageSquare className="w-5 h-5" />;
  }
};

const getFocusModeColor = (focusMode: string) => {
  
  switch (focusMode.toLowerCase()) {
    case 'academicsearch':
      return 'bg-gradient-to-br from-blue-600 to-blue-800';
    case 'creativesearch':
      return 'bg-gradient-to-br from-purple-600 to-purple-800';
    case 'codingsearch':
      return 'bg-gradient-to-br from-green-600 to-green-800';
    case 'writingsearch':
      return 'bg-gradient-to-br from-orange-600 to-orange-800';
    case 'websearch':
      return 'bg-gradient-to-br from-pink-600 to-pink-800';
    default:
      return 'bg-gradient-to-br from-gray-600 to-gray-800';
  }
};

const Page = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      const res = await fetch(`/api/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      setChats(data.chats);
      setLoading(false);
    };

    fetchChats();
  }, []);

  return loading ? (
    <div className="flex flex-row items-center justify-center min-h-screen">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-light-200 fill-light-secondary dark:text-[#202020] animate-spin dark:fill-[#ffffff3b]"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  ) : (
    <div className="min-h-screen ">
      <div className=" px-4 py-8">
        <div className="flex flex-col mb-8">
          <div className="flex items-center">
            <BookOpenText className="text-4xl mr-3 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Library
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Your conversation history at a glance
          </p>
          <hr className="border-t border-gray-300 dark:border-gray-600 my-6 w-full" />
        </div>

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No conversations yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Start a new chat to see it appear here!
            </p>
          </div>
        )}

        {chats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {chats.map((chat, i) => (
              <WobbleCard
                key={chat.id}
                containerClassName={cn(
                  'min-h-[280px] cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-blue-900',
                  getFocusModeColor(chat.focusMode),
                )}
              >
                <div className="relative h-full flex flex-col justify-between p-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-white/80">
                        {getFocusModeIcon(chat.focusMode)}
                        <span className="text-sm font-medium capitalize">
                          {chat.focusMode}
                        </span>
                      </div>
                      <DeleteChat
                        chatId={chat.id}
                        chats={chats}
                        setChats={setChats}
                      />
                    </div>

                    <Link href={`/c/${chat.id}`} className="block">
                      <h3 className="text-white font-semibold text-lg leading-tight line-clamp-3 hover:text-white/90 transition-colors">
                        {chat.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-2 text-white/70 mt-6">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {formatTimeDifference(new Date(), chat.createdAt)} ago
                    </span>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 -translate-y-2 translate-x-2 blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/5 translate-y-2 -translate-x-2 blur-lg"></div>
                </div>
              </WobbleCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
