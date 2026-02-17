import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { StoryAsset, StoryShot } from '../lib/database.types';

interface StoryParams {
    actors: StoryAsset[];
    environment: StoryAsset | null;
    product: StoryAsset | null;
    genre: string;
    mood: string;
    targetAudience: string;
}

interface ShotParams extends StoryParams {
    storyText: string;
}

export const useStoryAI = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateStory = async (params: StoryParams): Promise<string | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error('API Key missing');

            const ai = new GoogleGenAI({ apiKey });

            // Build context from assets
            const actorDescriptions = params.actors
                .filter(a => a.description)
                .map((a) => `${a.name}: ${a.description}`)
                .join(', ');

            const prompt = `Create a compelling ${params.genre || 'commercial'} story for a storyboard with the following elements:

Actors: ${actorDescriptions || 'Not specified'}
Environment: ${params.environment?.description || params.environment?.name || 'Not specified'}
Product: ${params.product?.description || params.product?.name || 'Not specified'}
Mood: ${params.mood || 'engaging'}
Target Audience: ${params.targetAudience || 'general audience'}

Write a concise story (3-5 paragraphs) that would work well for a commercial or short video. Focus on visual storytelling and include specific actions and scenes.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: { parts: [{ text: prompt }] }
            });

            const generatedStory = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return generatedStory;

        } catch (err) {
            console.error('Story generation error:', err);
            setError(`Fehler bei der Story-Generierung: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const generateShots = async (params: ShotParams): Promise<StoryShot[] | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error('API Key missing');

            const ai = new GoogleGenAI({ apiKey });

            // Build comprehensive context
            const actorList = params.actors
                .filter(a => a.description || a.name)
                .map(a => `- ${a.name}${a.description ? ': ' + a.description : ''}`)
                .join('\n');

            const prompt = `You are a professional storyboard artist. Create a detailed shot list for a ${params.genre || 'commercial'} video based on this information:

STORY:
${params.storyText || 'Create a compelling visual narrative'}

ASSETS:
Actors:
${actorList || '- Not specified'}

Environment: ${params.environment?.description || params.environment?.name || 'Not specified'}
Product: ${params.product?.description || params.product?.name || 'Not specified'}

PARAMETERS:
- Mood: ${params.mood || 'engaging'}
- Target Audience: ${params.targetAudience || 'general audience'}
- Duration: 30-60 seconds

Create 5-8 shots that tell this story visually. For each shot, provide:
1. Scene number
2. Title (brief, descriptive)
3. Description (what happens in the shot, 2-3 sentences)
4. Location (specific place in the environment)
5. Framing (choose from: extreme-close-up, close-up, medium-shot, full-shot, wide-shot)
6. Camera angle (choose from: eye-level, high-angle, low-angle, birds-eye, dutch-angle)
7. Camera movement (choose from: static, pan, tilt, dolly, tracking, crane, handheld)
8. Lighting (choose from: natural, studio, dramatic, soft, backlit)
9. Duration (in seconds, 3-10s per shot)
10. Movement notes (actor/object movements)
11. Audio notes (dialogue, sound effects, music cues)

Format your response as a JSON array of shot objects. Example:
[
  {
    "scene_number": "1",
    "title": "Opening Establishing Shot",
    "description": "Wide shot of the city skyline at dawn...",
    "location": "City rooftop",
    "framing": "wide-shot",
    "camera_angle": "high-angle",
    "camera_movement": "slow-pan",
    "lighting": "natural",
    "duration": 5,
    "movement_notes": "Camera pans left to right",
    "audio_notes": "Ambient city sounds, soft music"
  }
]

Respond ONLY with the JSON array, no additional text.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: { parts: [{ text: prompt }] }
            });

            const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Parse JSON response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from AI');
            }

            const generatedShots = JSON.parse(jsonMatch[0]);

            // Convert to StoryShot format
            const newShots: StoryShot[] = generatedShots.map((shot: any, index: number) => ({
                id: Date.now().toString() + index,
                order: index,
                scene_number: shot.scene_number || `${index + 1}`,
                title: shot.title || `Shot ${index + 1}`,
                description: shot.description || '',
                location: shot.location || '',
                framing: shot.framing || 'medium-shot',
                camera_angle: shot.camera_angle || 'eye-level',
                camera_movement: shot.camera_movement || 'static',
                focal_length: '50mm',
                lighting: shot.lighting || 'natural',
                equipment: '',
                audio_notes: shot.audio_notes || '',
                estimated_duration: shot.duration || 5,
                movement_notes: shot.movement_notes || '',
                vfx_notes: '',
                actors: params.actors.map(a => a.id),
                environment: params.environment?.id || '',
                products: params.product ? [params.product.id] : [],
                notes: '',
                duration: shot.duration || 5,
                created_at: new Date().toISOString(),
            }));

            return newShots;

        } catch (err) {
            console.error('Shot generation error:', err);
            setError(`Fehler bei der Shot-Generierung: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAssetImage = async (
        asset: StoryAsset,
        uploadCallback: (file: File, assetId: string) => Promise<string | null>
    ): Promise<string | null> => {
        try {
            const apiKey = process.env.API_KEY;
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
                        const imageUrl = await uploadCallback(file, asset.id);
                        console.log('Generated and uploaded:', imageUrl);
                        return imageUrl;
                    }
                }
            }

            throw new Error('Keine Bilddaten in der Antwort');
        } catch (err) {
            console.error('Generation error:', err);
            setError(`Fehler bei der KI-Bildgenerierung: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
            return null;
        }
    };

    return {
        generateStory,
        generateShots,
        generateAssetImage,
        isGenerating,
        error,
        setError,
    };
};
