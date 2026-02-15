# Dashboard Builder Wizard 3.0 — Installation Guide

## Prerequisites

- Etrieve Central (on-prem or cloud) with admin access
- Hybrid Server configured and connected to your SQL Server
- The `reporting` schema must exist (Etrieve creates this automatically)

## Database Notes

Sources 1-3 query Content DB tables (`[dbo].*`):
- `dbo.Catalog`, `dbo.CatalogDocumentType`, `dbo.DocumentType`
- `dbo.Field`, `dbo.DataType`, `dbo.DocumentTypeField`

Sources 4-6 query Central/Reporting DB tables (`reporting.*`):
- `reporting.central_forms_Template`, `reporting.central_forms_TemplateVersion`
- `reporting.central_forms_Form`, `reporting.central_forms_InputValue`
- `reporting.central_flow_Process`, `reporting.central_flow_ProcessStep`, `reporting.central_flow_TaskQueue`

**If Content and Central are separate databases**, you may need **two different Hybrid Server connections** — one for Sources 1-3 (Content) and one for Sources 4-6 (Central/Reporting).

---

## Package Contents

```
EtrieveDeploy/
    index.html              ← Form page (upload to Etrieve)
    wizard.css              ← Stylesheet (upload to Etrieve)
    viewmodel.js            ← Etrieve integration layer (upload to Etrieve)
    configuration.js        ← Source name mappings (upload to Etrieve)
    wizard-demo.js          ← Copy from parent folder (upload to Etrieve)
    wizard-generators.js    ← Copy from parent folder (upload to Etrieve)
    Sources/
        1_WizardBuilder_GetAreas.sql
        2_WizardBuilder_GetDocTypes.sql
        3_WizardBuilder_GetKeyFields.sql
        4_WizardBuilder_GetFormTemplates.sql
        5_WizardBuilder_GetFormInputs.sql
        6_WizardBuilder_GetWorkflowSteps.sql
```

---

## Step 1: Validate SQL Queries

Before creating anything in Etrieve, run each SQL file in SSMS against your Etrieve database to confirm they return data. Start with the two that have no parameters:

```
-- Open in SSMS, connected to your Etrieve DB:

-- Source 1 (no params - run as-is):
-- Should return your catalog/area list
1_WizardBuilder_GetAreas.sql

-- Source 4 (no params - run as-is):
-- Should return your form templates
4_WizardBuilder_GetFormTemplates.sql
```

For the parameterized queries, substitute a real value:

```sql
-- Source 2: Replace @CatalogID with an actual CatalogID from Source 1
-- e.g. if Source 1 returned CatalogID = 5 for "Financial Aid":
DECLARE @CatalogID INT = 5
-- Then run 2_WizardBuilder_GetDocTypes.sql

-- Source 3: Same @CatalogID
DECLARE @CatalogID INT = 5
-- Then run 3_WizardBuilder_GetKeyFields.sql

-- Source 5: Replace @TemplateVersionID with an actual ID from Source 4
DECLARE @TemplateVersionID INT = 12
-- Then run 5_WizardBuilder_GetFormInputs.sql

-- Source 6: Replace @TemplateID with the templateId column from Source 4
DECLARE @TemplateID INT = 8
-- Then run 6_WizardBuilder_GetWorkflowSteps.sql
```

If any query returns 0 rows, that's OK — it just means that area/template has no data yet. But at least one of each should return rows.

---

## Step 2: Create Integration Sources in Etrieve

Go to **Etrieve Central → Admin → Integration Sources** (or Admin Settings → Sources, depending on your version).

Create each source using the settings below. All queries are **SELECT-only** (read-only).

### Source 1: WizardBuilder_GetAreas

| Setting | Value |
|---------|-------|
| **Name** | `WizardBuilder_GetAreas` |
| **Connection** | Your Hybrid Server SQL connection |
| **Method** | GET |
| **Parameters** | (none) |
| **SQL** | Contents of `Sources/1_WizardBuilder_GetAreas.sql` |

### Source 2: WizardBuilder_GetDocTypes

| Setting | Value |
|---------|-------|
| **Name** | `WizardBuilder_GetDocTypes` |
| **Connection** | Your Hybrid Server SQL connection |
| **Method** | GET |
| **Parameters** | `@CatalogID` (Integer) |
| **SQL** | Contents of `Sources/2_WizardBuilder_GetDocTypes.sql` |

### Source 3: WizardBuilder_GetKeyFields

| Setting | Value |
|---------|-------|
| **Name** | `WizardBuilder_GetKeyFields` |
| **Connection** | Your Hybrid Server SQL connection |
| **Method** | GET |
| **Parameters** | `@CatalogID` (Integer) |
| **SQL** | Contents of `Sources/3_WizardBuilder_GetKeyFields.sql` |

### Source 4: WizardBuilder_GetFormTemplates

