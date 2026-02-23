/**
 * Dashboard Builder Wizard 3.0 - Etrieve Integration Configuration
 *
 * These integration source names must match the sources you create in:
 *   Etrieve Central → Admin Settings → Sources
 *
 * Each source connects to a SQL query via your Hybrid Server connection.
 * After creating each source, connect it to this form under:
 *   Form Settings → Connect → Available Sources → Check "Get"
 *
 * All queries are SELECT-only (read-only). No data is modified.
 */

// ============================================================================
// INTEGRATION 1: Get Areas/Catalogs
// ============================================================================
// Step: "Select Folder" — populates the area picker
// Parameter: (none)
//
// SQL:
//   SELECT
//       CatalogID AS id,
//       [Name] AS name
//   FROM [dbo].[Catalog]
//   ORDER BY [Name]
//
var areasIntegrationName = 'WizardBuilder_GetAreas';

// ============================================================================
// INTEGRATION 2: Get Document Types for an Area
// ============================================================================
// Step: "Select Document Types" — populates the doc type checkboxes
// Parameter: @CatalogID (from selected area)
//
// SQL:
//   SELECT
//       dt.DocumentTypeID AS id,
//       dt.[Name] AS name,
//       dt.[Name] AS code
//   FROM [dbo].[DocumentType] dt
//   INNER JOIN [dbo].[CatalogDocumentType] cdt
//       ON dt.DocumentTypeID = cdt.DocumentTypeID
//   WHERE cdt.CatalogID = @CatalogID
//   ORDER BY dt.[Name]
//
var docTypesIntegrationName = 'WizardBuilder_GetDocTypes';

// ============================================================================
// INTEGRATION 3: Get Key Fields for an Area
// ============================================================================
// Step: "Select Columns" (content mode) — populates the field checkboxes
// Parameter: @CatalogID (from selected area)
//
// The 'type' column is critical: the wizard uses it to decide between
// ivDocumentTextFieldValue (type='text') and ivDocumentDateFieldValue
// (type='date') JOINs in the generated dashboard SQL.
//
// Schema chain: Catalog -> CatalogDocumentType -> DocumentTypeField -> Field -> DataType
// JOINs to DataType lookup table to determine text vs date fields.
//
// SQL:
//   SELECT DISTINCT
//       f.FieldID AS id,
//       f.[Name] AS name,
//       CASE
//           WHEN dt.[Name] = 'Date' THEN 'date'
//           ELSE 'text'
//       END AS type,
//       f.[Name] AS alias
//   FROM [dbo].[Field] f
//   INNER JOIN [dbo].[DataType] dt
//       ON f.DataTypeID = dt.DataTypeID
//   INNER JOIN [dbo].[DocumentTypeField] dtf
//       ON f.FieldID = dtf.FieldID
//   INNER JOIN [dbo].[CatalogDocumentType] cdt
//       ON dtf.DocumentTypeID = cdt.DocumentTypeID
//   WHERE cdt.CatalogID = @CatalogID
//   ORDER BY f.[Name]
//
var keyFieldsIntegrationName = 'WizardBuilder_GetKeyFields';

// ============================================================================
// INTEGRATION 4: Get Form Templates
// ============================================================================
// Step: "Select Form" — populates the form template picker
// Parameter: (none)
//
// Returns TemplateVersionID as 'id' (used for form input queries)
// and TemplateID as 'templateId' (used for workflow step queries).
//
// SQL:
//   SELECT
//       tv.TemplateVersionID AS id,
//       t.[Name] AS name,
//       t.TemplateID AS templateId
//   FROM reporting.central_forms_Template t
//   INNER JOIN reporting.central_forms_TemplateVersion tv
//       ON t.TemplateID = tv.TemplateID
//   WHERE tv.IsPublished = 1
//   ORDER BY t.[Name]
//
var formTemplatesIntegrationName = 'WizardBuilder_GetFormTemplates';

// ============================================================================
// INTEGRATION 5: Get Form Input Fields
// ============================================================================
// Step: "Select Columns" (forms mode) — populates the field checkboxes
// Parameter: @TemplateVersionID (from selected template's id)
//
// Discovers actual InputIDs from submitted form data (IsDraft=0).
// Each InputID becomes a CASE/MAX pivot column in the generated SQL.
//
// SQL:
//   SELECT DISTINCT
//       iv.InputID AS id,
//       iv.InputID AS label
//   FROM reporting.central_forms_InputValue iv
//   INNER JOIN reporting.central_forms_Form f
//       ON iv.FormID = f.FormID
//   WHERE f.TemplateVersionID = @TemplateVersionID
//       AND f.IsDraft = 0
//   ORDER BY iv.InputID
//
var formInputsIntegrationName = 'WizardBuilder_GetFormInputs';

// ============================================================================
// INTEGRATION 6: Get Workflow Steps for a Form Template
// ============================================================================
// Step: "Select Workflow Steps" -- populates the workflow step checkboxes
// Parameter: @TemplateID (from selected template's templateId)
//
// Chain: Template -> TemplateVersion.Code -> PackageDocument.SourceTypeCode
//        -> Package.PackageId -> Package.ProcessID -> ProcessStep
// Uses Package table (NOT TaskQueue) so ALL steps are returned regardless
// of whether forms are currently parked at that step.
// ProcessStepId (lowercase 'd'), NO StepOrder column.
//
// SQL (finds most-recent ProcessID via Package, returns ALL steps):
//   SELECT DISTINCT
//       ps.ProcessStepId AS id,
//       ps.[Name] AS name,
//       REPLACE(ps.[Name], '_', ' ') AS displayName
//   FROM reporting.central_flow_ProcessStep ps
//   WHERE ps.ProcessID = (
//       SELECT TOP 1 pkg.ProcessID
//       FROM reporting.central_forms_TemplateVersion tv
//       INNER JOIN reporting.central_flow_PackageDocument pd
//           ON pd.SourceTypeCode = tv.Code
//       INNER JOIN reporting.central_flow_Package pkg
//           ON pd.PackageID = pkg.PackageId
//       WHERE tv.TemplateID = @TemplateID
//       ORDER BY pkg.CreateDate DESC
//   )
//       AND ps.IsDeleted = 0
//   ORDER BY ps.[Name]
//
var workflowStepsIntegrationName = 'WizardBuilder_GetWorkflowSteps';
