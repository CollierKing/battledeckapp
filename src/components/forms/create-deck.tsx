"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import {
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "../ui/dialog";
import { Slider } from "../ui/slider";
import { FormEvent, useContext, useEffect, useState } from "react";
import {
  CircuitBoardIcon,
  PersonStandingIcon,
  WandSparklesIcon,
} from "lucide-react";

import { z } from "zod";
import NotificationsContext from "@/contexts/notifications/context";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import {
  cn,
  streamingFetch,
  handleFileUpload,
  handleRemoveFile,
  processStreamingResponse,
} from "@/lib/utils";
import { Loader2 as Spinner } from "lucide-react";
import { FileUploadSection } from "./file-upload";
import { UploadedFile } from "@/types/upload-file";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { createDeckSchema } from "@/schemas/deck";

// MARK: - Constants
const DEFAULT_SLIDE_COUNT = 10;
const MAX_SLIDE_COUNT = 20;
const DEFAULT_AI_PROMPT = `
    Create a deck of <SLIDE_COUNT> slides for a presentation about the history of the internet.
    Each slide should describe an image relating to a topic or concept from the history of the internet,
    and should be no more than 3 sentences long.
    `.trim();

interface CreateDeckFormProps {
  onOpenChange: (open: boolean) => void;
}

const CreateDeckSchema = createDeckSchema(MAX_SLIDE_COUNT); // or whatever your MAX_SLIDE_COUNT is

