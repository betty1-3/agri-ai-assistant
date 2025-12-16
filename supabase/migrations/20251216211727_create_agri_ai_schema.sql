/*
  # AGRI AI Database Schema

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `user_id` (text) - Anonymous user identifier (browser fingerprint)
      - `location` (jsonb) - GPS coordinates and region data
      - `language` (text) - Selected/detected language
      - `status` (text) - Session status: active, completed, abandoned
      - `created_at` (timestamptz) - Session start time
      - `updated_at` (timestamptz) - Last activity time
    
    - `agricultural_data`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - Links to chat_sessions
      - `crop_type` (text) - Type of crop to grow
      - `land_size_hectares` (numeric) - Land size in hectares
      - `start_date` (date) - Cultivation start date
      - `location` (jsonb) - GPS and region data
      - `language` (text) - User's language
      - `created_at` (timestamptz) - Data collection timestamp
    
    - `ml_predictions`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - Links to chat_sessions
      - `agricultural_data_id` (uuid, foreign key) - Links to agricultural_data
      - `prediction_result` (jsonb) - ML model output
      - `created_at` (timestamptz) - Prediction timestamp
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - Links to chat_sessions
      - `role` (text) - 'system' or 'user'
      - `message` (text) - Chat message content
      - `step_number` (integer) - Position in chatflow
      - `created_at` (timestamptz) - Message timestamp

  2. Security
    - Enable RLS on all tables
    - Public read/write policies for anonymous users (chatbot is public)
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  location jsonb DEFAULT '{}'::jsonb,
  language text DEFAULT 'en',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agricultural_data table
CREATE TABLE IF NOT EXISTS agricultural_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  crop_type text NOT NULL,
  land_size_hectares numeric NOT NULL,
  start_date date NOT NULL,
  location jsonb DEFAULT '{}'::jsonb,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Create ml_predictions table
CREATE TABLE IF NOT EXISTS ml_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  agricultural_data_id uuid REFERENCES agricultural_data(id) ON DELETE CASCADE,
  prediction_result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  message text NOT NULL,
  step_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agricultural_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public policies for anonymous chatbot access
CREATE POLICY "Anyone can create chat sessions"
  ON chat_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own sessions"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their own sessions"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert agricultural data"
  ON agricultural_data FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read agricultural data"
  ON agricultural_data FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert ML predictions"
  ON ml_predictions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read ML predictions"
  ON ml_predictions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agricultural_data_session_id ON agricultural_data(session_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_session_id ON ml_predictions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_step_number ON chat_messages(step_number);