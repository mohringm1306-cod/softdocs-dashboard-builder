-- ============================================================================
-- Integration Source #3: WizardBuilder_GetKeyFields
-- ============================================================================
-- Etrieve Source Settings:
--   Name:       WizardBuilder_GetKeyFields
--   Method:     GET
--   Parameters: @CatalogID (INT) - from selected area
--
-- Purpose: Populates the column/field checkboxes in Step 3 (content mode)
--
-- Schema chain: Catalog -> CatalogDocumentType -> DocumentTypeField -> Field
-- JOINs to DataType table to determine text vs date fields.
-- Returns all unique fields across all document types in the selected area.
--
-- NOTE: The 'type' column is critical. The wizard uses it to decide between
--       ivDocumentTextFieldValue (type='text') and ivDocumentDateFieldValue
--       (type='date') JOINs in the generated dashboard SQL.
-- ============================================================================

SELECT DISTINCT
    f.FieldID           AS id,
    f.[Name]            AS name,
    CASE
        WHEN dt.[Name] = 'Date' THEN 'date'
        ELSE 'text'
    END                 AS type,
    f.[Name]            AS alias
FROM [dbo].[Field] f
INNER JOIN [dbo].[DataType] dt
    ON f.DataTypeID = dt.DataTypeID
INNER JOIN [dbo].[DocumentTypeField] dtf
    ON f.FieldID = dtf.FieldID
INNER JOIN [dbo].[CatalogDocumentType] cdt
    ON dtf.DocumentTypeID = cdt.DocumentTypeID
WHERE cdt.CatalogID = @CatalogID
ORDER BY f.[Name]
