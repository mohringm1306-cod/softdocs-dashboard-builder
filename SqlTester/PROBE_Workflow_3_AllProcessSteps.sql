-- Probe 3: ALL steps in a process (including ones with no form activity)
-- Replace PROCESS_ID_HERE with a ProcessID from Probe 2
SELECT
    ps.ProcessStepId,
    ps.[Name]       AS StepName,
    ps.IsDeleted,
    ps.Code,
    ps.ActivityCode
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID = 'PROCESS_ID_HERE'
ORDER BY ps.[Name]
