export type HTTPAIParams = {
  prompt: string;
  image?: Uint8Array;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
};

export type HTTPAIGatewayParams = {
  gateway: {
    id: string;
    skipCache: boolean;
  };
};