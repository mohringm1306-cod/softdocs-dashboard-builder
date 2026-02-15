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
--   We link Template -> TemplateVersion (to get Code) -> PackageDocument
--   (SourceTypeCode matches Code) -> TaskQueue -> ProcessStep.
-- ============================================================================

SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
INNER JOIN reporting.central_flow_TaskQueue tq
    ON tq.ProcessStepID = ps.ProcessStepId
INNER JOIN reporting.central_flow_PackageDocument pd
    ON tq.PackageId = pd.PackageID
INNER JOIN reporting.central_forms_TemplateVersion tv
    ON pd.SourceTypeCode = tv.Code
WHERE tv.TemplateID = @TemplateID
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
