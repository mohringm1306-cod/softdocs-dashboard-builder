-- PROBE 4: The actual join from Source 4 — Template + TemplateVersion
-- Create source: WizardBuilder_Probe4
-- Method: GET, Parameters: (none)
-- This is the exact query from WizardBuilder_GetFormTemplates but with TOP 5

SELECT TOP 5
    tv.TemplateVersionID    AS id,
    t.[Name]                AS name,
    t.TemplateID            AS templateId
FROM reporting.central_forms_Template t
INNER JOIN reporting.central_forms_TemplateVersion tv
    ON t.TemplateID = tv.TemplateID
WHERE tv.IsActive = 1
ORDER BY t.[Name]
