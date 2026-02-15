-- PROBE 3: Does the TemplateVersion table exist and can we join?
-- Create source: WizardBuilder_Probe3
-- Method: GET, Parameters: (none)
-- Expected: Returns active template versions

SELECT TOP 5
    tv.TemplateVersionID AS id,
    tv.TemplateID AS templateId,
    tv.IsActive AS active
FROM reporting.central_forms_TemplateVersion tv
WHERE tv.IsActive = 1
