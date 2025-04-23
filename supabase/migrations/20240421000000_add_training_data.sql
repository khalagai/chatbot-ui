-- Create training_data table
CREATE TABLE IF NOT EXISTS public.training_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    messages JSONB NOT NULL,
    model_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT training_data_messages_check CHECK (jsonb_typeof(messages) = 'array')
);

-- Add RLS policies
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training data"
    ON public.training_data
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training data"
    ON public.training_data
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training data"
    ON public.training_data
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training data"
    ON public.training_data
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_training_data_updated_at
    BEFORE UPDATE ON public.training_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 