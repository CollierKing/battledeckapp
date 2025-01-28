export type Deck = {
  id: string;
  name: string;
  hero_image_url: string;
  wf_status: string;
  createdAt: string;
  updatedAt: string;
  ai_prompt?: string;
};

export type DeckStatusResponse = {
  decks: Array<{
    wf_status: string;
    id: string;
    name: string;
  }>;
}