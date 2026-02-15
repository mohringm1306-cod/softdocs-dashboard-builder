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

You'll create a few **data sources** in Etrieve Central, upload the wizard files, and connect them. Takes about 15 minutes.

### 1. Create These Sources in Etrieve Central

Go to: **Central > Admin > Sources > Add New Source > Type: Database**

Create each source below. Copy the name exactly, paste the SQL, and add the parameter if one is listed.

---

**`WizardBuilder_GetAreas`**

```sql
SELECT
    CatalogID       AS id,
    [Name]          AS name
FROM [dbo].[Catalog]
ORDER BY [Name]
```

---

**`WizardBuilder_GetDocTypes`**

Parameter: `@CatalogID` (Integer)

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

Parameter: `@CatalogID` (Integer)

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

Parameter: `@TemplateVersionID` (Integer)

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

Parameter: `@TemplateID` (Integer)

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

> **Permissions:** For each source, click into **Permissions** and grant your user group **Get** access. If you skip this, the wizard will get **403 Forbidden** errors.

---

### 2. Upload the Wizard Files

1. **Central > Admin > Forms** — create a new form
2. Name it whatever you like (e.g., "Dashboard Builder")
3. Upload these 6 files:
   * `index.html`
   * `wizard.css`
   * `wizard-demo.js`
   * `wizard-generators.js`
   * `viewmodel.js`
   * `configuration.js`

---

### 3. Connect the Sources

1. Open the form you just created
2. Go to **Connect > Available Sources**
3. Add each of the 6 sources from Step 1
4. Check **Get** for each one

---

### 4. Open and Go

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

## Tips

* **403 errors** = missing permissions or incorrect source names
* If you used different source names, update them in `configuration.js`
* The wizard auto-saves your progress — just reopen the form to resume

---

## License

Licensed under the [MIT License](LICENSE).

*Created by Michael Mohring, College of DuPage IT*
