import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { StoryboardSession } from '../lib/database.types';

export const useStoryboard = () => {
    const { user } = useAuth();

    const saveStoryboard = async (session: Partial<StoryboardSession>) => {
        if (!user) return { error: new Error('User not authenticated') };

        try {
            const sessionData = {
                user_id: user.id,
                title: session.title || 'Untitled Storyboard',
                concept: session.concept || null,
                target_duration: session.target_duration || null,
                num_shots: session.num_shots || 0,
                config: session.config || {},
                assets: session.assets || [],
                shots: session.shots || [],
                updated_at: new Date().toISOString(),
            };

            if (session.id) {
                // Update existing
                const { data, error } = await supabase
                    .from('storyboard_sessions')
                    .update(sessionData)
                    .eq('id', session.id)
                    .select()
                    .single();

                return { data, error };
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('storyboard_sessions')
                    .insert([sessionData])
                    .select()
                    .single();

                return { data, error };
            }
        } catch (error: any) {
            return { error };
        }
    };

    const loadStoryboards = async () => {
        if (!user) return { data: [], error: new Error('User not authenticated') };

        try {
            const { data, error } = await supabase
                .from('storyboard_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            return { data: data as StoryboardSession[], error };
        } catch (error: any) {
            return { data: [], error };
        }
    };

    const deleteStoryboard = async (id: string) => {
        if (!user) return { error: new Error('User not authenticated') };

        try {
            const { error } = await supabase
                .from('storyboard_sessions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            return { error };
        } catch (error: any) {
            return { error };
        }
    };

    return {
        saveStoryboard,
        loadStoryboards,
        deleteStoryboard,
    };
};
