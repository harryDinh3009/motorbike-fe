-- Migration: Populate brand_id and base prices for car_model
-- Date: 2025-12-18
-- Description: Populate data cho các columns mới trong car_model

USE motorbike_be;

-- Step 1: Populate brand_id từ brand table
UPDATE car_model cm
JOIN brand b ON LOWER(TRIM(cm.brand)) = LOWER(TRIM(b.name))
SET cm.brand_id = b.id
WHERE cm.brand IS NOT NULL AND cm.brand != '' AND cm.brand_id IS NULL;

-- Step 2: Set default base prices cho các model chưa có
UPDATE car_model SET
    base_daily_price = CASE
        WHEN LOWER(name) LIKE '%honda%' THEN 150000
        WHEN LOWER(name) LIKE '%yamaha%' THEN 140000
        WHEN LOWER(name) LIKE '%suzuki%' THEN 160000
        WHEN LOWER(name) LIKE '%kawasaki%' THEN 180000
        WHEN LOWER(name) LIKE '%ducati%' THEN 200000
        ELSE 130000  -- Default fallback
    END,
    base_hourly_price = CASE
        WHEN LOWER(name) LIKE '%honda%' THEN 20000
        WHEN LOWER(name) LIKE '%yamaha%' THEN 18000
        WHEN LOWER(name) LIKE '%suzuki%' THEN 22000
        WHEN LOWER(name) LIKE '%kawasaki%' THEN 25000
        WHEN LOWER(name) LIKE '%ducati%' THEN 30000
        ELSE 17000  -- Default fallback
    END
WHERE base_daily_price IS NULL;

-- Step 3: Verify data
SELECT
    'Migration Summary:' as info,
    COUNT(*) as total_models,
    COUNT(brand_id) as models_with_brand_id,
    COUNT(base_daily_price) as models_with_base_prices
FROM car_model

UNION ALL

SELECT
    'Sample Data:' as info,
    cm.name,
    b.name as brand_name,
    cm.base_daily_price,
    cm.base_hourly_price
FROM car_model cm
LEFT JOIN brand b ON cm.brand_id = b.id
ORDER BY cm.name
LIMIT 5;
