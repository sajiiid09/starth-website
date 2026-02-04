import { base44 } from "./base44Client";

type Base44IntegrationFn<TResponse = unknown> = (...args: unknown[]) => Promise<TResponse>;

type Base44CoreIntegrations = {
  InvokeLLM: Base44IntegrationFn;
  SendEmail: Base44IntegrationFn;
  UploadFile: Base44IntegrationFn;
  GenerateImage: Base44IntegrationFn;
  ExtractDataFromUploadedFile: Base44IntegrationFn;
  CreateFileSignedUrl: Base44IntegrationFn;
  UploadPrivateFile: Base44IntegrationFn;
};

const core = (base44 as { integrations: { Core: Base44CoreIntegrations } }).integrations.Core;

export const Core = core;
// Define specific return types to calm TS
export const InvokeLLM = core.InvokeLLM as (args: { prompt: string; response_json_schema?: any }) => Promise<{ captions: any[] }>;
export const SendEmail = core.SendEmail;
export const UploadFile = core.UploadFile as (args: { file: File }) => Promise<{ file_url: string }>;
export const GenerateImage = core.GenerateImage;
export const ExtractDataFromUploadedFile = core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = core.CreateFileSignedUrl;
export const UploadPrivateFile = core.UploadPrivateFile;
