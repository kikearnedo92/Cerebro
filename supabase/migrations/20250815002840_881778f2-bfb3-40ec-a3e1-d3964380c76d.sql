-- Insert default company config if not exists
INSERT INTO public.company_config (
  name,
  voice_tone,
  system_prompt,
  brand_colors
) 
SELECT
  'Retorna',
  'Profesional pero cercano, innovador en fintech',
  'Eres CEREBRO AI, el asistente inteligente de Retorna. Tu personalidad es profesional pero cercana, innovadora y orientada a resultados. Hablas en español de manera natural y conversacional. Siempre mantén un tono optimista y proactivo.',
  '{"primary": "#7C3AED", "secondary": "#A855F7", "accent": "#10B981"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.company_config);