export type HTTPAIParams = {
  prompt: string;
  image?: Uint8Array;
  stream: boolean | undefined;
  temperature: number | undefined;
  top_p: number | undefined;
  frequency_penalty: number | undefined;
  presence_penalty: number | undefined;
};

export type HTTPAIGatewayParams = {
  id: string;
  skipCache: boolean;
};