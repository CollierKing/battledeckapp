"use client";

import {
  ShareIcon,
  Loader2 as Spinner,
  ClipboardCheckIcon,
  ClipboardIcon,
} from "lucide-react";
import { useState, useEffect, useContext } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slide } from "@/types/slides";
import { PlayCircleIcon, PlusCircleIcon } from "lucide-react";
import { GridView, CarouselView } from "@/components/views/view-types-slide";
import Link from "next/link";
import { PresentationView } from "@/components/views/presentation-view";

import { toast } from "@/hooks/use-toast";
import SearchInput from "@/components/ui/search-input";
import NotificationsContext from "@/contexts/notifications/context";
import CreateSlideForm from "../forms/create-slide";
import { SidebarMenuButton } from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Slides({
  slides,
  deckId,
}: {
  slides: Slide[];
  deckId: string;
}) {
  const router = useRouter();

  // MARK: - State
  const [viewType, setViewType] = useState<"grid" | "carousel">("grid");
  const [slideToDelete, setSlideToDelete] = useState<Slide | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoadingShare, setIsLoadingShare] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [filteredSlides, setFilteredSlides] = useState<Slide[]>(slides);
  const [presentationMode, setPresentationMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // MARK: - Context
  const { notifications, updateNotifications } =
    useContext(NotificationsContext);

  const handleDeleteClick = (slide: Slide) => {
    setSlideToDelete(slide);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsLoadingDelete(true);
    if (!slideToDelete) return;

    const res = await fetch("/api/deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_slides",
        slide_ids: [slideToDelete.id],
        deck_id: slideToDelete.deck_id,
      }),
    });

    if (res.ok) {
      toast({
        title: "Success",
        description: "Slide deleted successfully!",
      });
      setIsLoadingDelete(false);
      setDeleteDialogOpen(false);
      setSlideToDelete(null);
      router.refresh();
    }
  };

  const handlePresent = () => {
    setPresentationMode(true);
  };

  const handleShareDeck = async (deckId: string) => {
    setIsLoadingShare(true);
    const response = await fetch("/api/share", {
      method: "POST",
      body: JSON.stringify({
        action: "create_share",
        deck_id: deckId,
        slides: slides,
      }),
    });
    const data = (await response.json()) as {
      success: boolean;
      share_url: string;
    };
    if (data.success) {
      setShareUrl(data.share_url);
    }
    setIsLoadingShare(false);
  };

  const handleCopy = async (shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (!search || !slides?.length) {
      return;
    }

    const filteredSlides = slides.filter((slide) => {
      return slide?.caption?.toLowerCase().includes(search.toLowerCase());
    });
    setFilteredSlides(filteredSlides);
  }, [search]);

  useEffect(() => {
    // Early returns if required data is missing
    if (!slides?.length) return;
    setFilteredSlides(slides);

    if (!notifications?.decks?.length) return;

    // Update the deck status to acknowledged
    const updatedDecks = notifications.decks.map((e) => {
      if (e.id === deckId) {
        return { ...e, wf_status: "acknowledged" };
      }
      return e;
    });

    updateNotifications({ notifications: false, decks: updatedDecks });
  }, [slides]); // Added notifications to dependency array

  // MARK: - Render
  return (
    <div className="">
      <div className="w-full bg-background fixed top-8 z-50 pb-0.5 pl-4 border-b border-secondary">
        <div className="mt-4 mb-2 flex space-x-2">
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

          <Dialog
            open={createDialogOpen}
            onOpenChange={(open) => setCreateDialogOpen(open)}
          >
            <DialogTrigger asChild>
              <SidebarMenuButton
                className="h-9 w-fit "
                tooltip={"Create a New Slide!"}
              >
                <PlusCircleIcon />
                <span className="hidden sm:inline">New Slide</span>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent>
              <VisuallyHidden>
                <DialogTitle>Create a New Slide!</DialogTitle>
              </VisuallyHidden>
              <CreateSlideForm
                deckId={deckId}
                onOpenChange={(open) => setCreateDialogOpen(open)}
              />
            </DialogContent>
          </Dialog>

          {/* Create Slide button and dialog */}
          <SidebarMenuButton
            className="h-9 w-fit bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900"
            onClick={() => {
              handleShareDeck(deckId);
              setShareDialogOpen(true);
            }}
          >
            <ShareIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </SidebarMenuButton>
        </div>
      </div>

      {/* MARK: - Slides */}
      <div className="pl-4 mt-28">
        {viewType === "grid" && (
          <GridView
            items={filteredSlides}
            onDeleteClick={handleDeleteClick}
            search={search}
          />
        )}
        {viewType === "carousel" && (
          <CarouselView
            items={filteredSlides}
            onDeleteClick={handleDeleteClick}
            search={search}
          />
        )}
      </div>

      {/* MARK: - Delete Slide Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slide?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className={isLoadingDelete ? "opacity-50 cursor-not-allowed" : ""}
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MARK: - Share Deck Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shared Deck URL</DialogTitle>
            <DialogDescription>
              {isLoadingShare ? (
                <Spinner
                  aria-label="Loading share URL..."
                  className="h-4 w-4 animate-spin mr-2"
                />
              ) : (
                <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
                  {shareUrl}
                </Link>
              )}
            </DialogDescription>
            <Button
              className="text-center"
              variant="outline"
              onClick={() => handleCopy(shareUrl || "")}
            >
              {copied ? (
                <ClipboardCheckIcon className="w-4 h-4" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy URL"}
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <PresentationView
        slides={slides}
        isOpen={presentationMode}
        onClose={() => setPresentationMode(false)}
      />
    </div>
  );
}
