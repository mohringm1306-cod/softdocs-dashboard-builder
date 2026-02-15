-- PROBE 2: Does the reporting schema exist?
-- Create source: WizardBuilder_Probe2
-- Method: GET, Parameters: (none)
-- Expected: Returns form templates if reporting views are accessible

SELECT TOP 5 TemplateID AS id, [Name] AS name FROM reporting.central_forms_Template ORDER BY [Name]
