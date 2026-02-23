-- Probe 4: Check if Package table has ProcessID (bypasses TaskQueue)
-- Replace YOUR_CODE_HERE with a SourceTypeCode from your form
-- If this returns results with ProcessID, we can find ALL workflow steps
-- without depending on TaskQueue (which only has actively-routed forms)
SELECT TOP 10
    pd.PackageID,
    pd.SourceTypeCode,
    pkg.*
FROM reporting.central_flow_PackageDocument pd
INNER JOIN reporting.central_flow_Package pkg
    ON pd.PackageID = pkg.PackageID
WHERE pd.SourceTypeCode = 'YOUR_CODE_HERE'
