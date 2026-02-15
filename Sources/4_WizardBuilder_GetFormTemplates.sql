-- ============================================================================
-- Integration Source #4: WizardBuilder_GetFormTemplates
-- ============================================================================
-- Etrieve Source Settings:
--   Name:       WizardBuilder_GetFormTemplates
--   Method:     GET
--   Parameters: (none)
--
-- Purpose: Populates the form template picker in Step 1 (forms mode)
--
-- NOTE: Returns TemplateVersionID as 'id' (used for input field queries)
--       and TemplateID as 'templateId' (used for workflow step queries).
--       Both are needed because forms reference TemplateVersion but
--       workflows reference the parent Template.
-- ============================================================================

SELECT
    tv.TemplateVersionID    AS id,
    t.[Name]                AS name,
    t.TemplateID            AS templateId
FROM reporting.central_forms_Template t
INNER JOIN reporting.central_forms_TemplateVersion tv
    ON t.TemplateID = tv.TemplateID
WHERE tv.IsPublished = 1
ORDER BY t.[Name]
