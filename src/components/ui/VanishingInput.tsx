'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  value,
  setValue,
  showSubmitButton = false,
  textareaRef,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  value: string;
  setValue: (value: string) => void;
  showSubmitButton?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const animationCompleteRef = useRef<(() => void) | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible' && intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the interval when the tab is not visible
      intervalRef.current = null;
    } else if (document.visibilityState === 'visible') {
      startAnimation(); // Restart the interval when the tab becomes visible
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [placeholders]);

  const draw = useCallback(() => {
    if (!textareaRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get container width
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = 800;

    // Set canvas dimensions to match container
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    ctx.clearRect(0, 0, containerWidth, containerHeight);
    const computedStyles = getComputedStyle(textareaRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = '#FFF';

    // Collapse all text to a single line for animation
    const singleLineText = value.replace(/\n/g, ' ');
    ctx.fillText(singleLineText, 0, 40);

    const imageData = ctx.getImageData(0, 0, containerWidth, containerHeight);
    const pixelData = imageData.data;
    const newData: any[] = [];


    for (let t = 0; t < containerHeight; t++) {
      let i = 4 * t * containerWidth;
      for (let n = 0; n < containerWidth; n++) {
        let e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value, textareaRef]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(pos, 0, canvasRef.current.width, canvasRef.current.height);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setAnimating(false);
          // Execute the callback once animation is complete
          if (animationCompleteRef.current) {
            animationCompleteRef.current();
            animationCompleteRef.current = null;
          }
        }
      });
    };
    animateFrame(start);
  };

  // This function triggers the animation and returns a promise that resolves when animation is complete
  const triggerVanishAnimation = () => {
    return new Promise<void>((resolve) => {
      if (!value.trim()) {
        resolve();
        return;
      }

      setAnimating(true);
      draw();

      // Store the resolve function to be called when animation completes
      animationCompleteRef.current = resolve;

      // Find the rightmost pixel for animation starting point
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0,
      );

      // Start animation from the right edge
      animate(maxX);
    });
  };

  // Make this function accessible to the parent component
  useEffect(() => {
    if (textareaRef.current) {
      // @ts-ignore - Adding a custom property to the textarea element
      textareaRef.current.triggerVanishAnimation = triggerVanishAnimation;
    }

    return () => {
      if (textareaRef.current) {
        // @ts-ignore - Cleanup
        delete textareaRef.current.triggerVanishAnimation;
      }
    };
  }, [textareaRef, value]);

  return (
    <div className="relative w-full">
      <canvas
        className={cn(
          'absolute pointer-events-none text-base transform scale-50 top-0 left-0 origin-top-left filter invert dark:invert-0 w-full',
          !animating ? 'opacity-0' : 'opacity-100',
        )}
        ref={canvasRef}
      />

      <TextareaAutosize
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange && onChange(e);
          }
        }}
        ref={textareaRef}
        value={value}
        className={cn(
          'w-full bg-transparent placeholder:text-black/50 dark:placeholder:text-white/50 text-sm text-black dark:text-white resize-none focus:outline-none overflow-hidden',
          animating && 'text-transparent dark:text-transparent',
        )}
        placeholder=""
        minRows={animating ? 1 : 2}
        maxRows={animating ? 1 : 10}
      />

      <div className="absolute inset-0 flex items-start pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: 'linear',
              }}
              className="dark:text-zinc-500 text-sm font-normal text-neutral-500 text-left w-full absolute top-0 left-0"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {showSubmitButton && (
        <button
          disabled={!value.trim()}
          type="button"
          onClick={() => {
            triggerVanishAnimation().then(() => {
              onSubmit();
            });
          }}
          className="absolute right-2 top-4 z-50 h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300 h-4 w-4"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <motion.path
              d="M5 12l14 0"
              initial={{
                strokeDasharray: '50%',
                strokeDashoffset: '50%',
              }}
              animate={{
                strokeDashoffset: value ? 0 : '50%',
              }}
              transition={{
                duration: 0.3,
                ease: 'linear',
              }}
            />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
          </motion.svg>
        </button>
      )}
    </div>
  );
}
