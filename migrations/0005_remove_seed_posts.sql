-- Maniac Garage D1 migration
-- Removes temporary seed posts used during the public posts API smoke test.
-- Real posts should be created through the write flow and stored in D1.

DELETE FROM comments
WHERE post_id IN (
  'post_motorcycle_showcase_1',
  'post_motorcycle_maintenance_1',
  'post_motorcycle_parts_1'
);

DELETE FROM posts
WHERE id IN (
  'post_motorcycle_showcase_1',
  'post_motorcycle_maintenance_1',
  'post_motorcycle_parts_1'
);
