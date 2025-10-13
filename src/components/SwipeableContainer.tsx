import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Finance from "@/pages/Finance";

const pages = [
  { path: "/", component: Dashboard },
  { path: "/projects", component: Projects },
  { path: "/finance", component: Finance },
];

export const SwipeableContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const minSwipeDistance = 50;

  // Update current index based on route
  useEffect(() => {
    const index = pages.findIndex((page) => page.path === location.pathname);
    if (index !== -1 && index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [location.pathname]);

  // Scroll to current page
  useEffect(() => {
    if (containerRef.current && isMobile) {
      const container = containerRef.current;
      const targetScroll = currentIndex * container.clientWidth;
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  }, [currentIndex, isMobile]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) return;

    const swipeDistance = touchStart - touchEnd;
    const absDistance = Math.abs(swipeDistance);

    setIsDragging(false);

    if (absDistance > minSwipeDistance) {
      if (swipeDistance > 0 && currentIndex < pages.length - 1) {
        // Swipe left - go to next page (forward)
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        navigate(pages[nextIndex].path);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        // Swipe right - go to previous page (back)
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        navigate(pages[prevIndex].path);
      }
    }
  };

  if (!isMobile) {
    // On desktop, render only the current page
    const CurrentPage = pages.find((page) => page.path === location.pathname)?.component || Dashboard;
    return <CurrentPage />;
  }

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-hidden snap-x snap-mandatory touch-pan-x w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {pages.map((page, index) => {
        const PageComponent = page.component;
        return (
          <div
            key={page.path}
            className="min-w-full snap-center flex-shrink-0"
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
              transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)",
            }}
          >
            <PageComponent />
          </div>
        );
      })}
    </div>
  );
};
