
-- Create table for storing conversation analytics
CREATE TABLE public.conversation_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID,
  user_id UUID REFERENCES auth.users,
  conversation_type VARCHAR(50) NOT NULL, -- 'support', 'onboarding', 'retention', 'complaint'
  issue_category VARCHAR(100) NOT NULL, -- 'transfer_delay', 'kyc_issues', 'fees_complaint', etc.
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  priority_level VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  user_type VARCHAR(30) NOT NULL, -- 'new_customer', 'returning_customer', 'high_value_customer'
  resolution_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'escalated'
  suggested_improvement TEXT,
  affected_journey_stage VARCHAR(50), -- 'registration', 'kyc', 'first_transfer', 'repeat_transfer'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for churn prediction data (remittance industry specific)
CREATE TABLE public.churn_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  churn_probability DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
  risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  key_factors JSONB NOT NULL, -- Array of factors contributing to churn
  days_since_last_transfer INTEGER,
  total_transfers INTEGER DEFAULT 0,
  total_volume_sent DECIMAL(12,2) DEFAULT 0,
  avg_transfer_amount DECIMAL(10,2) DEFAULT 0,
  kyc_completion_status VARCHAR(30),
  support_tickets_count INTEGER DEFAULT 0,
  last_complaint_date TIMESTAMP WITH TIME ZONE,
  predicted_churn_date TIMESTAMP WITH TIME ZONE,
  intervention_suggested TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for improvement suggestions tracking
CREATE TABLE public.improvement_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'product', 'ux', 'fees', 'speed', 'support'
  frequency_count INTEGER NOT NULL DEFAULT 1,
  first_mentioned TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_mentioned TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  priority_score INTEGER NOT NULL DEFAULT 50, -- 1-100
  impact_area VARCHAR(50) NOT NULL, -- 'conversion', 'retention', 'satisfaction', 'ops_efficiency'
  implementation_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
  estimated_impact JSONB, -- { conversion_lift: 0.05, retention_improvement: 0.10 }
  department_owner VARCHAR(30), -- 'product', 'growth', 'cs', 'ops'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies for conversation_analytics
CREATE POLICY "Users can view conversation analytics" 
  ON public.conversation_analytics 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage conversation analytics" 
  ON public.conversation_analytics 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role_system = 'admin' OR profiles.role_system = 'super_admin')
    )
  );

-- Policies for churn_predictions
CREATE POLICY "Users can view churn predictions" 
  ON public.churn_predictions 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage churn predictions" 
  ON public.churn_predictions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role_system = 'admin' OR profiles.role_system = 'super_admin')
    )
  );

-- Policies for improvement_suggestions
CREATE POLICY "Users can view improvement suggestions" 
  ON public.improvement_suggestions 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage improvement suggestions" 
  ON public.improvement_suggestions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role_system = 'admin' OR profiles.role_system = 'super_admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_conversation_analytics_created_at ON public.conversation_analytics(created_at);
CREATE INDEX idx_conversation_analytics_issue_category ON public.conversation_analytics(issue_category);
CREATE INDEX idx_conversation_analytics_user_type ON public.conversation_analytics(user_type);
CREATE INDEX idx_churn_predictions_risk_level ON public.churn_predictions(risk_level);
CREATE INDEX idx_churn_predictions_updated_at ON public.churn_predictions(updated_at);
CREATE INDEX idx_improvement_suggestions_priority_score ON public.improvement_suggestions(priority_score DESC);
CREATE INDEX idx_improvement_suggestions_frequency_count ON public.improvement_suggestions(frequency_count DESC);
