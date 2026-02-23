import type { ChangeEvent } from 'react';

export interface ImageGenProps {
    selectedItemId?: string | null;
    onItemLoaded?: () => void;
}

export type GenerationMode = 'TEXT' | 'IMG2IMG' | 'EDIT';
export type AspectRatio = '1:1' | '16:9' | '9:16';

export interface ImageCanvasProps {
    currentImage: string;
    isGenerating: boolean;
    aspectRatio: AspectRatio;
    onPreview: () => void;
    onDownload: () => void;
}

export interface ModeSelectorProps {
    activeMode: GenerationMode;
    setActiveMode: (mode: GenerationMode) => void;
}

export interface ImageControlsProps {
    activeMode: GenerationMode;
    prompt: string;
    setPrompt: (prompt: string) => void;
    uploadedImage: string | null;
    onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export interface ImageHistoryProps {
    history: any[];
    onRestore: (item: any) => void;
}
