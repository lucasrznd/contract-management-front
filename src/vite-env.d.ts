/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    /** "true" once contract-management-api accepts seller photo uploads. */
    readonly VITE_SELLER_PHOTO_UPLOAD?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
