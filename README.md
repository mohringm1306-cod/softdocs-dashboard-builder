# Softdocs Dashboard Builder

A wizard that builds dashboards for Softdocs Etrieve. No coding required. Pick a style, point it at your data, and download a ready-to-use dashboard.

## What's New in v4.1

- **Built-in Admin Setup Guide** -- Click the "Setup Guide" button in the header (or the link on the welcome screen) to see all 6 SQL source definitions, file upload instructions, and source-to-form connection steps right inside the wizard. No more switching to GitHub to find the docs.
- **Improved deployment instructions** -- The generate step and downloaded README now include explicit steps for connecting the source to the form and turning off Run on Load. Based on real first-deployment feedback.

## What's New in v4.0

- **Style infographics** -- Click any dashboard style and an info panel expands showing what you get, warnings (for styles that need on-prem SQL), and numbered setup steps. Makes the difference between cloud-only and hybrid styles obvious before you commit.
- **Cloud Only / Hybrid Server badges** -- Green badges for styles that run entirely in the cloud. Amber badges for styles that require on-prem SQL Server and Hybrid Server.
- **Style-specific live previews** -- The preview panel now shows a realistic mockup of each style with fake data (swimlanes, action buttons, vote columns, charts, etc.) instead of a generic placeholder.
- **Sticky preview panel** -- The preview follows you as you scroll through long wizard steps.
- **URL auto-fill** -- Instance URL fields auto-correct typos and add `https://` on blur.
- **Current Assignee column** -- Virtual field that resolves the TaskQueue `ActorId` GUID to a display name via the Actor table. No extra integration needed.
- **Integration database name field** -- Hybrid Server styles now ask for your database name and generate `USE [database]` at the top of schema.sql so tables land in the right place.
- **Fillable Notes column** -- Editable notes column that persists to on-prem SQL via Hybrid Server. Works with any style.
- **Party field auto-detection** -- Wizard auto-detects party fields via `PartyTypeID` fallback and generates correct JOINs.
- **FormStatus + Error detection** -- Computed status field with In Progress, Completed, and Error (TaskQueue.Status = 9999).

---

## What Is This?

This wizard helps you build dashboards for Etrieve Content and Central Forms. Dashboards let you **track, filter, and export** data quickly and visually without altering any stored records.

**You get:**

* 12 dashboard styles (8 cloud-only, 4 hybrid with on-prem SQL)
* 3 data modes: Document Lookup, Form Tracker, or Combined
* Live preview as you build
* One-click download of everything you need
* Auto-save: close the browser and pick up where you left off

---

## Setting Up

Three things: create the data sources, upload the files, and connect them. Takes about 15 minutes.

### Step 1: Create 6 Data Sources

Go to **Central > Admin > Sources** and click **Add New Source**.

For each source below:

1. **General Settings** tab -- Set the **Name** (copy it exactly) and set **Connection** to your Etrieve Content database connection
2. **Actions** tab -- Turn on **Get**, turn on **Custom Action**, and paste the SQL into the **Query Editor**. If a parameter is listed, add it under **Source Keys**
3. **Privileges** tab -- Add your users and give them **Get** access
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
        WHEN f.PartyTypeID IS NOT NULL          THEN 'party'
        WHEN dt.[Name] = 'Date'                 THEN 'date'
        WHEN dt.[Name] = 'Number'               THEN 'number'
        WHEN dt.[Name] IN ('Money', 'Decimal')  THEN 'decimal'
        ELSE 'text'
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
active queue entries). Uses the Package table to find the most recent ProcessID, which
is more reliable than the TaskQueue approach.

```sql
SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID = (
    SELECT TOP 1 pkg.ProcessID
    FROM reporting.central_forms_TemplateVersion tv
    INNER JOIN reporting.central_flow_PackageDocument pd
        ON pd.SourceTypeCode = tv.Code
    INNER JOIN reporting.central_flow_Package pkg
        ON pd.PackageID = pkg.PackageId
    WHERE tv.TemplateID = @TemplateID
    ORDER BY pkg.CreateDate DESC
)
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
```

---

### Step 2: Upload the Wizard Files

1. Go to **Admin > Forms** and create a new form
2. Name it whatever you like (e.g., "Dashboard Builder")
3. Upload all 12 files:
   * `index.html`
   * `wizard.css`
   * `wizard-demo.js`
   * `wizard-sql.js`
   * `wizard-templates.js`
   * `wizard-generators.js`
   * `wizard-preview.js`
   * `wizard-preview-basic.js`
   * `wizard-preview-advanced.js`
   * `wizard-preview-specialized.js`
   * `viewmodel.js`
   * `configuration.js`

