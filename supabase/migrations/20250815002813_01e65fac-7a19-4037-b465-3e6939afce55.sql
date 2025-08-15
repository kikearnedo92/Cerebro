-- Create storage bucket for retorna files
INSERT INTO storage.buckets (id, name, public) VALUES ('retorna-files', 'retorna-files', true);

-- Create storage policies for retorna-files bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'retorna-files');

CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'retorna-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'retorna-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'retorna-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default company config
INSERT INTO public.company_config (
  name,
  voice_tone,
  system_prompt,
  brand_colors
) VALUES (
  'Retorna',
  'Profesional pero cercano, innovador en fintech',
  'Eres CEREBRO AI, el asistente inteligente de Retorna. Tu personalidad es profesional pero cercana, innovadora y orientada a resultados. Hablas en español de manera natural y conversacional. Siempre mantén un tono optimista y proactivo.',
  '{"primary": "#7C3AED", "secondary": "#A855F7", "accent": "#10B981"}'
);