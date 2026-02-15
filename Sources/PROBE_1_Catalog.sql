-- PROBE 1: Simplest possible query — does [dbo].[Catalog] exist?
-- Create source: WizardBuilder_Probe1
-- Method: GET, Parameters: (none)
-- Expected: Returns catalog areas if Content DB is accessible

SELECT TOP 5 CatalogID AS id, [Name] AS name FROM [dbo].[Catalog] ORDER BY [Name]
