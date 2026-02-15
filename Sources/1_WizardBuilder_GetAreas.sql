-- ============================================================================
-- Integration Source #1: WizardBuilder_GetAreas
-- ============================================================================
-- Etrieve Source Settings:
--   Name:       WizardBuilder_GetAreas
--   Method:     GET
--   Parameters: (none)
--
-- Purpose: Populates the area/folder picker in Step 1
-- Returns all content areas (catalogs) in the system.
-- ============================================================================

SELECT
    CatalogID       AS id,
    [Name]          AS name
FROM [dbo].[Catalog]
ORDER BY [Name]
