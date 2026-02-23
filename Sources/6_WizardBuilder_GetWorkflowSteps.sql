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
-- SCHEMA NOTES (verified 2026-02-23):
--   Process has NO TemplateID column. The link from form template to workflow
--   goes through: TemplateVersion.Code -> PackageDocument.SourceTypeCode
--   -> PackageDocument.PackageID -> Package.PackageId -> Package.ProcessID
--
--   ProcessStepId uses lowercase 'd'. ProcessStep has NO StepOrder column.
--
-- APPROACH: Find the ProcessID via the Package table (NOT TaskQueue).
--   A template may have packages linked to multiple Process versions
--   (e.g. "IT Equipment Review" and "IT Equipment Review v2"), so we
--   pick the Process with the most recent package activity (TOP 1 by
--   CreateDate DESC). Then return ALL non-deleted steps for that Process.
--
--   Previous approach used TaskQueue, which only found steps that had
--   forms actively parked there. This version finds ALL steps regardless
--   of current form activity.
-- ============================================================================

SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID = (
    SELECT TOP 1 pkg.ProcessID
    FROM reporting.central_forms_TemplateVersion tv
    INNER JOIN reporting.central_flow_PackageDocument pd
        ON pd.SourceTypeCode = tv.Code
    INNER JOIN reporting.central_flow_Package pkg
        ON pd.PackageID = pkg.PackageId
    WHERE tv.TemplateID = @TemplateID
    ORDER BY pkg.CreateDate DESC
)
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
