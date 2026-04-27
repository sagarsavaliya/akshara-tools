CREATE VIEW IF NOT EXISTS tool_ratings_view AS
SELECT
  r.tool_id,
  COUNT(*) AS total_reviews,
  ROUND(AVG(r.rating), 2) AS average_rating
FROM reviews r
WHERE r.status = 'published'
GROUP BY r.tool_id;
