import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { StoryAsset } from '../lib/database.types';

interface UseAssetManagerProps {
    userId: string | undefined;
    sessionId: string | null;
}

export const useAssetManager = ({ userId, sessionId }: UseAssetManagerProps) => {
    const [uploadingAssetId, setUploadingAssetId] = useState<string | null>(null);
    const [generatingAssetId, setGeneratingAssetId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const uploadAssetImage = async (file: File, assetId: string): Promise<string | null> => {
        if (!userId) return null;

        setUploadingAssetId(assetId);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${sessionId || 'temp'}/${assetId}.${fileExt}`;

            console.log('Uploading file:', fileName);

            const { data, error } = await supabase.storage
                .from('storyboard-assets')
                .upload(fileName, file, { upsert: true });

            if (error) {
                console.error('Supabase upload error:', error);
                throw error;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('storyboard-assets')
                .getPublicUrl(fileName);

            console.log('Upload successful! Public URL:', publicUrl);
            return publicUrl;
        } catch (err) {
            console.error('Upload error:', err);
            setError(`Fehler beim Hochladen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
            return null;
        } finally {
            setUploadingAssetId(null);
        }
    };

    const handleAssetUpload = async (
        file: File,
        assetId: string,
        updateCallback: (assetId: string, updates: Partial<StoryAsset>) => void
    ) => {
        console.log('handleAssetUpload called for asset:', assetId);
        const imageUrl = await uploadAssetImage(file, assetId);
        console.log('Received image URL:', imageUrl);

        if (imageUrl) {
            updateCallback(assetId, { image_url: imageUrl, source: 'upload' });
        }
    };

    const handleAssetGenerate = async (
        asset: StoryAsset,
        generateCallback: (asset: StoryAsset, uploadCallback: (file: File, assetId: string) => Promise<string | null>) => Promise<string | null>,
        updateCallback: (assetId: string, updates: Partial<StoryAsset>) => void
    ) => {
        setGeneratingAssetId(asset.id);
        const imageUrl = await generateCallback(asset, uploadAssetImage);
        setGeneratingAssetId(null);

        if (imageUrl) {
            updateCallback(asset.id, { image_url: imageUrl, source: 'ai-generated' });
        }
    };

    return {
        uploadAssetImage,
        handleAssetUpload,
        handleAssetGenerate,
        uploadingAssetId,
        generatingAssetId,
        error,
        setError,
    };
};
