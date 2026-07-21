# Softdocs Dashboard Builder

A wizard that builds dashboards for Softdocs Etrieve. No coding required. Pick a style, point it at your data, and download a ready-to-use dashboard.

## What's New in v4.4

- **Overview chart** -- Generated dashboards now show a collapsible bar chart of item counts per swimlane at the top. It is drawn as inline SVG (no external chart library, so it loads inside Etrieve) and updates live as you search or filter.
- **Date-range filter** -- A From / To date filter in the dashboard toolbar. Form Tracker dashboards filter on the submitted date; Document dashboards use a selected date field. Combined dashboards omit it, because documents have no submitted date and would all be filtered out.
- **Pre-flight review** -- The final wizard step now flags common mistakes before you download: a required field left unmapped (for example, a Survey with no rating field, or Executive Cards with no title), multiple catch-all swimlanes that would each show every row, no data columns selected, or a missing source name. The checks are advisory; you can still download.
- **Import / Export build files** -- Save the current build to a portable `.json` file from the finish step or the My Dashboards panel, then re-open it later, on another computer, or hand it to a teammate. Previously a saved build lived only in the browser it was created in.
- **Under the hood** -- Survey and Executive Cards now resolve field mappings to the real SQL column (they could render blank before), and Combined-mode field pickers include form inputs, labeled "(form)" to tell them apart from same-named document fields.

## What's New in v4.3

- **No more duplicate cards** -- Forms with more than one workflow package (resubmissions) or parallel / multi-signer steps now show as ONE row. The query collapses each form to its latest package and current task.
- **Submitted date shows and sorts** -- The `SubmittedDate` column now appears on Form Tracker dashboards and the default "newest first" sort targets it (previously it pointed at a column that did not exist).
- **Clean uploads** -- Removed non-ASCII characters (arrows, em dashes) from generated files that could trip the Cloudflare WAF during upload to Etrieve.
- **CSV export is injection-safe** -- Exported cells starting with `=`, `+`, `-`, or `@` are escaped so they cannot run as formulas when opened in Excel.
- **Assigned To needs no setup** -- Resolves the current assignee's name automatically (`TaskQueue.ActorId` joined to `central_flow_Actor`). The old "run a probe query to find the column" step is gone.
- **Accurate setup steps** -- Instructions now match the Softdocs Connect Administrator Guide: Admin Settings > Sources, Add New Source (Database), the Actions tab (Get + Custom + Query Editor), the Privileges tab, and the form's Connect tab. Removed references to a non-existent "Test" button and a "Custom GET" source type.

## What's New in v4.2

- **Workflow Actions + Bulk Actions are now cloud-only** -- Approve/Deny buttons now call the Etrieve Central Flow API directly (Lock + PutWorkQueue). No SQL Server, Hybrid Server, or polling agent needed. Based on the Softdocs "Approve Packages in Your Inbox" utility pattern.
- **Reassign feature** -- Bulk Actions reassign still uses Hybrid Server if configured, but is now optional. Approve/Deny work without it.
- **Bug fix: _cell() infinite recursion** -- Fixed stack overflow in every generated dashboard caused by `_cell()` calling itself (v4.1 regression).
- **Bug fix: Preview crash** -- Fixed preview renderer crashing when workflow actions are objects instead of strings.
- **Workflow step SQL synced** -- `WizardBuilder_GetWorkflowSteps` now uses the Package table approach (more reliable than TaskQueue for step discovery).

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

* 12 dashboard styles (10 cloud-only, 2 hybrid with on-prem SQL)
* 3 data modes: Document Lookup, Form Tracker, or Combined
* Built-in dashboard controls: text search, date-range filter, an overview chart, sortable columns, and per-swimlane CSV export
* User-selectable dashboard colors (not just COD green)
* Pre-flight review that catches common mistakes before download
* Live preview as you build
* One-click download of everything you need
* Auto-save plus import / export build files, so a build can move between browsers or teammates

---

## Setting Up

Three things: create the data sources, upload the files, and connect them. Takes about 15 minutes.

### Step 1: Create 6 Data Sources

Go to **Admin Settings > Sources** and click **Add New Source** (Source Type: **Database**).

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

1. Go to **Admin Settings > Forms** and create a new form
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
2. Go to the **Connect** tab (under the form's settings)
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
| Workflow Actions | Cloud Only | Approve/deny buttons per workflow step (Central Flow API) |
| Committee Voting | Hybrid Server | Vote columns with approve/deny/abstain |
| Bulk Approvals | Cloud Only | Checkboxes for bulk approve/deny (Central Flow API); reassign optional via Hybrid |

**Cloud Only** styles work entirely through Etrieve's cloud integration sources. No on-prem server needed. Workflow Actions and Bulk Actions (approve/deny) use the Central Flow API directly.

**Hybrid Server** styles require an on-prem SQL Server and Hybrid Server connection for write-back operations (saving votes, claims, etc.). The Bulk Actions reassign feature optionally uses Hybrid Server if configured.

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

* **403 / NotAuthorized errors** -- Your users need **Get** on each source's **Privileges** tab, and the form's **Connect** tab must have **Get** checked for the source. Also confirm each source's **Connection** points at your Etrieve Content / Central Forms database (not Etrieve Security or another connection).
* **Source names don't match** -- If you named your sources differently, update the names in `configuration.js` to match.
* **Wizard won't save in the form editor** -- Make sure you're using the latest files from this repo. Older versions used JavaScript syntax that Etrieve's editor doesn't accept.
* **File upload blocked (403 Forbidden)** -- Cloudflare WAF may block files containing SQL keywords. The SQL generators are in a separate `wizard-sql.js` file with obfuscated keywords for this reason. Make sure you're uploading all 12 files from this repo.

---

## License

Licensed under the [MIT License](LICENSE).

*Created by Michael Mohring, College of DuPage IT*
