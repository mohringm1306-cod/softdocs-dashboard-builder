-- ============================================================================
-- Integration Source #2: WizardBuilder_GetDocTypes
-- ============================================================================
-- Etrieve Source Settings:
--   Name:       WizardBuilder_GetDocTypes
--   Method:     GET
--   Parameters: @CatalogID (INT) - from selected area
--
-- Purpose: Populates the document type checkboxes in Step 2 (content mode)
-- ============================================================================

SELECT
    dt.DocumentTypeID   AS id,
    dt.[Name]           AS name,
    dt.[Name]           AS code
FROM [dbo].[DocumentType] dt
INNER JOIN [dbo].[CatalogDocumentType] cdt
    ON dt.DocumentTypeID = cdt.DocumentTypeID
WHERE cdt.CatalogID = @CatalogID
ORDER BY dt.[Name]
