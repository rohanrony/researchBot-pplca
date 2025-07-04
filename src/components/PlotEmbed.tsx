/* eslint-disable */
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './hello.css';

// Extend Window interface to include Plotly
declare global {
  interface Window {
    Plotly: any;
  }
}

/**
 * A styled, animating card wrapper for Plotly embeds with expand/collapse using CSS animations.
 */
export function PlotlyEmbed({ htmlString }: { htmlString: string }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Ensure portal only mounts on client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Inject HTML content and re-execute Plotly scripts
  const injectContent = (container: HTMLDivElement | null) => {
    if (!container) return;

    // Clear container first
    container.innerHTML = '';

    // Create temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;

    // Append all children
    while (temp.firstChild) {
      container.appendChild(temp.firstChild);
    }

    // Re-run scripts to ensure Plotly initializes
    Array.from(container.querySelectorAll('script')).forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(({ name, value }) =>
        newScript.setAttribute(name, value),
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Force Plotly to resize if it exists
    if (window.Plotly && container.querySelector('.js-plotly-plot')) {
      setTimeout(() => {
        try {
          window.Plotly.Plots.resize(
            container.querySelector('.js-plotly-plot'),
          );
        } catch (e) {
          console.error('Error resizing Plotly plot:', e);
        }
      }, 100);
    }
  };

  // Re-inject when htmlString or refs change
  useEffect(() => {
    injectContent(cardRef.current);
    if (modalRef.current) {
      injectContent(modalRef.current);
    }
  }, [htmlString]);

  // Handle modal visibility and content injection with proper timing
  useEffect(() => {
    if (!expanded) {
      // When closing, just handle the animation
      if (modalContainerRef.current) {
        modalContainerRef.current.classList.remove('modal-visible');
      }
      return;
    }

    // When opening modal:
    if (modalContainerRef.current) {
      // 1. Make sure the modal is displayed first
      modalContainerRef.current.style.display = 'flex';

      // 2. Force a reflow before adding the visible class (for animation)
      modalContainerRef.current.offsetHeight;
      modalContainerRef.current.classList.add('modal-visible');

      // 3. Wait for modal to become visible before injecting content
      setTimeout(() => {
        if (modalRef.current) {
          injectContent(modalRef.current);
        }

        // 4. Set focus to the close button for accessibility
        const closeButton =
          modalContainerRef.current?.querySelector('.close-button') as HTMLElement;
        if (closeButton) closeButton.focus();
      }, 300); // Increased timeout to ensure modal is fully visible
    }
  }, [expanded, htmlString]);

  // Handle modal closing animation
  useEffect(() => {
    // Define interface for the transition event handler
    interface TransitionEvent extends Event {
      target: EventTarget | null;
    }
    
    const handleTransitionEnd = (e: TransitionEvent): void => {
      // Only handle transitions on the modal container itself
      if (e.target !== modalContainerRef.current) return;

      // If we're closing and the animation is done, clean up
      if (!expanded && modalContainerRef.current) {
      modalContainerRef.current.style.display = 'none';
      }
    };

    if (modalContainerRef.current) {
      modalContainerRef.current.addEventListener(
        'transitionend',
        handleTransitionEnd,
      );
    }

    return () => {
      if (modalContainerRef.current) {
        modalContainerRef.current.removeEventListener(
          'transitionend',
          handleTransitionEnd,
        );
      }
    };
  }, [expanded]);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleEscape = (e: { key: string; }) => {
      if (e.key === 'Escape' && expanded) {
        setExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [expanded]);

  return (
    <>
      <div className="plotly-card">
        <div className="gradient-top"></div>

        <div className="card-header">
          <h3 className="card-title">Interactive Plot</h3>
          <button onClick={() => setExpanded(true)} className="expand-button">
            <span>Expand</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            </svg>
          </button>
        </div>

        <div className="plotly-container">
          <div ref={cardRef} className="plotly-content"></div>
        </div>
      </div>

      {mounted &&
        createPortal(
          <div
            ref={modalContainerRef}
            className="modal-container"
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpanded(false);
            }}
          >
            <div className="modal-content">
              <div className="gradient-top"></div>
              <div className="modal-header">
                <h3 className="modal-title">Interactive Plot (Full View)</h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="close-button"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
                <div
                className="modal-body"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',  
                  filter: 'invert(1)',              
                }}
                >
                <iframe
                  srcDoc={htmlString}
                  onLoad={(e) => {
                  const iframe = e.currentTarget;
                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (doc) {
                    if (doc.head) {
                    const style = doc.createElement('style');
                    style.textContent = `
                body, html {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                  height: 100%;
                  width: 100%;
                }
                .js-plotly-plot, .plotly-graph-div {
                  width: 100% !important;
                  height: 100% !important;
                }
                `;
                    doc.head.appendChild(style);
                    }

                    if (iframe.contentWindow?.Plotly) {
                    const resizePlotly = () => {
                      try {
                      const plot = doc.querySelector('.js-plotly-plot');
                      if (plot && iframe.contentWindow)
                        iframe.contentWindow.Plotly.Plots.resize(plot);
                      } catch (e) {
                      console.error('Error resizing Plotly in iframe:', e);
                      }
                    };

                    // Initial resize
                    setTimeout(resizePlotly, 300);

                    // Add resize listener
                    const resizeObserver = new ResizeObserver(() => {
                      resizePlotly();
                    });

                    if (iframe.parentElement) {
                      resizeObserver.observe(iframe.parentElement);
                    }
                    }
                  }
                  }}
                  className="plotly-iframe"
                  style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  }}
                  title="Interactive Plot"
                />
                </div>{' '}
            </div>
          </div>,
          document.body,
        )}

      <style jsx>{`
        /* Fix for Plotly elements */
        .js-plotly-plot,
        .plot-container,
        .svg-container {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
        }

        /* Ensure modal plotly content is properly sized */
        .modal-body .js-plotly-plot {
          min-height: 400px;
        }
      `}</style>
    </>
  );
}
