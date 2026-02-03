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
export const InvokeLLM = core.InvokeLLM;
export const SendEmail = core.SendEmail;
export const UploadFile = core.UploadFile;
export const GenerateImage = core.GenerateImage;
export const ExtractDataFromUploadedFile = core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = core.CreateFileSignedUrl;
export const UploadPrivateFile = core.UploadPrivateFile;
