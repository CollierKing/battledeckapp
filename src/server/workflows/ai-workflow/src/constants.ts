// MARK: - MODEL
const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

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

export { CAPTION_PROMPT, IMAGE_PROMPT, TEXT_MODEL, IMAGE_MODEL, VISION_MODEL, GATEWAY };