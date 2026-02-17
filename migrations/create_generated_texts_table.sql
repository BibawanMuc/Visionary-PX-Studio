-- Create generated_texts table for TextEngine
CREATE TABLE IF NOT EXISTS public.generated_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    topic TEXT,
    platform TEXT,
    audience TEXT,
    tone TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS generated_texts_user_id_idx ON public.generated_texts(user_id);
CREATE INDEX IF NOT EXISTS generated_texts_created_at_idx ON public.generated_texts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.generated_texts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own generated texts"
    ON public.generated_texts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated texts"
    ON public.generated_texts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated texts"
    ON public.generated_texts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated texts"
    ON public.generated_texts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.generated_texts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
