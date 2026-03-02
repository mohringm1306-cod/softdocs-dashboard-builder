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
-- NOTE: The 'type' column is critical. The wizard uses it to decide which
--       ivDocument*FieldValue view to JOIN in the generated dashboard SQL.
--       Mapping: text → ivDocumentTextFieldValue (.Text)
--                date → ivDocumentDateFieldValue (.Date)
--                number → ivDocumentNumberFieldValue (.Number)
--                decimal → ivDocumentDecimalFieldValue (.Decimal)
--                party → DocumentFieldPartyVersion + PartyVersion (.name)
--       PartyTypeID check takes priority: party fields (like "Student Info")
--       store data via the Party system, not in FieldValue at all.
--
-- IMPORTANT: The partyTypeId column (f.PartyTypeID) is returned as a raw value
--            so the wizard JS can auto-detect party fields even if the CASE
--            statement is missing or outdated.  If partyTypeId is NOT NULL the
--            wizard overrides the type to 'party' client-side (v3.3.3+).
-- ============================================================================

SELECT DISTINCT
    f.FieldID           AS id,
    f.[Name]            AS name,
    CASE
        WHEN f.PartyTypeID IS NOT NULL          THEN 'party'
        WHEN dt.[Name] = 'Date'                 THEN 'date'
        WHEN dt.[Name] = 'Number'               THEN 'number'
        WHEN dt.[Name] IN ('Money', 'Decimal')  THEN 'decimal'
        ELSE 'text'  -- Text + Lookup (simple dropdown values stored as text)
    END                 AS type,
    f.[Name]            AS alias,
    f.PartyTypeID       AS partyTypeId
FROM [dbo].[Field] f
INNER JOIN [dbo].[DataType] dt
    ON f.DataTypeID = dt.DataTypeID
INNER JOIN [dbo].[DocumentTypeField] dtf
    ON f.FieldID = dtf.FieldID
INNER JOIN [dbo].[CatalogDocumentType] cdt
    ON dtf.DocumentTypeID = cdt.DocumentTypeID
WHERE cdt.CatalogID = @CatalogID
ORDER BY f.[Name]
