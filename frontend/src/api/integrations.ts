import { request } from "./httpClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LLMRequest = {
  prompt: string;
  response_json_schema?: unknown;
  add_context_from_internet?: boolean;
  [key: string]: unknown;
};

type LLMResponse = {
  captions?: unknown[];
  [key: string]: unknown;
};

type EmailRequest = {
  to: string;
  subject: string;
  body: string;
  [key: string]: unknown;
};

type FileUploadResponse = {
  file_url: string;
};

type ImageGenerateResponse = {
  url: string;
};

type SignedUrlResponse = {
  signedUrl: string;
};

// ---------------------------------------------------------------------------
// Integration functions — all delegated to the backend
// ---------------------------------------------------------------------------

/**
 * Invoke an LLM via the backend. The frontend never calls LLM APIs directly.
 * Backend endpoint handles prompt engineering, model selection, and response parsing.
 */
export async function InvokeLLM(args: LLMRequest): Promise<LLMResponse> {
  return request<LLMResponse>("POST", "/api/integrations/invoke-llm", {
    body: args,
    auth: true,
  });
}

export async function SendEmail(args: EmailRequest): Promise<void> {
  return request<void>("POST", "/api/integrations/send-email", {
    body: args,
    auth: true,
  });
}

export async function UploadFile(args: { file: File }): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", args.file);

  return request<FileUploadResponse>("POST", "/api/integrations/upload-file", {
    body: formData,
    auth: true,
  });
}

export async function GenerateImage(args: Record<string, unknown>): Promise<ImageGenerateResponse> {
  return request<ImageGenerateResponse>("POST", "/api/integrations/generate-image", {
    body: args,
    auth: true,
  });
}

export async function ExtractDataFromUploadedFile(args: Record<string, unknown>): Promise<unknown> {
  return request<unknown>("POST", "/api/integrations/extract-data-from-file", {
    body: args,
    auth: true,
  });
}

export async function CreateFileSignedUrl(args: Record<string, unknown>): Promise<SignedUrlResponse> {
  return request<SignedUrlResponse>("POST", "/api/integrations/create-file-signed-url", {
    body: args,
    auth: true,
  });
}

export async function UploadPrivateFile(args: Record<string, unknown>): Promise<FileUploadResponse> {
  return request<FileUploadResponse>("POST", "/api/integrations/upload-private-file", {
    body: args,
    auth: true,
  });
}

/**
 * Legacy namespace export for consumers that use `Core.InvokeLLM(...)` pattern.
 */
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile,
};
