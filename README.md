# Softdocs Dashboard Builder Wizard

Build dashboards for Softdocs Etrieve without writing code. Pick a style, point it at your data, and the wizard generates everything you need.

---

## What Can It Do?

- **12 dashboard styles** — from simple status boards to voting panels, claims trackers, and bulk action tools
- **3 data modes** — Document Lookup, Form Tracker, or both combined
- **Live preview** — see your dashboard take shape as you configure it
- **One-click download** — generates all the files you need, ready to upload as a new Etrieve form
- **Auto-save drafts** — close the browser and pick up where you left off

## Dashboard Styles

| Style | What It's For |
|-------|---------------|
| Simple Status | Color-coded swimlanes grouped by status |
| Request Type | Organized by request or form type |
| Expandable | Click a row to see more details |
| Alpha Split | Tabs by last name (A-H, I-P, Q-Z) |
| Claims | Staff claim/unclaim items with age tracking |
| Workflow Actions | Approve/deny buttons that change per step |
| PDF Signatures | Track signature status on documents |
| Survey Analytics | Charts and stats for survey responses |
| Award Nominations | Track nominations across award categories |
| Committee Voting | Voting columns with approve/deny/abstain |
| Cards Dashboard | Executive card layout with status counts |
| Bulk Actions | Checkboxes to approve/deny/reassign in bulk |

---

## Getting Started

See **[INSTALL.md](INSTALL.md)** for the full setup guide. The short version:

1. Create 6 data sources in Etrieve (SQL is provided — just copy and paste)
2. Upload 6 files to a new Etrieve form
3. Connect the sources to the form
4. Open the form and start building dashboards

---

## What's in This Repo

| File | What It Does |
|------|-------------|
| `index.html` | The wizard page |
| `wizard.css` | How it looks |
| `wizard-demo.js` | The wizard engine |
| `wizard-generators.js` | Generates all 12 dashboard styles |
| `viewmodel.js` | Connects the wizard to your real Etrieve data |
| `configuration.js` | Names of your data sources (editable) |
| `INSTALL.md` | Step-by-step setup guide |
| `Sources/` | The 6 SQL queries to create as data sources |

---

## License

[MIT License](LICENSE)

*Created by Michael Mohring, College of DuPage IT*