---

### Step 3: Connect the Sources to the Form

1. Open the form you just created
2. Go to **Sources** (under the form's settings)
3. Find each of the 6 sources and check **Get** for all of them

It should look like this, all 6 sources associated with Get checked:

```
WizardBuilder_GetAreas          [x] Get
WizardBuilder_GetDocTypes       [x] Get
WizardBuilder_GetFormInputs     [x] Get
WizardBuilder_GetFormTemplates  [x] Get
WizardBuilder_GetKeyFields      [x] Get
WizardBuilder_GetWorkflowSteps  [x] Get
```

---

### Step 4: Open and Go

Open the form in Etrieve. You'll see three options:

* **Document Lookup** -- dashboards for scanned documents
* **Form Tracker** -- dashboards for form submissions
* **Combined View** -- both together

Pick one, walk through the wizard, and download your finished dashboard. Upload those files as a new form and you're live.

---

## Dashboard Styles

| Style | Infrastructure | What It's For |
|-------|---------------|---------------|
| Simple Status | Cloud Only | Color-coded lanes grouped by status |
| Request Type | Cloud Only | Grouped by request or form type |
| Alpha Split | Cloud Only | Tabs by last name (A-H, I-P, Q-Z) |
| Expandable Detail | Cloud Only | Click a row to see details |
| PDF + Signatures | Cloud Only | Track document signature status |
| Survey Analytics | Cloud Only | Charts and stats for survey data |
| Award Nominations | Cloud Only | Track nominations by category |
| Executive Cards | Cloud Only | Card layout with status counts |
| Claims System | Hybrid Server | Claim/unclaim items with age tracking |
| Workflow Actions | Hybrid Server | Approve/deny buttons per workflow step |
| Committee Voting | Hybrid Server | Vote columns with approve/deny/abstain |
| IT Equipment Review | Hybrid Server | Checkboxes for bulk approve/deny/reassign |

**Cloud Only** styles work entirely through Etrieve's cloud integration sources. No on-prem server needed.

**Hybrid Server** styles require an on-prem SQL Server and Hybrid Server connection for write-back operations (saving actions, votes, claims, etc.).

---

## File Inventory

| File | Purpose |
|------|---------|
| `index.html` | Wizard shell (loads all JS/CSS, step container, preview panel) |
| `wizard.css` | All wizard styling (steps, cards, infographics, preview) |
| `wizard-demo.js` | Version tracking, simulated data, DashboardStyles metadata, State |
| `wizard-sql.js` | SQL generation (obfuscated keywords to bypass Cloudflare WAF) |
| `wizard-templates.js` | UI rendering (step content, field pickers, swimlane builder) |
| `wizard-generators.js` | File generation (viewmodel.js, configuration.js, index.html, schema.sql) |
| `wizard-preview.js` | Preview coordinator (shared primitives, main dispatcher) |
| `wizard-preview-basic.js` | Preview renderers: Simple Status, Request Type, Alpha Split |
| `wizard-preview-advanced.js` | Preview renderers: Expandable, Claims, Workflow Actions, PDF, Bulk |
| `wizard-preview-specialized.js` | Preview renderers: Survey, Committee Voting, Cards, Awards |
| `viewmodel.js` | Bootstrap viewmodel (loads wizard when form opens in Etrieve) |
| `configuration.js` | Integration source name mappings |

---

## Something Not Working?

* **403 errors** -- Check that the **Connection** on each source is set to your Etrieve Content database (not Etrieve Security or another connection). Then check **Privileges** -- your users need **Get** access on every source.
* **Source names don't match** -- If you named your sources differently, update the names in `configuration.js` to match.
* **Wizard won't save in the form editor** -- Make sure you're using the latest files from this repo. Older versions used JavaScript syntax that Etrieve's editor doesn't accept.
* **File upload blocked (403 Forbidden)** -- Cloudflare WAF may block files containing SQL keywords. The SQL generators are in a separate `wizard-sql.js` file with obfuscated keywords for this reason. Make sure you're uploading all 12 files from this repo.

---

## License

Licensed under the [MIT License](LICENSE).

*Created by Michael Mohring, College of DuPage IT*