// MARK: - Form Component
export default function CreateDeckForm({ onOpenChange }: CreateDeckFormProps) {
  const router = useRouter();
  const { toast } = useToast(); // Add this near other hooks

  // MARK: - State
  const [deckType, setDeckType] = useState<string>("");
  const [slideCount, setSlideCount] = useState<number>(DEFAULT_SLIDE_COUNT);
  const [aiPrompt, setAiPrompt] = useState<string>(
    DEFAULT_AI_PROMPT.replace("<SLIDE_COUNT>", slideCount.toString())
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [name, setName] = useState<string>("");
  const [generateCaptions, setGenerateCaptions] = useState(true);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSlidePrompts, setAiSlidePrompts] = useState<string[]>([]);

  // MARK: - Context
  const { notifications, updateNotifications } =
    useContext(NotificationsContext);

  // MARK: - Handlers
  const fileUploadHandler = handleFileUpload(setUploadedFiles);
  const removeFileHandler = handleRemoveFile(setUploadedFiles);

  const handleCreateSlidePrompts = async () => {
    setAiSlidePrompts([]);
    setIsStreaming(true);
    // setRestTest("");

    const it = await streamingFetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        action: "create_slide_prompts",
        aiPrompt: aiPrompt,
        slideCount: slideCount,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await processStreamingResponse(it, (text) => {
      setAiSlidePrompts(
        text
          .split("\n")
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
          .map((e) => {
            const colonIndex = e.indexOf(":");
            return colonIndex >= 0 ? e.slice(colonIndex + 1).trim() : e;
          })
      );
    });

    setIsStreaming(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = {
      name,
      type: deckType,
      aiPrompt: aiPrompt,
      slideCount: deckType === "ai" ? slideCount : undefined,
      files: uploadedFiles,
      generateCaptions: generateCaptions,
      aiSlidePrompts: aiSlidePrompts.slice(
        0,
        Math.min(slideCount, MAX_SLIDE_COUNT)
      ),
    };

    try {
      // Validate the data first
      const validatedData = CreateDeckSchema.parse(formData);
      setIsSubmitting(true);

      // If validation passes, proceed with API submission
      const apiFormData = new FormData();

      // Add all files
      uploadedFiles.forEach((e) => {
        apiFormData.append("file", e.file);
      });

      // Add all metadata
      const metadata = {
        action: "create_deck",
        name: validatedData.name,
        type: validatedData.type,
        aiPrompt: validatedData.aiPrompt,
        fileMetadata: validatedData.files?.map((e) => ({
          file_name: e.file.name,
          id: e.id,
          type: e.file.type,
        })),
        generateCaptions: validatedData.generateCaptions ?? true,
        aiSlidePrompts: validatedData.aiSlidePrompts ?? [],
      };
      apiFormData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/file", {
        method: "POST",
        body: apiFormData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deck created successfully!",
          className: "bg-green-100 text-green-800 border-green-200",
        });

        updateNotifications({
          notifications: true,
          decks: notifications.decks,
        });

        setTimeout(() => {
          onOpenChange(false);
          setIsSubmitting(false)
          router.push(`/decks`);
        }, 1500);
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
    // setIsSubmitting(false);
  };

  // MARK: - Effects
  // Add this cleanup effect
  useEffect(() => {
    // Cleanup object URLs to avoid memory leaks
    return () => {
      uploadedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [uploadedFiles]);

  useEffect(() => {
    if (deckType === "human") {
      setAiPrompt("");
    } else {
      setAiPrompt(
        DEFAULT_AI_PROMPT.replace("<SLIDE_COUNT>", slideCount.toString())
      );
    }
  }, [deckType, slideCount]);

  // MARK: - Render
  return (
    <div>
      <DialogHeader>
        <DialogTitle></DialogTitle>
      </DialogHeader>

      <Card className="-mt-4 w-full border-none shadow-none">
        <CardHeader>
          {/* <CardTitle>Create New Battle Deck</CardTitle> */}
          <DialogTitle>Create New Deck</DialogTitle>
          <CardDescription>
            Choose the type of deck you want to create.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name of your project"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="deckType">Deck Type</Label>
                <Select onValueChange={setDeckType} value={deckType}>
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
                        <CircuitBoardIcon className="w-4 h-4" />
                        <span>AI</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic template rendering */}
            {deckType &&
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
                        Give the AI the type of presentation you want to create.
                      </p>

                      <textarea
                        className="accent-primary text-sm rounded-lg py-1 px-2 border border-input"
                        rows={4}
                        id="aiPrompt"
                        placeholder="Enter your prompt for AI generation"
                        value={aiPrompt.replace(/\t|\n/g, "")}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="slideCount">Number of Slides</Label>
                      <Input
                        id="slideCount"
                        type="number"
                        placeholder={DEFAULT_SLIDE_COUNT.toString()}
                        min="1"
                        value={slideCount.toString()}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setSlideCount(
                            isNaN(value) ? DEFAULT_SLIDE_COUNT : value
                          );
                        }}
                      />
                      <Slider
                        value={[slideCount]}
                        onValueChange={(value) => setSlideCount(value[0])}
                        defaultValue={[DEFAULT_SLIDE_COUNT]}
                        max={MAX_SLIDE_COUNT}
                        step={1}
                      />
                    </div>
                    {aiSlidePrompts.length > 0 && (
                      <Collapsible>
                        <CollapsibleTrigger
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg border p-2 hover:bg-muted",
                            isStreaming && "animate-pulse"
                          )}
                        >
                          <Label>AI Slide Prompts</Label>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="max-h-96 overflow-y-auto mt-2">
                            {aiSlidePrompts.map((e, index) => (
                              <div
                                key={index}
                                className="flex flex-col space-y-2 mb-2"
                              >
                                <p className="text-sm">Slide: {index + 1}</p>
                                <textarea
                                  disabled={isStreaming}
                                  className="mx-2 accent-primary text-sm text-wrap w-9/10 min-h-20 h-fit rounded-lg py-1 px-2 border border-input resize-none"
                                  value={e}
                                  onChange={(event) => {
                                    setAiSlidePrompts((prev) =>
                                      prev.map((prompt, idx) =>
                                        idx === index
                                          ? event.target.value
                                          : prompt
                                      )
                                    );
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                ),
                human: (
                  <div className="grid w-full gap-4 mt-4">
                    <Label htmlFor="aiPrompt">Deck Description</Label>
                    <textarea
                      className="accent-primary text-sm rounded-lg py-1 px-2 border border-input"
                      rows={4}
                      id="aiPrompt"
                      placeholder={
                        deckType === "human"
                          ? "Enter a description of your deck"
                          : "Enter your prompt for AI generation"
                      }
                      value={aiPrompt.replace(/\t|\n/g, "")}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <FileUploadSection
                      uploadedFiles={uploadedFiles}
                      onFileUpload={fileUploadHandler}
                      onRemoveFile={removeFileHandler}
                      showGenerateCaptions={true}
                      generateCaptions={generateCaptions}
                      setGenerateCaptions={setGenerateCaptions}
                    />
                  </div>
                ),
              }[deckType]}

            <DialogFooter className="mt-4 flex flex-row items-center sm:justify-start space-x-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              {deckType === "ai" && (
                <Button
                  variant="outline"
                  className={cn(
                    // "bg-transparent text-primary hover:bg-secondary dark:hover:bg-gray-900",
                    isStreaming ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  onClick={handleCreateSlidePrompts}
                  disabled={aiPrompt.length === 0 || isStreaming}
                  type="button"
                >
                  {isStreaming ? (
                    <div className={cn("flex items-center w-24")}>
                      <Spinner
                        aria-label="Generating prompts..."
                        className="h-4 w-4 text-primary animate-spin mr-2"
                      />
                      {aiSlidePrompts.length > 0 ? (
                        <Progress
                          value={(aiSlidePrompts.length / slideCount) * 100}
                          className="[&>div]:bg-gradient-to-r [&>div]:from-secondary [&>div]:to-primary [&>div]:rounded-l-full"
                        />
                      ) : (
                        <span>Generating...</span>
                      )}
                    </div>
                  ) : aiSlidePrompts.length === 0 ? (
                    "Generate"
                  ) : (
                    <div className="flex items-center">
                      <Spinner
                        aria-label="Re-Generate prompts"
                        className="h-4 w-4 text-primary mr-2"
                      />
                      Re-Generate
                    </div>
                  )}
                </Button>
              )}

              <div className="flex-grow" />
              <Button
                variant="outline"
                className={cn(
                  !deckType ? "opacity-50 cursor-not-allowed" : "",
                  deckType === "ai" &&
                    (aiSlidePrompts.length === 0 || !name || isStreaming)
                    ? "opacity-50 cursor-not-allowed"
                    : "",
                  deckType === "human" && (uploadedFiles.length === 0 || !name)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                )}
                type="submit"
                disabled={isSubmitting || isStreaming}
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
                  "Create Deck"
                )}
              </Button>
            </DialogFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
