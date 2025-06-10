import { ArrowRight, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PlaceholdersAndVanishInput } from './ui/VanishingInput';
import CopilotToggle from './MessageInputActions/Copilot';
import Focus from './MessageInputActions/Focus';
import Optimization from './MessageInputActions/Optimization';
import Attach from './MessageInputActions/Attach';
import { File } from './ChatWindow';
import clsx from 'clsx';
import { usePlotStore } from '@/stores/plotStore';

interface RateLimitStatus {
  used: number;
  remaining: number;
  resetAt: string;
}

const EmptyChatMessageInput = ({
  sendMessage,
  focusMode,
  setFocusMode,
  optimizationMode,
  setOptimizationMode,
  fileIds,
  setFileIds,
  files,
  setFiles,
  creditStatus,
}: {
  sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  optimizationMode: string;
  setOptimizationMode: (mode: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  creditStatus: () => Promise<RateLimitStatus>;
}) => {
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [credits, setCredits] = useState<RateLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const plotEnabled = usePlotStore((state) => state.plotEnabled);
  const togglePlot = usePlotStore((state) => state.togglePlot);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const placeholders = [
    'Ask anything...',
    'What would you like to know?',
    'How can I assist you today?',
    "What's on your mind?",
    'Type your question here...',
  ];

  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoading(true);
      try {
        const status = await creditStatus();
        setCredits(status);
      } catch (error) {
        console.error('Failed to fetch credit status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
    // Refresh credits every minute
    const intervalId = setInterval(fetchCredits, 60000);

    return () => clearInterval(intervalId);
  }, [creditStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;

      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    inputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Function to format the time remaining until reset
  const formatTimeRemaining = (resetTimeStr: string) => {
    const resetTime = new Date(resetTimeStr);
    const now = new Date();
    const diffMs = resetTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'now';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    if (!message.trim()) return;

    // Only perform animation if input has the vanish animation function
    if (inputRef.current && 'triggerVanishAnimation' in inputRef.current) {
      // @ts-ignore - Custom property
      await inputRef.current.triggerVanishAnimation();

      // Execute send after animation completes
      const messageToSend = message;
      setMessage('');
      // sendMessage(messageToSend, undefined, plotEnabled);
      sendMessage(messageToSend);
    } else {
      // Fallback if animation isn't available
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      }}
      className="w-full"
    >
      {/* Credits indicator positioned above the input box */}
      {credits && (
        <div className="flex justify-end mb-[-1px]">
          <div
            className={`text-xs px-3 py-1.5 rounded-t-md flex items-center gap-1.5 border border-b-0 border-light-200 dark:border-dark-200 ${
              credits.remaining > 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
          >
            <span className="font-medium">
              {credits.remaining > 0 ? (
                <>
                  {credits.remaining} plot generation
                  {credits.remaining !== 1 ? 's' : ''} remaining
                </>
              ) : (
                <>No plot generations remaining</>
              )}
            </span>
            {credits.remaining < 99 && (
              <div className="flex items-center gap-1 ml-1 border-l border-black/10 dark:border-white/10 pl-1.5">
                <Clock size={12} />
                <span>Next in {formatTimeRemaining(credits.resetAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && !credits && (
        <div className="flex justify-end mb-[-1px]">
          <div className="text-xs px-3 py-1.5 rounded-t-md bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300 border border-b-0 border-light-200 dark:border-dark-200">
            Loading credits...
          </div>
        </div>
      )}

      {/* Main input box with smooth left curve */}
      <div className="flex flex-col bg-light-secondary dark:bg-dark-secondary px-5 pt-5 pb-2 rounded-lg rounded-tr-none w-full border border-light-200 dark:border-dark-200">
        
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={(e) => setMessage(e.target.value)}
          onSubmit={() => handleSubmit()}
          value={message}
          setValue={setMessage}
          textareaRef={inputRef}
        />

        <div className="flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center space-x-2 lg:space-x-4">
            <Focus focusMode={focusMode} setFocusMode={setFocusMode} />
            <Attach
              fileIds={fileIds}
              setFileIds={setFileIds}
              files={files}
              setFiles={setFiles}
              showText
            />
          </div>
          <div className="flex flex-row items-center space-x-1 sm:space-x-4">
            <button
              type="button"
              onClick={togglePlot}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors duration-200 border ${
              plotEnabled
                ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
              }`}
            >
              Plot
            </button>
            <Optimization
              optimizationMode={optimizationMode}
              setOptimizationMode={setOptimizationMode}
            />
            <button
              type="submit"
              disabled={message.trim().length === 0}
              className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 disabled:bg-[#e0e0dc] dark:disabled:bg-[#ececec21] hover:bg-opacity-85 transition duration-100 rounded-full p-2"
            >
              <ArrowRight className="bg-transparent" size={17} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EmptyChatMessageInput;
