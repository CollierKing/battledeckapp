"use client";

import Image from "next/image";
import { Loader2 as Spinner } from "lucide-react";
import { v6 as uuidv6 } from "uuid";
import { toast } from "@/hooks/use-toast";
import {
  streamingFetch,
  processStreamingResponse,
  cn,
  handleFileUpload,
  handleRemoveFile,
} from "@/lib/utils";
import { UploadedFile } from "@/types/upload-file";
import { useState } from "react";
import { z } from "zod";

import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PersonStandingIcon,
  BrainCircuitIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadSection } from "./file-upload";
import { useRouter } from "next/navigation";
import { CreateSlideSchema, CreateCaptionSchema } from "@/schemas/slide";

interface CreateSlideFormProps {
  deckId: string;
  onOpenChange: (open: boolean) => void;
}

// MARK: - Form Component
export default function CreateSlideForm({
  deckId,
  onOpenChange,
}: CreateSlideFormProps) {
  const router = useRouter();

  // MARK: - State
  const [generateCaptions, setGenerateCaptions] = useState<boolean>(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiCaption, setAiCaption] = useState<string>("");
  const [aiImage, setAiImage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [slideType, setSlideType] = useState<"human" | "ai">("human");

  // MARK: - Handlers
  const fileUploadHandler = handleFileUpload(setUploadedFiles);
  const removeFileHandler = handleRemoveFile(setUploadedFiles);

  // Submit the slide
  const handleSubmitSlide = async () => {

    setIsSubmitting(true);
    const formData = {
      action:
        slideType === "ai" ? "create_slide_image" : "create_slide_caption",
      files: uploadedFiles,
      aiPrompt,
      aiCaption,
    };

    try {
      // Validate the data first
      const validatedData = CreateSlideSchema.parse(formData);

      // Add all metadata
      const metadata = {
        action: "create_deck",
        name: null,
        description: null,
        type: "human",
        aiPrompt: null,
        fileMetadata: validatedData.files?.map((e) => ({
          file_name: e.file.name,
          id: e.id,
          caption: slideType === "ai" ? aiPrompt : aiCaption,
        })),
        generateCaptions: false,
        aiSlidePrompts: null,
        addSlideDeckId: deckId,
      };
      // If validation passes, proceed with API submission
      const apiFormData = new FormData();

      // Add all files
      uploadedFiles.forEach((e) => {
        apiFormData.append("file", e.file);
      });

      apiFormData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/file", {
        method: "POST",
        body: apiFormData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Slide created successfully!",
          className: "bg-green-100 text-green-800 border-green-200",
        });

        // Reset form state
        setUploadedFiles([]);
        setAiPrompt("");
        setAiCaption("");
        setAiImage("");

        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the validation errors into a readable message with bullet points
        const errorMessages = error.errors
          .map((err) => `• ${err.message}`)
          .join("\n");
        toast({
          variant: "destructive",
          title: "Incomplete Info",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{errorMessages}</code>
            </pre>
          ),
        });
        setIsSubmitting(false);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
      setIsSubmitting(false);
      throw error;
    }
    setIsSubmitting(false);
  };

  // Create a slide
  const handleCreateSlide = async (action: string) => {

    const formData = {
      action: action,
      files: uploadedFiles,
      aiPrompt: aiPrompt,
      aiCaption: aiCaption,
    };

    try {
      const validatedData = CreateCaptionSchema.parse(formData);
      setIsStreaming(true);

      switch (action) {
        case "create_slide_image":
          const response = await fetch("/api/ai", {
            method: "POST",
            body: JSON.stringify({
              action: action,
              aiPrompt: aiPrompt,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          // Handle the image response
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          const imageId = uuidv6();
          const imageFile = new File([imageBlob], `${imageId}.png`, {
            type: "image/png",
          });
          setAiImage(imageUrl);
          setUploadedFiles([
            ...uploadedFiles,
            {
              file: imageFile,
              id: imageId,
              preview: imageUrl,
            },
          ]);
          break;

        case "create_slide_caption":
          const apiFormData = new FormData();
          uploadedFiles.forEach((e) => {
            apiFormData.append("file", e.file);
          });

          const metadata = {
            action: action,
            fileMetadata: validatedData.files?.map((e) => ({
              file_name: e.file.name,
              id: e.id,
            })),
          };
          apiFormData.append("metadata", JSON.stringify(metadata));

          const it = await streamingFetch("/api/ai", {
            method: "POST",
            body: apiFormData,
          });

          await processStreamingResponse(it, (text) => {
            setAiCaption(text);
          });

          break;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the validation errors into a readable message with bullet points
        const errorMessages = error.errors
          .map((err) => `• ${err.message}`)
          .join("\n");
        toast({
          variant: "destructive",
          title: "Incomplete Info",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{errorMessages}</code>
            </pre>
          ),
        });
        setIsSubmitting(false);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
      setIsSubmitting(false);
      throw error;
    }
    setIsStreaming(false);
  };

  // MARK: - Render
  return (
    <div>
      {/* Create Slide Dialog */}
      <DialogHeader className="text-start">
        <DialogTitle>Create New Slide</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col mt-2 space-y-1.5">
        <Label htmlFor="deckType">Deck Type</Label>
        <Select
          onValueChange={(value: "human" | "ai") => setSlideType(value)}
          value={slideType}
        >
          <SelectTrigger id="deckType">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="human">
              <div className="flex items-center gap-2">
                <PersonStandingIcon className="w-4 h-4" />
                <span>Human</span>
              </div>
            </SelectItem>
            <SelectItem value="ai">
              <div className="flex items-center gap-2">
                <BrainCircuitIcon className="w-4 h-4" />
                <span>AI</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {slideType &&
        {
          ai: (
            <div className="grid w-full gap-4 mt-4">
              <div className=" flex flex-col space-y-1.5">
                <div className="flex items-center">
                  <WandSparklesIcon className="w-4 h-4" />
                  <Label className="ml-1" htmlFor="aiPrompt">
                    AI Prompt
                  </Label>
                </div>

                <p className="ml-1 italic text-sm text-muted-foreground">
                  Give the AI a prompt for the image you want to generate.
                </p>

                <textarea
                  className="accent-primary text-sm rounded-lg py-1 px-2 border border-input"
                  rows={4}
                  id="aiPrompt"
                  placeholder="Enter your prompt for AI generation"
                  value={aiPrompt.replace(/\t|\n/g, "")}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />

                {aiImage && (
                  <div className="flex items-center">
                    {/* <Image src={aiImage} alt="Generated image" width={100} height={100} /> */}

                    <Image
                      src={aiImage}
                      alt={`Generated image`}
                      width={200}
                      height={200}
                      className="w-full h-96 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          ),
          human: (
            <div className="grid w-full gap-4 mt-4">
              <FileUploadSection
                uploadedFiles={uploadedFiles}
                onFileUpload={fileUploadHandler}
                onRemoveFile={removeFileHandler}
                showGenerateCaptions={false}
                generateCaptions={generateCaptions}
                setGenerateCaptions={setGenerateCaptions}
              />

              <p className="ml-1 italic text-sm text-muted-foreground">
                Upload an image and create a caption for the slide.
              </p>

              <textarea
                className="accent-primary text-sm rounded-lg py-1 px-2 border border-input"
                rows={4}
                id="aiCaption"
                placeholder="Enter your caption for the slide"
                value={aiCaption.replace(/\t|\n/g, "")}
                onChange={(e) => setAiCaption(e.target.value)}
              />
            </div>
          ),
        }[slideType]}
      <DialogFooter className="mt-4 flex flex-row items-center sm:justify-start space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        {slideType === "ai" ? (
          <Button
            variant="outline"
            className={cn(
              "w-32",
              aiPrompt.length === 0 ? "opacity-50 cursor-not-allowed" : "",
              isStreaming ? "opacity-50 cursor-not-allowed" : ""
            )}
            onClick={() => handleCreateSlide("create_slide_image")}
            disabled={isStreaming}
            type="button"
          >
            {isStreaming ? (
              <div className={cn("flex items-center w-24")}>
                <Spinner
                  aria-label="Generating image..."
                  className="h-4 w-4 text-white animate-spin mr-2"
                />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center">
                {!aiImage ? (
                  <div className="flex items-center space-x-1">
                    <WandSparklesIcon className="w-4 h-4" />
                    <p>Generate</p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Spinner
                      aria-label="Re-Generate prompts"
                      className="h-4 w-4 text-white mr-2"
                    />
                    <p>Re-Generate</p>
                  </div>
                )}
              </div>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className={cn(
              "w-32",
              uploadedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : "",
              isStreaming ? "opacity-50 cursor-not-allowed" : ""
            )}
            onClick={() => handleCreateSlide("create_slide_caption")}
            disabled={isStreaming}
            type="button"
          >
            {isStreaming ? (
              <div className={cn("flex items-center w-24")}>
                <Spinner
                  aria-label="Generating caption..."
                  className="h-4 w-4 text-primary animate-spin mr-2"
                />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center">
                {!aiImage ? (
                  <div className="flex items-center space-x-1">
                    <WandSparklesIcon className="w-4 h-4" />
                    <p>Generate</p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Spinner
                      aria-label="Re-Generate prompts"
                      className="h-4 w-4 text-white mr-2"
                    />
                    <p>Re-Generate</p>
                  </div>
                )}
              </div>
            )}
          </Button>
        )}
        <div className="flex-grow" />
        <Button
          className={cn(
            "w-32",
            slideType === "ai" && (!aiImage || isStreaming)
              ? "opacity-50 cursor-not-allowed"
              : "",
            slideType === "human" &&
              (uploadedFiles.length === 0 || (generateCaptions && !aiCaption))
              ? "opacity-50 cursor-not-allowed"
              : ""
          )}
          variant="outline"
          type="submit"
          disabled={isSubmitting}
          onClick={() => handleSubmitSlide()}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Spinner
                aria-label="Generating prompts..."
                className="dark:text-white h-4 w-4 animate-spin mr-2"
              />
              <span>Submitting...</span>
            </div>
          ) : (
            "Create Slide"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
