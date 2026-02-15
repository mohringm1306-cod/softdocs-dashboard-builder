# How to Set Up the Dashboard Builder

Three things to do: create the data sources, upload the files, and connect them. Takes about 15 minutes.

---

## Step 1: Create 6 Data Sources

Open **Etrieve Central**, go to **Admin > Sources**, and click **Add New Source**. You'll create 6 sources — one at a time. For each one, copy the name exactly, paste the SQL, and add any parameters listed.

> **Important:** After you create each source, click on its **Permissions** tab and give your users **Get** access. If you forget this step, the wizard won't be able to pull in any data.

---

**Source 1 — `WizardBuilder_GetAreas`**

No parameters. Just paste this SQL:

```sql
SELECT
    CatalogID       AS id,
    [Name]          AS name
FROM [dbo].[Catalog]
ORDER BY [Name]
```

---

**Source 2 — `WizardBuilder_GetDocTypes`**

Add one parameter: **@CatalogID** (Integer)

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

**Source 3 — `WizardBuilder_GetKeyFields`**

Add one parameter: **@CatalogID** (Integer)

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

**Source 4 — `WizardBuilder_GetFormTemplates`**

No parameters. Just paste this SQL:

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

**Source 5 — `WizardBuilder_GetFormInputs`**

Add one parameter: **@TemplateVersionID** (Integer)

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

**Source 6 — `WizardBuilder_GetWorkflowSteps`**

Add one parameter: **@TemplateID** (Integer)

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

1. Go to **Admin > Forms** and create a new form
2. Name it anything you want (e.g., "Dashboard Builder")
3. Upload all 6 of these files:
   - `index.html`
   - `wizard.css`
   - `wizard-demo.js`
   - `wizard-generators.js`
   - `viewmodel.js`
   - `configuration.js`

---

## Step 3: Connect the Sources to the Form

1. Open the form you just created
2. Go to **Connect**
3. Search for and add each of the 6 sources you created in Step 1
4. Make sure **Get** is checked for all of them

---

## That's It!

Open the form in Etrieve and you'll see three options:

- **Document Lookup** — dashboards for scanned documents
- **Form Tracker** — dashboards for form submissions
- **Combined View** — both together

Pick one, walk through the wizard, and download your finished dashboard. Upload those files as a new form and you're live.

---

## Something Not Working?

| What's Happening | How to Fix It |
|-----------------|---------------|
| No areas or templates show up | Check that all 6 sources are connected and **Get** is checked |
| "Forbidden" errors | Open each source, go to **Permissions**, and grant **Get** access to your users |
| Spinner won't stop | Open your browser's developer tools (F12) and look for red errors in the Console tab |
| Blank page | Make sure all 6 files got uploaded to the form |

---

## Using Different Source Names?

If you named your sources something other than `WizardBuilder_GetAreas`, `WizardBuilder_GetDocTypes`, etc., open `configuration.js` and change the names to match what you used.
