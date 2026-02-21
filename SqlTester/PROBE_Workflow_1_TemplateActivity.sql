-- Probe 1: Find which form templates have workflow activity
-- No parameters needed. Shows top 20 by volume.
SELECT TOP 20
    pd.SourceTypeCode,
    COUNT(*) AS docCount
FROM reporting.central_flow_PackageDocument pd
GROUP BY pd.SourceTypeCode
ORDER BY COUNT(*) DESC
