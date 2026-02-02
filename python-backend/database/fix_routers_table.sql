-- ============================================
-- Fix Routers Table for Credentials System
-- Make username/password nullable since we use credentials table
-- ============================================

-- Make username and password nullable
ALTER TABLE routers ALTER COLUMN username DROP NOT NULL;
ALTER TABLE routers ALTER COLUMN password DROP NOT NULL;

-- Verify changes
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'routers' 
  AND column_name IN ('username', 'password', 'credential_id')
ORDER BY column_name;

-- Show message
DO $$
BEGIN
    RAISE NOTICE 'Routers table fixed! username and password are now nullable.';
    RAISE NOTICE 'You can now use centralized credentials system.';
END $$;
