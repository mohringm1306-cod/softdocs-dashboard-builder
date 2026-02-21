-- Probe 2: Trace the full workflow chain for a specific template
-- Replace YOUR_CODE_HERE with a SourceTypeCode from Probe 1
SELECT DISTINCT
    ps.ProcessStepId,
    ps.[Name]       AS StepName,
    ps.IsDeleted,
    p.ProcessID,
    p.[Name]        AS ProcessName
FROM reporting.central_flow_PackageDocument pd
INNER JOIN reporting.central_flow_TaskQueue tq
    ON tq.PackageId = pd.PackageID
INNER JOIN reporting.central_flow_ProcessStep ps
    ON tq.ProcessStepID = ps.ProcessStepId
INNER JOIN reporting.central_flow_Process p
    ON ps.ProcessID = p.ProcessID
WHERE pd.SourceTypeCode = 'YOUR_CODE_HERE'
