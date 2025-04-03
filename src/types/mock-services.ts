// MARK: - D1
type D1ResponseInfo = {
  code: number;
  message: string;
};

export type D1Response = {
  result: {
    meta: {
      changed_db: boolean;
      changes: number;
      duration: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
      size_after: number;
    };
    results: Array<unknown>;
    success: boolean;
  }[];
  errors: D1ResponseInfo[];
  messages: D1ResponseInfo[];
  success: boolean;
};

// MARK: -
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