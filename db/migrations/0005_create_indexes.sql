CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_session_expires_at ON auth_sessions (session_expires_at);
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON reviews (tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_review_id ON helpful_votes (review_id);
