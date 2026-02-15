# Softdocs Dashboard Builder Wizard 3.0

A browser-based wizard that generates production-ready dashboards for **Softdocs Etrieve** — no coding required.

Point the wizard at your Etrieve data sources, pick a dashboard style, configure swimlanes and filters, and download a complete deployment package (HTML, JS, SQL, README) ready to upload.

---

## What's New in v3.0

| Feature | Details |
|---------|---------|
| **12 Dashboard Styles** | Simple Status, Request Type, Expandable, Alpha Split, Claims, Workflow Actions, PDF Signatures, Survey Analytics, Award Nominations, Committee Voting, Cards Dashboard, Bulk Actions |
| **3 Data Modes** | Document Lookup, Form Tracker, Combined View |
| **Write-Back Styles** | Claims, Voting, Workflow, and Bulk Actions generate SQL Server schema (tables + stored procedures) for on-prem write-back via Hybrid Server |
| **Live Preview** | Real-time preview updates as you configure swimlanes, filters, and styles |
| **Draft Auto-Save** | Work is saved to localStorage — resume where you left off |
| **Full Code Generation** | Produces `configuration.js`, `viewmodel.js`, `index.html`, `integration-query.sql`, `schema.sql` (write-back styles), and `README.md` |
| **XSS Protection** | Three-layer escaping: `escapeHtml()` / `escapeJS()` / `escapeSQL()` at generation time; `_esc()` / `_escJS()` at dashboard runtime |
| **Etrieve RequireJS** | All generated files use AMD `define()` registration — no `<script src="">` tags (which 404 in Etrieve Cloud) |

---

## Repository Structure

```
softdocs-dashboard-builder/
    index.html              # Wizard form page (upload to Etrieve)
    wizard.css              # Wizard stylesheet
    wizard-demo.js          # Wizard core logic (state, UI, SQL generation)
    wizard-generators.js    # Style template generators (12 styles)
    viewmodel.js            # Etrieve integration bridge (replaces simulated data with real API data)
    configuration.js        # Integration source name mappings
    INSTALL.md              # Step-by-step deployment guide
    Sources/
        1_WizardBuilder_GetAreas.sql
        2_WizardBuilder_GetDocTypes.sql
        3_WizardBuilder_GetKeyFields.sql
        4_WizardBuilder_GetFormTemplates.sql
        5_WizardBuilder_GetFormInputs.sql
        6_WizardBuilder_GetWorkflowSteps.sql
        SCHEMA.md           # Etrieve database schema reference
        PROBE_*.sql         # Schema discovery queries
```

---

## Quick Start

### 1. Create Integration Sources

Create 6 read-only SQL sources in **Etrieve Central > Admin > Sources** using the queries in the `Sources/` folder. See [INSTALL.md](INSTALL.md) for detailed instructions.

### 2. Upload Wizard Files

Upload all 6 files to a new Etrieve form:
- `index.html`, `wizard.css`, `viewmodel.js`, `configuration.js`, `wizard-demo.js`, `wizard-generators.js`

### 3. Connect Sources to the Form

Under **Connect > Available Sources**, add all 6 integration sources and enable **Get** for each.

### 4. Use the Wizard

1. Open the form in Etrieve
2. Choose a mode: **Document Lookup**, **Form Tracker**, or **Combined**
3. Select your data source (area/template)
4. Pick a dashboard style
5. Configure swimlanes and filters
6. Download the generated dashboard package
7. Deploy the package as a new Etrieve form

---

## Dashboard Styles

| Style | Category | Description |
|-------|----------|-------------|
| Simple Status | Basic | Swimlane dashboard grouped by status |
| Request Type | Basic | Grouped by request type/category |
| Expandable | Advanced | Rows expand to show detail fields |
| Alpha Split | Advanced | Auto-split by last name ranges (A-H, I-P, Q-Z) |
| Claims | Advanced | Staff claim/unclaim items with age badges and stats |
| Workflow Actions | Advanced | Context-sensitive action buttons per swimlane |
| PDF Signatures | Specialized | Expandable rows with signature display |
| Survey Analytics | Specialized | Stats cards, view modes, theme analysis |
| Award Nominations | Specialized | Category badges for award programs |
| Committee Voting | Specialized | Named voter columns with approve/deny/abstain |
| Cards Dashboard | Specialized | Executive card layout with status metrics |
| Bulk Actions | Specialized | Checkbox selection with bulk approve/deny/reassign |

Styles marked with **SQL Required** need on-prem SQL Server tables via Hybrid Server for write-back operations.

---

## Documentation

- **[INSTALL.md](INSTALL.md)** — Full deployment walkthrough with source configuration tables
- **[Sources/SCHEMA.md](Sources/SCHEMA.md)** — Etrieve database schema reference

---

## License

Licensed under the [MIT License](LICENSE).

---

*Created by Michael Mohring, College of DuPage IT*
