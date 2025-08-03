-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  personal_info JSONB DEFAULT '{
    "age": 0,
    "gender": "male",
    "height": 0,
    "current_weight": 0,
    "target_weight": 0,
    "activity_level": "moderate"
  }'::jsonb,
  goals JSONB DEFAULT '{
    "primary": "weightLoss",
    "timeline": 12,
    "weekly_weight_loss_target": 0.5
  }'::jsonb,
  preferences JSONB DEFAULT '{
    "dietary_restrictions": [],
    "disliked_foods": [],
    "preferred_meal_times": [],
    "fasting_experience": "beginner"
  }'::jsonb,
  subscription JSONB DEFAULT '{
    "tier": "free",
    "features": []
  }'::jsonb,
  is_onboarded BOOLEAN DEFAULT FALSE
);

-- Create macro_targets table
CREATE TABLE macro_targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  calories INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create food_entries table
CREATE TABLE food_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL NOT NULL,
  serving_unit TEXT NOT NULL,
  macros JSONB NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fasting_sessions table
CREATE TABLE fasting_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  planned_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  protocol TEXT NOT NULL CHECK (protocol IN ('16:8', '18:6', 'OMAD', 'custom')),
  current_stage TEXT DEFAULT 'digestion' CHECK (current_stage IN ('digestion', 'fatBurning', 'ketosis', 'autophagy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_food_entries_user_id_logged_at ON food_entries(user_id, logged_at DESC);
CREATE INDEX idx_fasting_sessions_user_id_start_time ON fasting_sessions(user_id, start_time DESC);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_macro_targets_updated_at BEFORE UPDATE ON macro_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fasting_sessions_updated_at BEFORE UPDATE ON fasting_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Macro targets: Users can only access their own macro targets
CREATE POLICY "Users can view own macro targets" ON macro_targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own macro targets" ON macro_targets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own macro targets" ON macro_targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own macro targets" ON macro_targets FOR DELETE USING (auth.uid() = user_id);

-- Food entries: Users can only access their own food entries
CREATE POLICY "Users can view own food entries" ON food_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food entries" ON food_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food entries" ON food_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food entries" ON food_entries FOR DELETE USING (auth.uid() = user_id);

-- Fasting sessions: Users can only access their own fasting sessions
CREATE POLICY "Users can view own fasting sessions" ON fasting_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fasting sessions" ON fasting_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fasting sessions" ON fasting_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fasting sessions" ON fasting_sessions FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();