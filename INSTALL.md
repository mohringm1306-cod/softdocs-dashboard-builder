# Dashboard Builder Wizard 3.0 — Installation Guide

---

## Prerequisites

- Etrieve Central (on-prem or cloud) with admin access
- Hybrid Server configured and connected to your SQL Server
- The `reporting` schema must exist (Etrieve creates this automatically)

---

## Step 1: Create Integration Sources in Etrieve

Go to **Etrieve Central > Admin > Integration Sources** (or Admin Settings > Sources, depending on your version).

Create **6 database sources** using the SQL below. All queries are **SELECT-only** (read-only). For each source, set:
- **Type:** Database
- **Connection:** Your Hybrid Server SQL connection
- **Method:** GET

> **Database note:** Sources 1-3 query Content DB tables (`[dbo].*`). Sources 4-6 query Central/Reporting DB tables (`reporting.*`). If your Content and Central are **separate databases**, you may need two different Hybrid Server connections.

---

### Source 1: `WizardBuilder_GetAreas`

**Parameters:** (none)

Returns all content areas (catalogs) — populates the area picker in Step 1.

```sql
SELECT
    CatalogID       AS id,
    [Name]          AS name
FROM [dbo].[Catalog]
ORDER BY [Name]
```

---

### Source 2: `WizardBuilder_GetDocTypes`

**Parameters:** `@CatalogID` (Integer)

Returns document types for the selected area — populates the doc type checkboxes.

```sql
SELECT
    dt.DocumentTypeID   AS id,
    dt.[Name]           AS name,
    dt.[Name]           AS code
FROM [dbo].[DocumentType] dt
INNER JOIN [dbo].[CatalogDocumentType] cdt
    ON dt.DocumentTypeID = cdt.DocumentTypeID
WHERE cdt.CatalogID = @CatalogID
ORDER BY dt.[Name]
```

---

### Source 3: `WizardBuilder_GetKeyFields`

**Parameters:** `@CatalogID` (Integer)

Returns all unique fields across all doc types in the selected area, with data types. The `type` column is critical — the wizard uses it to decide between `ivDocumentTextFieldValue` and `ivDocumentDateFieldValue` JOINs in the generated dashboard SQL.

```sql
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
```

---

### Source 4: `WizardBuilder_GetFormTemplates`

**Parameters:** (none)

Returns all published form templates. Returns **both** `id` (TemplateVersionID, for input field queries) and `templateId` (TemplateID, for workflow step queries) — both are needed because forms reference TemplateVersion but workflows reference the parent Template.

```sql
SELECT
    tv.TemplateVersionID    AS id,
    t.[Name]                AS name,
    t.TemplateID            AS templateId
FROM reporting.central_forms_Template t
INNER JOIN reporting.central_forms_TemplateVersion tv
    ON t.TemplateID = tv.TemplateID
WHERE tv.IsPublished = 1
ORDER BY t.[Name]
```

> **Schema note:** The column is `IsPublished`, not `IsActive`.

---

### Source 5: `WizardBuilder_GetFormInputs`

**Parameters:** `@TemplateVersionID` (Integer) — from the selected template's `id` column

Returns the actual input field IDs from submitted form data. Each InputID becomes a CASE/MAX pivot column in the generated dashboard SQL.

```sql
SELECT DISTINCT
    iv.InputID  AS id,
    iv.InputID  AS label
FROM reporting.central_forms_InputValue iv
INNER JOIN reporting.central_forms_Form f
    ON iv.FormID = f.FormID
WHERE f.TemplateVersionID = @TemplateVersionID
    AND f.IsDraft = 0
ORDER BY iv.InputID
```

---

### Source 6: `WizardBuilder_GetWorkflowSteps`

**Parameters:** `@TemplateID` (Integer) — from the selected template's `templateId` column (not `id`)

Returns workflow steps for the selected template's process.

```sql
SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
INNER JOIN reporting.central_flow_TaskQueue tq
    ON tq.ProcessStepID = ps.ProcessStepId
INNER JOIN reporting.central_flow_PackageDocument pd
    ON tq.PackageId = pd.PackageID
INNER JOIN reporting.central_forms_TemplateVersion tv
    ON pd.SourceTypeCode = tv.Code
WHERE tv.TemplateID = @TemplateID
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
```

> **Schema notes:** Process has NO TemplateID column — the link goes through `TemplateVersion.Code` > `PackageDocument.SourceTypeCode`. ProcessStep uses lowercase `ProcessStepId` (not `ProcessStepID`). ProcessStep has NO StepOrder column.

---

### Permissions

For **each** of the 6 sources, click into **Permissions** and grant your user group **Get** access. If you skip this, dashboard calls will return **403 Forbidden**.

---

## Step 2: Validate Queries in SSMS (Recommended)

Before wiring everything up, run each query in SSMS to confirm they return data.

