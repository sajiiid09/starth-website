export type CreditsStoragePayload = {
  version: 1;
  credits: number;
  updatedAt: number;
};

export type CreditsConfig = {
  isEnabled: boolean;
  defaultCredits: number;
  creditsPerMessage: number;
};
