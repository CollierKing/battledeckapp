import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import ChatImageDialog from "./chat-image-dialog";

type ImageResult = {
  image_urls: string[];
  image_captions: string[];
};

export default function ChatImageResults({
  imageResults,
}: {
  imageResults: ImageResult;
}) {
  // MARK: - State
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // MARK: - Handlers
  const toggleTooltip = (url: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [url]: !prev[url],
    }));
  };

  const openImageDialog = (url: string, caption: string) => {
    setSelectedImage({ url, caption });
    setDialogOpen(true);
  };

  // MARK: - Fetch Image Blob
  // Shared function to fetch image blob
  const fetchImageBlob = async (url: string): Promise<Blob> => {
    try {
      // Try direct fetch first
      try {
        const directResponse = await fetch(url);
        if (directResponse.ok) {
          return await directResponse.blob();
        }
      } catch (directError) {
        // If direct fetch fails with CORS, we'll try the proxy approach
        console.log("Direct fetch failed, trying proxy:", directError);
      }

      // If we get here, direct fetch failed - use server proxy
      const proxyResponse = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });
      
      if (!proxyResponse.ok) {
        throw new Error(`Failed to fetch image via proxy from ${url}`);
      }
      
      return await proxyResponse.blob();
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  };

  // MARK: - Render
  return (
    <>
      {/* MARK: - Image Results */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        {imageResults.image_urls.map((url, index) => (
          <div key={url} className="flex flex-col items-center">
            <TooltipProvider>
              <Tooltip
                open={openStates[url] || false}
                onOpenChange={(open) =>
                  setOpenStates((prev) => ({ ...prev, [url]: open }))
                }
              >
                <TooltipTrigger asChild onClick={() => toggleTooltip(url)}>
                  <div className="relative h-48 w-full mb-2 rounded-md overflow-hidden cursor-pointer group border border-neutral-200 dark:border-neutral-800">
                    <Image
                      src={url}
                      alt={imageResults.image_captions[index]}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div
                      className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageDialog(
                          url,
                          imageResults.image_captions[index]
                        );
                      }}
                    >
                      <Maximize2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="border bg-background text-foreground max-w-[200px] text-center"
                >
                  <p>{imageResults.image_captions[index]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>

      {/* MARK: - Image Dialog */}
      <ChatImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedImage={selectedImage}
        fetchImageBlob={fetchImageBlob}
      />
    </>
  );
}
