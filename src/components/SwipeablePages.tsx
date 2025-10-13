import { ReactNode, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeablePagesProps {
  children: ReactNode;
}

const pages = ["/", "/projects", "/finance"];

export const SwipeablePages = ({ children }: SwipeablePagesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentIndex = pages.indexOf(location.pathname);
  const minSwipeDistance = 50; // Minimum distance for a swipe to trigger navigation

  useEffect(() => {
    // Reset drag offset when route changes
    setDragOffset(0);
    setIsDragging(false);
  }, [location.pathname]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isTransitioning) return;
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging || isTransitioning) return;
    
    const currentTouch = e.touches[0].clientX;
    setTouchEnd(currentTouch);
    
    const diff = currentTouch - touchStart;
    
    // Calculate edge resistance
    let offset = diff;
    
    // Add resistance at edges
    if (currentIndex === 0 && diff > 0) {
      // At first page, swiping right (trying to go back)
      offset = diff * 0.3; // 70% resistance
    } else if (currentIndex === pages.length - 1 && diff < 0) {
      // At last page, swiping left (trying to go forward)
      offset = diff * 0.3; // 70% resistance
    }
    
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging || isTransitioning) return;
    
    const swipeDistance = touchEnd - touchStart;
    const absDistance = Math.abs(swipeDistance);
    
    setIsDragging(false);
    setIsTransitioning(true);

    // Determine if swipe is significant enough
    if (absDistance > minSwipeDistance) {
      if (swipeDistance > 0 && currentIndex > 0) {
        // Swipe right - go to previous page
        navigate(pages[currentIndex - 1]);
      } else if (swipeDistance < 0 && currentIndex < pages.length - 1) {
        // Swipe left - go to next page
        navigate(pages[currentIndex + 1]);
      } else {
        // Not enough distance or at edge, snap back
        setDragOffset(0);
      }
    } else {
      // Not enough distance, snap back
      setDragOffset(0);
    }

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  if (!isMobile) {
    // On desktop, just render children normally
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="will-change-transform"
        style={{
          transform: isDragging 
            ? `translateX(${dragOffset}px)` 
            : 'translateX(0)',
          transition: isDragging 
            ? 'none' 
            : 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