Start with the two that have **no parameters** — just copy/paste and run:
- Source 1 should return your catalog/area list
- Source 4 should return your form templates

For the **parameterized queries**, plug in a real value:

```sql
-- Source 2 & 3: Use a CatalogID from Source 1's results
DECLARE @CatalogID INT = 5  -- replace with an actual CatalogID
-- Then paste and run the Source 2 query, then Source 3

-- Source 5: Use a TemplateVersionID (the 'id' column from Source 4)
DECLARE @TemplateVersionID INT = 12  -- replace with a real id
-- Then paste and run the Source 5 query

-- Source 6: Use a TemplateID (the 'templateId' column from Source 4, NOT 'id')
DECLARE @TemplateID INT = 8  -- replace with a real templateId
-- Then paste and run the Source 6 query
```

If any query returns 0 rows, that's OK — it just means that area/template has no data yet. But at least one of each should return rows.

---

## Step 3: Upload Wizard Files

1. Go to **Admin > Forms > Create New Form**
2. Name it `Dashboard Builder Wizard` (or whatever you prefer)
3. Upload these **6 files** to the form:

| File | Description |
|------|-------------|
| `index.html` | Wizard page layout |
| `wizard.css` | Wizard stylesheet |
| `viewmodel.js` | Etrieve integration bridge — connects real data to the wizard |
| `configuration.js` | Integration source name mappings |
| `wizard-demo.js` | Wizard core logic (state management, UI, SQL generation) |
| `wizard-generators.js` | Dashboard style generators (12 styles) |

---

## Step 4: Connect Sources to the Form

1. Open the form you just created
2. Go to **Connect** (or **Settings > Integration Sources**)
3. For each of the 6 sources:
   - Search for the source name (e.g., `WizardBuilder_GetAreas`)
   - Add it to the form
   - Check **"Get"** (read permission)

All 6 sources must be connected with GET enabled.

---

## Step 5: Test

Open the form in Etrieve. You should see the wizard with three mode cards: **Document Lookup**, **Form Tracker**, **Combined View**.

### Document Lookup test:
1. Click **Document Lookup**
2. Step 1: Your real catalog areas should appear (from Source 1)
3. Select an area — doc types load (Source 2), key fields load (Source 3)
4. Continue through styles, swimlanes, and generate
5. The generated SQL should reference your real table/field IDs

### Form Tracker test:
1. Click **Form Tracker**
2. Step 1: Your real form templates should appear (from Source 4)
3. Select a template — input fields load (Source 5), workflow steps load (Source 6)
4. Continue through to generate

### Download test:
1. On the final step, click **Download**
2. A file viewer appears with tabs: SQL, configuration.js, viewmodel.js, index.html, README.md
3. Copy each file — these are the generated dashboard files ready to deploy as a new form

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Wizard loads but no areas appear | Source 1 not connected or "Get" not checked | Check form connections and permissions |
| Selecting an area does nothing | Sources 2 and 3 not connected | Add and enable both |
| No form templates in Form Tracker | Source 4 not connected | Add and enable it |
| No workflow steps after selecting template | Source 6 not connected, or no process for that template | Check `reporting.central_flow_PackageDocument` for matching SourceTypeCode |
| Loading spinner never goes away | Integration call failing | Press F12, check Console tab for errors |
| "Failed to load data" toast | Hybrid Server connection issue or SQL error | Check Hybrid Server logs |
| Blank page / nothing renders | File upload issue | Verify all 6 files are uploaded to the form |
| Console shows "integration is not defined" | viewmodel.js not loading | Verify index.html is the form's main page |
| 403 Forbidden on source calls | Missing permissions | Go to each source > Permissions > grant Get access |

---

## How It Works

The wizard runs entirely in the browser. `viewmodel.js` acts as a bridge between Etrieve's integration API and the wizard:

1. **On form load** — fetches areas (Source 1) and form templates (Source 4) in parallel
2. **Replaces simulated data** — builds the same data structure the wizard expects, but with real data
3. **On-demand loading** — selecting an area fetches doc types (Source 2) and key fields (Source 3); selecting a template fetches input fields (Source 5) and workflow steps (Source 6)
4. **No modifications to core wizard** — `wizard-demo.js` and `wizard-generators.js` run unchanged; the viewmodel just feeds them real data

---

## Source Name Customization

If you need different source names, edit `configuration.js`:

```javascript
var areasIntegrationName = 'WizardBuilder_GetAreas';
var docTypesIntegrationName = 'WizardBuilder_GetDocTypes';
var keyFieldsIntegrationName = 'WizardBuilder_GetKeyFields';
var formTemplatesIntegrationName = 'WizardBuilder_GetFormTemplates';
var formInputsIntegrationName = 'WizardBuilder_GetFormInputs';
var workflowStepsIntegrationName = 'WizardBuilder_GetWorkflowSteps';
```

The `viewmodel.js` reads these at runtime, so changing them in `configuration.js` is all you need.
