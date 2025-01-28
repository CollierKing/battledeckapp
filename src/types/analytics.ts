export type AnalyticsState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  formData?: FormData;
  queryType: 'sql' | 'graphql';
};
  