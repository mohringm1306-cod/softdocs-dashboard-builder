# SQL Integration Tester

A lightweight Etrieve form that runs any SQL query through an integration source and displays the results. Useful for testing queries, probing schema, and debugging the Dashboard Builder's data sources.

## Setup (5 minutes)

### Step 1: Create the Integration Source

Go to **Central > Admin > Sources** and click **Add New Source**.

1. **General Settings** tab:
   - **Name**: `SqlTester` (or whatever you like — just update `configuration.js` to match)
   - **Connection**: Your Etrieve Content database connection
2. **Actions** tab:
   - Turn on **Get** and **Custom Action**
   - Paste any SQL query into the **Query Editor** (you'll swap this out each time you test)
3. **Privileges** tab:
   - Add yourself with **Get** access
4. Click **Save**

### Step 2: Upload the Form Files

1. Go to **Admin > Forms** and create a new form
2. Name it something like "SQL Tester"
3. Upload these 3 files:
   - `index.html`
   - `viewmodel.js`
   - `configuration.js`
4. **Keep the form unpublished** — you can't edit sources on a published form

### Step 3: Connect the Source

1. Open the form's settings and go to **Sources**
2. Find the source you created in Step 1 and check **Get**

### Step 4: Use It

1. To run a query: go to **Admin > Sources**, open your `SqlTester` source, paste SQL in the Query Editor, and click **Save**
2. Open the form — it auto-runs on load and displays results
3. Click **Refresh Data** to re-run after changing the SQL
4. Click **Copy All** to copy the formatted output to your clipboard
5. Click **Copy JSON** to copy raw JSON data

### Changing the Source Name

If you named your source something other than `SqlTester`, edit `configuration.js`:

```javascript
var sqlTesterIntegrationName = 'YourSourceNameHere';
```

---

## Workflow Diagnostic Probes

These probes help diagnose issues with the Dashboard Builder's workflow step discovery. Run them in order.

### Probe 1 — Find templates with workflow activity

Which form templates have documents flowing through workflows?

```sql
SELECT TOP 20
    pd.SourceTypeCode,
    COUNT(*) AS docCount
FROM reporting.central_flow_PackageDocument pd
GROUP BY pd.SourceTypeCode
ORDER BY COUNT(*) DESC
```

### Probe 2 — Trace the workflow chain for a specific template

Replace `YOUR_CODE_HERE` with a `SourceTypeCode` from Probe 1.

```sql
SELECT DISTINCT
    ps.ProcessStepId,
    ps.[Name]       AS StepName,
    ps.IsDeleted,
    p.ProcessID,
    p.[Name]        AS ProcessName
FROM reporting.central_flow_PackageDocument pd
INNER JOIN reporting.central_flow_TaskQueue tq
    ON tq.PackageId = pd.PackageID
INNER JOIN reporting.central_flow_ProcessStep ps
    ON tq.ProcessStepID = ps.ProcessStepId
INNER JOIN reporting.central_flow_Process p
    ON ps.ProcessID = p.ProcessID
WHERE pd.SourceTypeCode = 'YOUR_CODE_HERE'
```

This shows steps that have **had forms routed to them**. If some steps have never had any traffic, they won't appear here.

### Probe 3 — ALL steps in a process

Replace `PROCESS_ID_HERE` with a `ProcessID` from Probe 2.

```sql
SELECT
    ps.ProcessStepId,
    ps.[Name]       AS StepName,
    ps.IsDeleted,
    ps.Code,
    ps.ActivityCode
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID = 'PROCESS_ID_HERE'
ORDER BY ps.[Name]
```

**If Probe 3 returns more steps than Probe 2**, those extra steps are ones the Dashboard Builder's workflow step picker won't show — because they've never had a form routed to them. This is the root cause if the wizard only shows some workflow steps.

### Probe 4 — Verify the full Source #6 query

Replace `43` with your template's `TemplateID` (get it from `WizardBuilder_GetFormTemplates`).

```sql
SELECT DISTINCT
    ps.ProcessStepId                AS id,
    ps.[Name]                       AS name,
    REPLACE(ps.[Name], '_', ' ')    AS displayName
FROM reporting.central_flow_ProcessStep ps
WHERE ps.ProcessID IN (
    SELECT DISTINCT ps2.ProcessID
    FROM reporting.central_forms_TemplateVersion tv
    INNER JOIN reporting.central_flow_PackageDocument pd
        ON pd.SourceTypeCode = tv.Code
    INNER JOIN reporting.central_flow_TaskQueue tq
        ON tq.PackageId = pd.PackageID
    INNER JOIN reporting.central_flow_ProcessStep ps2
        ON tq.ProcessStepID = ps2.ProcessStepId
    WHERE tv.TemplateID = 43
)
    AND ps.IsDeleted = 0
ORDER BY ps.[Name]
```

This is the exact query the Dashboard Builder uses. It should return **all non-deleted steps** for the process — not just the ones with active forms.
