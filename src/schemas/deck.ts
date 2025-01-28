import { z } from "zod";

export const createDeckSchema = (MAX_SLIDE_COUNT: number) =>
  z
    .object({
      name: z.string().min(1, "Name is required"),
      type: z.enum(["human", "ai"], {
        errorMap: () => ({ message: "Please select deck type" }),
      }),
      aiPrompt: z.string(),
      slideCount: z.number().min(1).max(MAX_SLIDE_COUNT).optional(),
      files: z
        .array(
          z.object({
            id: z.string().uuid(),
            file: z.instanceof(File),
            preview: z.string().url(),
          })
        )
        .optional(),
      generateCaptions: z.boolean().optional(),
      aiSlidePrompts: z.array(z.string()).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "human" && (!data.files || data.files.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least 1 file required for human decks",
          path: ["files"],
        });
      }

      if (data.type === "human" && data.files.length > MAX_SLIDE_COUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `At most ${MAX_SLIDE_COUNT} files allowed for human decks`,
          path: ["files"],
        });
      }

      if (!data.aiPrompt || data.aiPrompt.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A prompt or description is required",
          path: ["aiPrompt"],
        });
      }

      if (
        data.type === "ai" &&
        (!data.aiSlidePrompts || data.aiSlidePrompts.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "AI slide prompts required for AI decks",
          path: ["aiSlidePrompts"],
        });
      }
    });
