import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

type ImageResult = {
  image_urls: string[];
  image_captions: string[];
};

export default function ChatImageResults({
  imageResults,
}: {
  imageResults: ImageResult;
}) {
  const [openStates, setOpenStates] = useState<{[key: string]: boolean}>({});

  const toggleTooltip = (url: string) => {
    setOpenStates(prev => ({
      ...prev,
      [url]: !prev[url]
    }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
      {imageResults.image_urls.map((url, index) => (
        <div key={url} className="flex flex-col items-center">
          <TooltipProvider>
            <Tooltip 
              open={openStates[url] || false}
              onOpenChange={(open) => setOpenStates(prev => ({...prev, [url]: open}))}
            >
              <TooltipTrigger asChild onClick={() => toggleTooltip(url)}>
                <div className="relative h-48 w-full mb-2 rounded-md overflow-hidden cursor-pointer">
                  <Image
                    src={url}
                    alt={imageResults.image_captions[index]}
                    fill
                    className="object-cover"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="border bg-background text-foreground max-w-[200px] text-center">
                <p>{imageResults.image_captions[index]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
}
