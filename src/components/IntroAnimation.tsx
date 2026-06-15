import React, { useState, useEffect } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [currentText, setCurrentText] = useState('<>');
  const [animationPhase, setAnimationPhase] = useState<'typing' | 'moving' | 'complete'>('typing');

  useEffect(() => {
    const sequence = async () => {
      await wait(800);
      setCurrentText('<codeshare>');
      await wait(800);
      setCurrentText('<>CodeShare>');
      await wait(800);

      setAnimationPhase('moving');
      await wait(1000);

      setAnimationPhase('complete');
      onComplete();
    };

    sequence();
  }, [onComplete]);

  if (animationPhase === 'complete') return null;

  return (
    <div className="intro-overlay">
      <div className={`intro-logo ${animationPhase === 'moving' ? 'moving' : ''}`}>
        {currentText}
      </div>

      <style jsx>{`
        .intro-overlay {
          position: fixed;
          inset: 0;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .intro-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(2rem, 8vw, 4rem);
          color: #3b82f6;
          font-weight: 600;
          transition: transform 1s ease, opacity 1s ease;
        }

        .intro-logo.moving {
          transform: translate(-40vw, -40vh) scale(0.4);
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
