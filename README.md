# Softdocs Dashboard Builder

A wizard that builds dashboards for Softdocs Etrieve. No coding required — just pick a style, point it at your data, and download a ready-to-use dashboard.

---

## What Is This?

This wizard helps you build dashboards for Etrieve Content and Central Forms. Dashboards let you **track, filter, and export** data — quickly and visually — without altering any stored records.

**You get:**

* 12 dashboard styles — status boards, claims trackers, voting panels, bulk actions, and more
* 3 data modes — Document Lookup, Form Tracker, or Combined
* Live preview as you build
* One-click download of everything you need
* Auto-save — close the browser and pick up where you left off

---

## Setting Up

Three things: create the data sources, upload the files, and connect them. Takes about 15 minutes.

### Step 1: Create 6 Data Sources

Go to **Central > Admin > Sources** and click **Add New Source**.

For each source below:

1. **General Settings** tab — Set the **Name** (copy it exactly) and set **Connection** to your Etrieve Content database connection
2. **Actions** tab — Turn on **Get**, turn on **Custom Action**, and paste the SQL into the **Query Editor**. If a parameter is listed, add it under **Source Keys**
3. **Privileges** tab — Add your users and give them **Get** access
4. Click **Save**

Repeat for all 6 sources, then move on to Step 2.

---

**`WizardBuilder_GetAreas`**

No source keys needed.

```sql
SELECT
    CatalogID       AS id,
    [Name]          AS name
FROM [dbo].[Catalog]
ORDER BY [Name]
```

---

**`WizardBuilder_GetDocTypes`**

Add source key: `@CatalogID` (Integer)

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

**`WizardBuilder_GetKeyFields`**

Add source key: `@CatalogID` (Integer)

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

**`WizardBuilder_GetFormTemplates`**

No source keys needed.

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

**`WizardBuilder_GetFormInputs`**

Add source key: `@TemplateVersionID` (Integer)

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

**`WizardBuilder_GetWorkflowSteps`**

Add source key: `@TemplateID` (Integer)

Returns ALL workflow steps for the process linked to a template (not just steps with
active queue entries). Requires at least one form submission to discover the ProcessID.

```sql
SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID IN (
    -- Find the ProcessID(s) linked to this template via TaskQueue chain
    SELECT DISTINCT ps2.ProcessID
    FROM reporting.central_flow_ProcessStep ps2
    INNER JOIN reporting.central_flow_TaskQueue tq
        ON tq.ProcessStepID = ps2.ProcessStepId
    INNER JOIN reporting.central_flow_PackageDocument pd
        ON tq.PackageId = pd.PackageID
    INNER JOIN reporting.central_forms_TemplateVersion tv
        ON pd.SourceTypeCode = tv.Code
    WHERE tv.TemplateID = @TemplateID
)
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
```

---

### Step 2: Upload the Wizard Files

1. Go to **Admin > Forms** and create a new form
2. Name it whatever you like (e.g., "Dashboard Builder")
3. Upload these 6 files:
   * `index.html`
   * `wizard.css`
   * `wizard-demo.js`
   * `wizard-generators.js`
   * `viewmodel.js`
   * `configuration.js`

---

### Step 3: Connect the Sources to the Form

1. Open the form you just created
2. Go to **Sources** (under the form's settings)
3. Find each of the 6 sources and check **Get** for all of them

It should look like this — all 6 sources associated with Get checked:

```
WizardBuilder_GetAreas          ☑ Get
WizardBuilder_GetDocTypes       ☑ Get
WizardBuilder_GetFormInputs     ☑ Get
WizardBuilder_GetFormTemplates  ☑ Get
WizardBuilder_GetKeyFields      ☑ Get
WizardBuilder_GetWorkflowSteps  ☑ Get
```

---

### Step 4: Open and Go

Open the form in Etrieve. You'll see three options:

* **Document Lookup** — dashboards for scanned documents
* **Form Tracker** — dashboards for form submissions
* **Combined View** — both together

Pick one, walk through the wizard, and download your finished dashboard. Upload those files as a new form and you're live.

---

## Dashboard Styles

| Style | What It's For |
|-------|---------------|
| Simple Status | Color-coded lanes grouped by status |
| Request Type | Grouped by request or form type |
| Expandable | Click a row to see details |
| Alpha Split | Tabs by last name (A-H, I-P, Q-Z) |
| Claims | Claim/unclaim items with age tracking |
| Workflow Actions | Approve/deny buttons per workflow step |
| PDF Signatures | Track document signature status |
| Survey Analytics | Charts and stats for survey data |
| Award Nominations | Track nominations by category |
| Committee Voting | Vote columns with approve/deny/abstain |
| Cards Dashboard | Card layout with status counts |
| Bulk Actions | Checkboxes for bulk approve/deny/reassign |

---

## SQL Tester Tool

The `SqlTester/` folder contains a standalone SQL testing form you can deploy alongside the wizard. It lets you paste any SQL into an integration source and instantly see the results — useful for testing queries, probing your schema, and diagnosing workflow issues.

See [`SqlTester/README.md`](SqlTester/README.md) for setup instructions and workflow diagnostic probes.

---

## Something Not Working?

* **403 errors** — Check that the **Connection** on each source is set to your Etrieve Content database (not Etrieve Security or another connection). Then check **Privileges** — your users need **Get** access on every source.
* **Source names don't match** — If you named your sources differently, update the names in `configuration.js` to match.
* **Wizard won't save in the form editor** — Make sure you're using the latest files from this repo. Older versions used JavaScript syntax that Etrieve's editor doesn't accept.

---

## License

Licensed under the [MIT License](LICENSE).

*Created by Michael Mohring, College of DuPage IT*
