# Installation Guide

This guide walks you through setting up the Dashboard Builder Wizard in Etrieve. You'll create some data sources, upload the wizard files, and connect them together.

---

## Step 1: Create the Data Sources

Go to **Etrieve Central > Admin > Sources** and create 6 new database sources. For each one:

- Set the **Type** to Database
- Set the **Method** to GET
- Pick your **Hybrid Server connection**
- Paste in the SQL from below
- Add any **parameters** listed

After creating each source, go to its **Permissions** tab and give your users **Get** access. (If you skip this, the wizard will get "403 Forbidden" errors.)

---

### Source 1: `WizardBuilder_GetAreas`

No parameters needed. This pulls in your list of content areas.

```sql
SELECT
    CatalogID       AS id,
    [Name]          AS name
FROM [dbo].[Catalog]
ORDER BY [Name]
```

---

### Source 2: `WizardBuilder_GetDocTypes`

**Add parameter:** `@CatalogID` (Integer)

When someone picks an area, this loads the document types for that area.

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

**Add parameter:** `@CatalogID` (Integer)

Loads the available fields (columns) for the selected area.

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

No parameters needed. This pulls in your list of published form templates.

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

---

### Source 5: `WizardBuilder_GetFormInputs`

**Add parameter:** `@TemplateVersionID` (Integer)

When someone picks a form template, this loads the input fields from that form.

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

**Add parameter:** `@TemplateID` (Integer)

Loads the workflow steps for the selected form's process.

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

---

## Step 2: Upload the Wizard Files

1. Go to **Admin > Forms > Create New Form**
2. Name it whatever you like (e.g., "Dashboard Builder")
3. Upload these 6 files:
   - `index.html`
   - `wizard.css`
   - `wizard-demo.js`
   - `wizard-generators.js`
   - `viewmodel.js`
   - `configuration.js`

---

## Step 3: Connect the Sources

1. Open the form you just created
2. Go to **Connect** (or Settings > Integration Sources)
3. Add each of the 6 sources you created in Step 1
4. Make sure **Get** is checked for each one

---

## Step 4: Open and Use

Open the form in Etrieve. You'll see three options:

- **Document Lookup** — build a dashboard for scanned documents
- **Form Tracker** — build a dashboard for form submissions
- **Combined View** — both in one dashboard

Pick one, choose your data, pick a style, configure it how you want, and download the finished dashboard. Upload those generated files as a new Etrieve form and you're done.

---

## Troubleshooting

| Problem | What to Do |
|---------|-----------|
| No areas or templates show up | Make sure all 6 sources are connected to the form with **Get** checked |
| 403 Forbidden errors | Go to each source's **Permissions** tab and grant Get access to your user group |
| Loading spinner won't stop | Press F12 in your browser and check the Console tab for error messages |
| Blank page | Make sure all 6 files were uploaded to the form |

---

## Changing Source Names

If you named your sources something different than `WizardBuilder_GetAreas`, etc., just update the names in `configuration.js` to match what you used in Etrieve.
