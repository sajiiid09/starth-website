/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DUMMY_ADMIN_MODE?: string;
  readonly VITE_ENABLE_DEMO_OPS?: string;
  readonly VITE_ENABLE_RECONCILIATION_OPS?: string;
  readonly VITE_ADMIN_READONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
