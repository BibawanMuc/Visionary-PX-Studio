export interface ThumbnailConfig {
    background: string;
    mainElement: string;
    textOverlay: string;
    textStyle: string;
}

export interface GenerationParams {
    videoTopic: string;
    bgPrompt: string;
    bgImage: string | null;
    elementPrompt: string;
    elementImage: string | null;
    textContent: string;
    textStyle: string;
    aspectRatio: '16:9' | '9:16' | '1:1';
}

export interface BackgroundToolProps {
    bgPrompt: string;
    setBgPrompt: (prompt: string) => void;
    bgImage: string | null;
    setBgImage: (image: string | null) => void;
    onGenerateIdea: () => void;
    isGeneratingIdea: boolean;
    videoTopic: string;
}

export interface ElementsToolProps {
    elementPrompt: string;
    setElementPrompt: (prompt: string) => void;
    elementImage: string | null;
    setElementImage: (image: string | null) => void;
    onGenerateIdea: () => void;
    isGeneratingIdea: boolean;
    videoTopic: string;
}

export interface TextToolProps {
    textContent: string;
    setTextContent: (text: string) => void;
    textStyle: string;
    setTextStyle: (style: string) => void;
    onGenerateIdea: () => void;
    isGeneratingIdea: boolean;
    videoTopic: string;
}

export interface ThumbnailCanvasProps {
    generatedImage: string | null;
    isGenerating: boolean;
    aspectRatio: '16:9' | '9:16' | '1:1';
    bgPrompt: string;
    bgImage: string | null;
    elementPrompt: string;
    elementImage: string | null;
    textContent: string;
    onPreview: () => void;
    onDownload: () => void;
}

export interface ThumbnailHistoryProps {
    history: any[];
    onRestore: (item: any) => void;
}
