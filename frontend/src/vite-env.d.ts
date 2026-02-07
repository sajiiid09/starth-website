/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DUMMY_ADMIN_MODE?: string;
  readonly VITE_DUMMY_PLANNER_MODE?: string;
  readonly VITE_ENABLE_CREDITS_UI?: string;
  readonly VITE_DEFAULT_CREDITS?: string;
  readonly VITE_CREDITS_PER_MESSAGE?: string;
  readonly VITE_ENABLE_DEMO_OPS?: string;
  readonly VITE_ENABLE_RECONCILIATION_OPS?: string;
  readonly VITE_ADMIN_READONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
