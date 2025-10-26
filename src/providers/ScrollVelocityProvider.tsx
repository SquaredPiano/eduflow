import { createContext, useEffect, useRef, useContext, MutableRefObject } from 'react';

interface ScrollVelocityContextType {
  velocityRef: MutableRefObject<number>;
  currentProgressRef: MutableRefObject<number>;
  targetProgressRef: MutableRefObject<number>;
  setTargetProgress: (value: number) => void;
  setCurrentProgress: (value: number) => void;
}

const ScrollVelocityContext = createContext<ScrollVelocityContextType | null>(null);

//スクロール系入力値を積算->減算することで、加速度を算出。加速度を供給する。
export const ScrollVelocityProvider = ({ children }: { children: React.ReactNode }) => {
  const velocityRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const touchVelocity = useRef<number>(0);
  const deltaTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const decayRate = 5;
  const maxVelocity = 1;
  const minVelocity = 0.001;

  const handleWheel = (event: WheelEvent) => {
    const isTrackpad = event.deltaMode === 0 && Math.abs(event.deltaY) < 50;

    velocityRef.current += event.deltaY * (isTrackpad ? 0.003 : 0.0013);
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
    lastTouchY.current = event.touches[0].clientY;
    touchVelocity.current = 0;
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (lastTouchY.current !== null) {
      const currentY = event.touches[0].clientY;
      const deltaY = lastTouchY.current - currentY;
      touchVelocity.current = deltaY * 0.0004;//0.0004
      lastTouchY.current = currentY;
      velocityRef.current += touchVelocity.current;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    lastTouchY.current = null;
  };

  const setTargetProgress = (value: number) => {
    targetProgressRef.current = value;
  };

  const setCurrentProgress = (value: number) => {
    currentProgressRef.current = value;
  };

  useEffect(() => {
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const animate = (currentTime: number) => {
      const diff = targetProgressRef.current - currentProgressRef.current;

      currentProgressRef.current += diff * 0.3; //0.2から0.3くらいが丁度いい補完スピード

      if (lastTimeRef.current !== 0) {
        deltaTimeRef.current = (currentTime - lastTimeRef.current) / 1000;
      } else {
        deltaTimeRef.current = 0;
      }
      lastTimeRef.current = currentTime;

      velocityRef.current += diff * 0.2;

      const decay = Math.exp(-decayRate * deltaTimeRef.current);
      velocityRef.current *= decay;

      if (Math.abs(velocityRef.current) < minVelocity) {
        velocityRef.current = 0;
      }

      velocityRef.current = Math.max(Math.min(velocityRef.current, maxVelocity), -maxVelocity);

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <ScrollVelocityContext.Provider
      value={{
        velocityRef,
        currentProgressRef,
        targetProgressRef,
        setTargetProgress,
        setCurrentProgress,
      }}
    >
      {children}
    </ScrollVelocityContext.Provider>
  );
};

export const useScrollVelocity = () => {
  const context = useContext(ScrollVelocityContext);
  if (!context) {
    throw new Error('useScrollVelocity must be used within a ScrollVelocityProvider');
  }
  return context;
};
