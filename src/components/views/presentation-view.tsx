"use client";

import { Slide } from "@/types/slides";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { ChevronLeft, ChevronRight, MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

interface PresentationViewProps {
  slides: Slide[];
  isOpen: boolean;
  onClose: () => void;
}

export function PresentationView({
  slides,
  isOpen,
  onClose,
}: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);

  if (!slides || slides.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") previousSlide();
    if (e.key === "Escape") onClose();
  };

  const safeCurrentSlide = Math.min(
    Math.max(currentSlide, 0),
    slides.length - 1
  );
  const currentSlideData = slides[safeCurrentSlide];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] h-[90vh] p-0 [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">
          Slide {safeCurrentSlide + 1} of {slides.length}
        </DialogTitle>
        <div className="relative h-full flex items-center justify-center bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-50 bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
            onClick={previousSlide}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={currentSlideData.image_url}
              alt={currentSlideData.caption || "Slide"}
              fill
              className="object-contain z-10"
            />
            {currentSlideData.caption && showCaptions && (
              <div className="absolute bottom-0 w-full bg-black/50 p-4 text-white z-20">
                <p className="text-center">{currentSlideData.caption}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-50 bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
            onClick={nextSlide}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-12 right-4 z-50 bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
            onClick={() => setShowCaptions(!showCaptions)}
            title={showCaptions ? "Hide caption" : "Show caption"}
          >
            <div className="relative">
              <MessageSquare
                className={`h-6 w-6 ${showCaptions ? "opacity-100" : "opacity-50"}`}
              />
              {!showCaptions && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[120%] h-0.5 bg-primary rotate-45 transform origin-center" />
                </div>
              )}
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
