-- Remove orphaned Mystery Houseguest entry that's causing duplication in draft form
DELETE FROM contestants 
WHERE id = '62233a23-42f4-4604-83ad-881e193df7ff' 
AND pool_id IS NULL 
AND name = 'Mystey Houseguest';