| Setting | Value |
|---------|-------|
| **Name** | `WizardBuilder_GetFormTemplates` |
| **Connection** | Your Hybrid Server SQL connection |
| **Method** | GET |
| **Parameters** | (none) |
| **SQL** | Contents of `Sources/4_WizardBuilder_GetFormTemplates.sql` |

### Source 5: WizardBuilder_GetFormInputs

| Setting | Value |
|---------|-------|
| **Name** | `WizardBuilder_GetFormInputs` |
| **Connection** | Your Hybrid Server SQL connection |
| **Method** | GET |
| **Parameters** | `@TemplateVersionID` (Integer) |
| **SQL** | Contents of `Sources/5_WizardBuilder_GetFormInputs.sql` |

### Source 6: WizardBuilder_GetWorkflowSteps

| Setting | Value |
|---------|-------|
| **Name** | `WizardBuilder_GetWorkflowSteps` |
| **Connection** | Your Hybrid Server SQL connection |
| **Method** | GET |
| **Parameters** | `@TemplateID` (Integer) |
| **SQL** | Contents of `Sources/6_WizardBuilder_GetWorkflowSteps.sql` |

---

## Step 3: Create the Wizard Form

1. Go to **Admin → Forms → Create New Form**
2. **Name**: `Dashboard Builder Wizard` (or whatever you prefer)
3. **Upload these 6 files** to the form:

| File | Where to get it |
|------|----------------|
| `index.html` | `EtrieveDeploy/index.html` |
| `wizard.css` | `EtrieveDeploy/wizard.css` |
| `viewmodel.js` | `EtrieveDeploy/viewmodel.js` |
| `configuration.js` | `EtrieveDeploy/configuration.js` |
| `wizard-demo.js` | `WebinarDemo/wizard-demo.js` (parent folder) |
| `wizard-generators.js` | `WebinarDemo/wizard-generators.js` (parent folder) |

---

## Step 4: Connect Sources to the Form

1. Open the form you just created
2. Go to **Connect** (or **Settings → Integration Sources**)
3. For each of the 6 sources:
   - Search for the source name (e.g. `WizardBuilder_GetAreas`)
   - Add it to the form
   - Check **"Get"** (read permission)

All 6 sources must be connected with GET enabled.

---

## Step 5: Test

1. Open the form in Etrieve
2. You should see the wizard with three mode cards: **Document Lookup**, **Form Tracker**, **Combined View**
3. The demo banner should NOT appear (it's hidden in Etrieve mode)

### Document Lookup test:
- Click **Document Lookup**
- Step 1: Your real catalog areas should appear
- Select an area → doc types should load
- Select doc types → key fields should load
- Continue through styles, swimlanes, and generate
- The generated SQL should reference your real table/field IDs

### Form Tracker test:
- Click **Form Tracker**
- Step 1: Your real form templates should appear
- Select a template → input fields and workflow steps should load
- Continue through to generate

### Download test:
- On the final step, click **Download**
- A file viewer should appear with 5 tabs: SQL, configuration.js, viewmodel.js, index.html, README.md
- Copy each file — these are the generated dashboard files ready to deploy as a new form

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Wizard loads but no areas appear | Source 1 not connected or "Get" not checked | Check form connections |
| Selecting an area does nothing | Sources 2 and 3 not connected | Add and enable both |
| No form templates in Form Tracker | Source 4 not connected | Add and enable it |
| No workflow steps after selecting a template | Source 6 not connected, or no Process row for that TemplateID | Check `reporting.central_flow_Process` for the TemplateID |
| Loading spinner never goes away | Integration call failing | Press F12, check Console tab for error |
| "Failed to load data" toast | Hybrid Server connection issue or SQL error | Check Hybrid Server logs |
| Blank page / nothing renders | File upload issue | Verify all 6 files are uploaded to the form |
| Console shows "integration is not defined" | viewmodel.js not loading as RequireJS module | Verify index.html is the form's main page |

---

## How It Works

The wizard runs entirely in the browser. The `viewmodel.js` acts as a bridge between Etrieve's integration API and the wizard's data layer:

1. **On form load**: Fetches areas (Source 1) and form templates (Source 4) in parallel
2. **Replaces SimulatedData**: Builds the same data structure the wizard expects, but with real data
3. **On-demand loading**: When you select an area, it fetches doc types (Source 2) and key fields (Source 3). When you select a template, it fetches input fields (Source 5) and workflow steps (Source 6)
4. **No modifications to core wizard**: `wizard-demo.js` and `wizard-generators.js` run unchanged — the viewmodel just feeds them real data

## Source Name Customization

If you need different source names, edit `configuration.js` — the variable names at the bottom of each section:

```javascript
var areasIntegrationName = 'WizardBuilder_GetAreas';          // Change this
var docTypesIntegrationName = 'WizardBuilder_GetDocTypes';    // Change this
var keyFieldsIntegrationName = 'WizardBuilder_GetKeyFields';  // Change this
// ... etc
```

The `viewmodel.js` reads these variable names at runtime, so changing them in `configuration.js` is all you need.
