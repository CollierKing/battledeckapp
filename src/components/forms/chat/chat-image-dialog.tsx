import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
  PlusCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { v6 as uuidv6 } from "uuid";

interface Deck {
  id: string;
  name: string;
  description?: string;
  imageCount?: number;
}

interface ChatImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: {
    url: string;
    caption: string;
  } | null;
  fetchImageBlob: (url: string) => Promise<Blob>;
}

export default function ChatImageDialog({
  open,
  onOpenChange,
  selectedImage,
  fetchImageBlob,
}: ChatImageDialogProps) {
  // MARK: - State
  const [zoom, setZoom] = useState(1);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToSlide, setIsAddingToSlide] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // MARK: - Handlers
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  // MARK: - Download Image
  const handleDownload = async (url: string, caption: string) => {
    try {
      const blob = await fetchImageBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Create filename from caption or use default
      const filename = caption
        ? caption.slice(0, 30).replace(/[^a-z0-9]/gi, "_") + ".jpg"
        : "image.jpg";
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download the image. Please try again."
      });
    }
  };

  // MARK: - Fetch Decks
  const fetchDecks = async () => {
    if (decks.length > 0) return; // Only fetch if we don't have decks yet
    
    setIsLoadingDecks(true);
    setError(null);
    
    try {
      const response = await fetch('/api/deck',{
        method: 'POST',
        body: JSON.stringify({
          action: 'get_decks',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      
      const data = await response.json() as { decks: Deck[] };
      setDecks(data.decks || []);
    } catch (err) {
      console.error('Error fetching decks:', err);
      setError('Failed to load decks');
    } finally {
      setIsLoadingDecks(false);
    }
  };

  // MARK: - Add Image to Deck
  const handleAddImageToDeck = async (deckId: string) => {
    if (!selectedImage) return;
    
    setIsAddingToSlide(true);
    setSelectedDeckId(deckId);
    
    try {
      // Use the shared function to fetch the image
      const imageBlob = await fetchImageBlob(selectedImage.url);
      const imageId = uuidv6();
      const imageFile = new File([imageBlob], `${imageId}.png`, {
        type: imageBlob.type || 'image/png',
      });
      
      // Create FormData to send the file
      const apiFormData = new FormData();
      apiFormData.append("file", imageFile);
      
      // Get the caption for both aiPrompt and caption fields
      const caption = selectedImage.caption || "Image from AI search";
      
      // Add metadata with similar structure to createSlide
      const metadata = {
        action: "create_deck",
        name: null,
        description: null,
        type: "human",
        aiPrompt: caption, // Set aiPrompt to be the image caption
        fileMetadata: [{
          file_name: imageFile.name,
          id: imageId,
          caption: caption,
        }],
        generateCaptions: false,
        aiSlidePrompts: null,
        addSlideDeckId: deckId, // This is the key part - adding to existing deck
      };
      
      apiFormData.append("metadata", JSON.stringify(metadata));
      
      // Send the request
      const response = await fetch("/api/file", {
        method: "POST",
        body: apiFormData,
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Image added to deck successfully!",
          className: "bg-green-100 text-green-800 border-green-200",
        });
      } else {
        throw new Error('Failed to add image to deck');
      }
    } catch (error) {
      console.error('Error adding image to deck:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add image to deck",
      });
    } finally {
      setIsAddingToSlide(false);
      setSelectedDeckId(null);
    }
  };

  // MARK: - Handle dialog close
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) setZoom(1); // Reset zoom when closing
  };

  // MARK: - Render
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm z-[9999999]" />
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-0 z-[9999999]">
          <DialogTitle className="sr-only">
            {selectedImage?.caption || "Image Preview"}
          </DialogTitle>
          <div className="relative h-[80vh] bg-neutral-100 dark:bg-neutral-900 overflow-auto">
            {selectedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.caption}
                  width={1200}
                  height={800}
                  className="object-contain transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                  unoptimized
                />
              </div>
            )}
            <DialogClose className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 z-[10000000]">
              <X className="h-4 w-4" />
            </DialogClose>

            {/* Image controls */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 z-[10000000]">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={zoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={zoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-white/30 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={() =>
                  selectedImage &&
                  handleDownload(selectedImage.url, selectedImage.caption)
                }
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={() =>
                  selectedImage && window.open(selectedImage.url, "_blank")
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={fetchDecks}>
                  <Button
                    title="Add to Deck"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                    disabled={isLoadingDecks || isAddingToSlide}
                  >
                    {isLoadingDecks || isAddingToSlide ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircleIcon className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 h-96 overflow-y-auto mb-1 z-[10000000]">
                  {isLoadingDecks ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-xs">Loading decks...</span>
                    </div>
                  ) : error ? (
                    <div className="text-xs text-center py-2 text-destructive">
                      {error}
                    </div>
                  ) : decks.length > 0 ? (
                    decks.map((deck) => (
                      <DropdownMenuItem
                        key={deck.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleAddImageToDeck(deck.id)}
                        disabled={isAddingToSlide}
                      >
                        <span>{deck.name}</span>
                        {selectedDeckId === deck.id && isAddingToSlide && (
                          <Loader2Icon className="h-4 w-4 animate-spin ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="text-xs text-center py-2 text-muted-foreground">
                      No decks available
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      // In a real app, this would navigate to create deck page
                      console.log("Create new deck");
                    }}
                    className="text-primary cursor-pointer"
                  >
                    Create new deck...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {selectedImage && (
            <div className="p-4 bg-background border-t">
              <p className="text-sm text-muted-foreground">
                {selectedImage.caption}
              </p>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 