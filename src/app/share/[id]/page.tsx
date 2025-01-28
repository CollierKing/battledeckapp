"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Slide } from "@/types/slides";
import { PlayCircleIcon } from "lucide-react";
import { GridView, CarouselView } from "@/components/views/view-types-slide";
import { PresentationView } from "@/components/views/presentation-view";

export const runtime = "edge";

import SearchInput from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Turnstile } from "@/components/forms/turnstile";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function ShareDeck() {
  const params = useParams();
  const searchParams = useSearchParams();

  // MARK: - State
  const [viewType, setViewType] = useState<"grid" | "carousel">("grid");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [filteredSlides, setFilteredSlides] = useState<Slide[]>([]);

  const [presentationMode, setPresentationMode] = useState(false);

  // Add turnstile verification state
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const [turnstileResponse, setTurnstileResponse] = useState<
    boolean | React.ReactNode
  >(false);

  // Watch for changes in the Turnstile response
  useEffect(() => {
    if (turnstileResponse === true) {
      setIsTurnstileVerified(true);
    }
  }, [turnstileResponse]);

  const handlePresent = () => {
    setPresentationMode(true);
  };

  const handleGetSlides = async (deckId: string) => {
    setIsLoading(true);
    
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_share",
        deck_id: deckId,
      }),
    });
    const data = (await response.json()) as { slides: Slide[] };
    
    if ("slides" in data && Array.isArray(data.slides)) {
      setSlides(data.slides);
      setFilteredSlides(data.slides);
    }
    setIsLoading(false);
  };

  // MARK: - Effects
  useEffect(() => {

    if (params.id) {
      const deckId = Array.isArray(params.id) ? params.id[0] : params.id;
      handleGetSlides(deckId);
    }
  }, [params, searchParams]);

  useEffect(() => {
    const filteredSlides = slides.filter((slide) => {
      return slide?.caption?.toLowerCase().includes(search.toLowerCase());
    });
    setFilteredSlides(filteredSlides);
  }, [search, slides]);

  // MARK: - Render
  return (
    <div className="">
      {!isTurnstileVerified ? (
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mb-4 text-lg font-semibold">
            Please verify you are human
          </h2>
          <Turnstile response={setTurnstileResponse} />
        </div>
      ) : (
        <>
          <div className="w-full bg-background fixed top-0 z-50 pb-0.5 pl-4 border-b border-secondary">
            {slides?.length > 0 ? (
              <div className="mt-4 mb-4 flex space-x-2">
                <SearchInput
                  className="w-1/4 sm:w-36"
                  search={search}
                  setSearch={setSearch}
                  placeholder="Search Slides"
                />
                <Select
                  value={viewType}
                  onValueChange={(value: typeof viewType) => setViewType(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="list">List View</SelectItem> */}
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>

                <SidebarMenuButton
                  className="h-9 w-fit bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
                  onClick={handlePresent}
                >
                  <PlayCircleIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Present</span>
                </SidebarMenuButton>
              </div>
            ) : (
              <div className="absolute h-screen flex">
                <h2 className="mb-4 text-lg font-semibold">
                  No slides found for deck {params.id}
                </h2>
              </div>
            )}
          </div>

          {/* MARK: - Slides */}
          {isLoading ? (
            <div className="pl-4 mt-24">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[450px]" />
                    <Skeleton className="h-4 w-[350px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-4 mt-24">
              {viewType === "grid" && (
                <GridView
                  items={filteredSlides}
                  onItemClick={null}
                  onDeleteClick={null}
                  search={search}
                />
              )}
              {viewType === "carousel" && (
                <CarouselView
                  items={filteredSlides}
                  onItemClick={null}
                  onDeleteClick={null}
                  search={search}
                />
              )}
            </div>
          )}

          <PresentationView
            slides={slides}
            isOpen={presentationMode}
            onClose={() => setPresentationMode(false)}
          />
        </>
      )}
    </div>
  );
}
