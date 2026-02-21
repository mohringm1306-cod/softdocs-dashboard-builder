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
--   ProcessStepId uses lowercase 'd'. ProcessStep has NO StepOrder column.
--
-- APPROACH: Discover ALL ProcessIDs linked to this template by collecting
--   every ProcessStep that any TaskQueue entry points to for any package
--   associated with this template. Then return ALL non-deleted steps for
--   those Processes — even steps that have never had a form routed to them.
--
-- NOTE: If this returns only one step but you expect more, the workflow
--   at your site may use multiple linked Processes. Check whether ALL
--   forms from this template appear in PackageDocument/TaskQueue.
-- ============================================================================

SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID IN (
    -- Find ALL ProcessIDs linked to this template via the full chain:
    -- TemplateVersion.Code → PackageDocument.SourceTypeCode → TaskQueue → ProcessStep
    SELECT DISTINCT ps2.ProcessID
    FROM reporting.central_forms_TemplateVersion tv
    INNER JOIN reporting.central_flow_PackageDocument pd
        ON pd.SourceTypeCode = tv.Code
    INNER JOIN reporting.central_flow_TaskQueue tq
        ON tq.PackageId = pd.PackageID
    INNER JOIN reporting.central_flow_ProcessStep ps2
        ON tq.ProcessStepID = ps2.ProcessStepId
    WHERE tv.TemplateID = @TemplateID
)
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
