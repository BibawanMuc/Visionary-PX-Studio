// Generate image with AI (using same method as ImageGen.tsx)
const generateAssetImage = async (asset: StoryAsset): Promise<string | null> => {
    if (!user) return null;

    setGeneratingAssetId(asset.id);
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('API Key missing');
        }

        // Build prompt based on asset type
        let prompt = '';
        if (asset.type === 'actor') {
            prompt = `Professional portrait photo of a person for a storyboard. ${asset.description || asset.name}. Cinematic lighting, neutral background, high quality photography.`;
        } else if (asset.type === 'environment') {
            prompt = `Professional location photo for a storyboard. ${asset.description || asset.name}. Cinematic establishing shot, professional photography, detailed environment.`;
        } else if (asset.type === 'product') {
            prompt = `Professional product photography for a storyboard. ${asset.description || asset.name}. Commercial photography, clean background, well-lit, high quality.`;
        }

        // Use the same API structure as ImageGen.tsx
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: '1:1',
                }
            }
        });

        // Parse response to find image part
        const respParts = response.candidates?.[0]?.content?.parts;
        if (respParts) {
            for (const part of respParts) {
                if (part.inlineData) {
                    const base64Data = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';

                    // Convert base64 to blob and upload to Supabase
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: mimeType });
                    const file = new File([blob], `${asset.id}-generated.png`, { type: mimeType });

                    // Upload to Supabase Storage
                    const imageUrl = await uploadAssetImage(file, asset.id);
                    console.log('Generated and uploaded image:', imageUrl);
                    return imageUrl;
                }
            }
        }

        throw new Error('Keine Bilddaten in der Antwort');
    } catch (err) {
        console.error('Generation error:', err);
        setError(`Fehler bei der KI-Bildgenerierung: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
        return null;
    } finally {
        setGeneratingAssetId(null);
    }
};
