-- ============================================================================
-- Integration Source #6: WizardBuilder_GetWorkflowSteps
-- ============================================================================
-- Etrieve Source Settings:
--   Name:       WizardBuilder_GetWorkflowSteps
--   Method:     GET
--   Parameters: @TemplateID (INT) - from selected template's templateId
--
-- Purpose: Populates the workflow step checkboxes in Step 4 (forms mode)
--
-- SCHEMA NOTES (verified 2026-02-13):
--   Process has NO TemplateID column. The link from form template to workflow
--   goes through: TemplateVersion.Code -> PackageDocument.SourceTypeCode
--   -> PackageDocument.PackageID -> TaskQueue.PackageId -> ProcessStep.
--
--   ProcessStep uses "ProcessStepId" (lowercase 'd'), NOT "ProcessStepID".
--   ProcessStep has NO StepOrder column.
--
-- IMPORTANT: Previous version only returned steps with active TaskQueue
--   entries. This version first finds the ProcessID via any TaskQueue row
--   linked to this template, then returns ALL steps for that Process.
--   This ensures steps show up even if no form has reached them yet.
-- ============================================================================

SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID IN (
    -- Find the ProcessID(s) linked to this template via TaskQueue chain
    SELECT DISTINCT ps2.ProcessID
    FROM reporting.central_flow_ProcessStep ps2
    INNER JOIN reporting.central_flow_TaskQueue tq
        ON tq.ProcessStepID = ps2.ProcessStepId
    INNER JOIN reporting.central_flow_PackageDocument pd
        ON tq.PackageId = pd.PackageID
    INNER JOIN reporting.central_forms_TemplateVersion tv
        ON pd.SourceTypeCode = tv.Code
    WHERE tv.TemplateID = @TemplateID
)
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
