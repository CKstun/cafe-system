import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategorySliderProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Filter out any redundant 'all' category since clicking again deselects or shows all
  const filteredCategories = categories.filter((c) => c.toLowerCase() !== 'all');

  // Check scroll position to display left/right navigation hints on desktop
  const updateScrollButtons = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons, filteredCategories]);

  // Handle horizontal mouse wheel scrolling on pointer devices
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (containerRef.current.scrollWidth > containerRef.current.clientWidth) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Vertical wheel translated to horizontal scroll
        containerRef.current.scrollLeft += e.deltaY;
      } else {
        containerRef.current.scrollLeft += e.deltaX;
      }
      updateScrollButtons();
    }
  };

  // Drag-to-scroll for desktop mouse users
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    containerRef.current.scrollLeft = scrollLeftState - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Arrow button click navigation (especially for desktop pointer users)
  const scrollByAmount = (offset: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  };

  return (
    <div className={`relative group/slider select-none ${className}`}>
      {/* Desktop Left Scroll Button (visible on hover / active scroll on lg screens) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-200)}
          aria-label="Scroll categories left"
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#EADBCE] text-[#5C3D2E] items-center justify-center shadow-md hover:bg-[#FAF6F0] active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Main Adaptive Scrolling Container:
          - Mobile / Tablet (< 1024px): scrollbar-none, natural touch swipe
          - Desktop (>= 1024px): visible styled category-scrollbar track & mouse support
      */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onScroll={updateScrollButtons}
        className={`category-scrollbar flex items-center gap-2 overflow-x-auto py-2 px-1 touch-pan-x ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab lg:cursor-default'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {filteredCategories.map((category) => {
          const isSelected = selectedCategory?.toLowerCase() === category.toLowerCase();
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#5C3D2E] text-white shadow-sm ring-1 ring-[#5C3D2E]'
                  : 'bg-white text-[#3B2215] border border-[#EADBCE] hover:bg-[#FAF6F0] hover:border-[#D8C7BA]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Desktop Right Scroll Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(200)}
          aria-label="Scroll categories right"
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#EADBCE] text-[#5C3D2E] items-center justify-center shadow-md hover:bg-[#FAF6F0] active:scale-95 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
