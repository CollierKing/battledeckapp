import { toast } from "@/hooks/use-toast";
import { UploadedFile } from "@/types/upload-file";
import { clsx, type ClassValue } from "clsx";
import { ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";
import { v6 as uuidv6 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generator function that streams the response body from a fetch request.
 *
 * @param {RequestInfo | URL} input - The input to fetch. Can be a Request or URL object.
 * @param {RequestInit} [init] - Optional fetch init options.
 * @returns {AsyncGenerator<string, void, undefined>} An async generator that yields decoded response body strings.
 */
export async function* streamingFetch(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const response = await fetch(input, init);

  if (!response.ok) throw `ERROR - status: ${response.statusText}`;
  if (!response.body) throw `ERROR - response body is null or undefined!`;

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    try {
      yield decoder.decode(value);
    } catch (error: unknown) {
      console.warn(error instanceof Error ? error.message : String(error));
    }
  }
}

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const handleFileUpload = (
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
) => {
  return (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // check if file is a valid image, otherwise show toast warning
    for (const file of files) {
      const imageType = file.type.split("/")[0];
      if (imageType !== "image") {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload a valid image file",
        });
        return;
      }
    }

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: uuidv6(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };
};

export const handleRemoveFile = (
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
) => {
  return (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
};

export async function processStreamingResponse(
  stream: AsyncIterable<string>,
  onChunk: (processedText: string) => void
) {
  let accumulatedText = "";

  for await (const value of stream) {
    const lines = value.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const jsonData = line.substring(5).trim();

        if (jsonData === "[DONE]") {
          break;
        }

        try {
          const parsedData = JSON.parse(jsonData);

          if (parsedData.response) {
            accumulatedText += parsedData.response;
            onChunk(accumulatedText);
          }
        } catch (err) {
          console.log("processStreamingResponse.err", err);
          continue;
        }
      }
    }
  }

  return accumulatedText;
}

export function findStringStart(str: string, queryStr: string): number[] {
  const queryStrStart = str.toLowerCase().search(queryStr);

  const queryStrEnd = Math.max(
    queryStrStart + queryStr.length,
    str
      .slice(queryStrStart + queryStr.length)
      .toLowerCase()
      .search(" ")
  );

  if (queryStrStart >= 0) {
    return [queryStrStart, queryStrEnd];
  } else {
    return [-1, -1];
  }
}

// TODO: this is reverting to ".bin" on single slide file uploads

// Add this helper function to map MIME types to file extensions
export function getFileExtension(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "application/json": ".json",
    "application/xml": ".xml",
    "text/csv": ".csv",
    // Add more MIME types as needed
  };

  return mimeToExt[mimeType] || ".bin"; // Default to .bin if MIME type is unknown
}

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
