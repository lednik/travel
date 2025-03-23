/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_MAPBOX_ACCESS_TOKEN: string;
    // Добавьте другие переменные окружения, если они есть
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }