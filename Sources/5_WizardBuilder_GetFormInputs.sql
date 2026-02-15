-- ============================================================================
-- Integration Source #5: WizardBuilder_GetFormInputs
-- ============================================================================
-- Etrieve Source Settings:
--   Name:       WizardBuilder_GetFormInputs
--   Method:     GET
--   Parameters: @TemplateVersionID (INT) - from selected template's id
--
-- Purpose: Populates the field checkboxes in Step 3 (forms mode)
--
-- NOTE: Discovers actual InputIDs from submitted form data (IsDraft=0).
--       Each InputID becomes a CASE/MAX pivot column in the generated SQL.
--       InputID is the Etrieve field identifier (e.g. "FirstName", "Email").
-- ============================================================================

SELECT DISTINCT
    iv.InputID  AS id,
    iv.InputID  AS label
FROM reporting.central_forms_InputValue iv
INNER JOIN reporting.central_forms_Form f
    ON iv.FormID = f.FormID
WHERE f.TemplateVersionID = @TemplateVersionID
    AND f.IsDraft = 0
ORDER BY iv.InputID
