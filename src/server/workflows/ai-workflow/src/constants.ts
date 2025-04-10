// MARK: - MODEL
const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const EMBEDDING_MODEL = "@cf/baai/bge-large-en-v1.5";

// MARK: - GATEWAY
const GATEWAY = "battledecks_ai_gateway";

// MARK: - PROMPTS
const CAPTION_PROMPT = `
Take the provided image and explain what it is showing in under 50 words.
If you don't know, say so. Be concise and succinct.
No yapping or other comments.
`;

const IMAGE_PROMPT = `
Generate an image based on the provided prompt:
`;

const EMBEDDING_PROMPT = `
Create a concise and descriptive embedding for the provided text:
`;

const makeDeckPrompt = (slideCount: number, aiPrompt: string) => {
  return `
    You are a helpful assistant that generates slide prompts for a deck of images.
    You will be given a prompt and a number of slides.
    You will generate ${slideCount} prompts for the slides.
    The prompts should be concise and descriptive for AI image generation. 
    Here is the prompt: ${aiPrompt}
    The response MUST BE IN the following format.
    prompt1
    \n
    ...
    No extra commentary or extra words outside of the specified format.
    `;
};

export {
  CAPTION_PROMPT,
  IMAGE_PROMPT,
  TEXT_MODEL,
  IMAGE_MODEL,
  VISION_MODEL,
  EMBEDDING_MODEL,
  GATEWAY,
  EMBEDDING_PROMPT,
  makeDeckPrompt,
};
