"use strict";

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function generateViewModelJS() {
  var style = State.selectedStyle || 'simple-status';
  switch (style) {
    case 'simple-status':
    case 'request-type':
      return generateVM_simple();
    case 'expandable':
    case 'pdf-signatures':
    case 'award-nominations':
      return generateVM_expandable();
    case 'alpha-split':
      return generateVM_alphaSplit();
    case 'claims':
      return generateVM_claims();
    case 'workflow-actions':
      return generateVM_workflow();
    case 'survey-analytics':
      return generateVM_survey();
    case 'committee-voting':
      return generateVM_voting();
    case 'cards-dashboard':
      return generateVM_cards();
    case 'bulk-actions':
      return generateVM_bulkActions();
    default:
      return generateVM_simple();
  }
}
function generateIndexHTML() {
  var style = State.selectedStyle || 'simple-status';
  switch (style) {
    case 'simple-status':
    case 'request-type':
      return generateHTML_simple();
    case 'expandable':
    case 'pdf-signatures':
    case 'award-nominations':
      return generateHTML_expandable();
    case 'alpha-split':
      return generateHTML_alphaSplit();
    case 'claims':
      return generateHTML_claims();
    case 'workflow-actions':
      return generateHTML_workflow();
    case 'survey-analytics':
      return generateHTML_survey();
    case 'committee-voting':
      return generateHTML_voting();
    case 'cards-dashboard':
      return generateHTML_cards();
    case 'bulk-actions':
      return generateHTML_bulkActions();
    default:
      return generateHTML_simple();
  }
}
function generateConfigJS() {
  var swimlaneConfigs = State.swimlanes.map(function (sl) {
    var filterStr = sl.filters && sl.filters.length > 0 ? sl.filters.map(function (f) {
      // Use sqlAlias (actual SQL column name) instead of display name for row lookups
      var fieldKey = f.sqlAlias || f.fieldName;
      return "{ field: '".concat(escapeJS(fieldKey), "', values: [").concat((f.values || []).map(function (v) {
        return "'".concat(escapeJS(v), "'");
      }).join(', '), "] }");
    }).join(', ') : '';
    return "    { name: '".concat(escapeJS(sl.name), "', filters: [").concat(filterStr, "] }");
  }).join(',\n');
  var styleConfigBlock = '';
  var sc = State.styleConfig;
  var style = State.selectedStyle || 'simple-status';
  if (style === 'claims') {
    styleConfigBlock = "\n    // Claims system config\n    claims: {\n        filterChips: ".concat(JSON.stringify(sc.filterChips), ",\n        ageBadgeThresholds: { warning: ").concat(sc.ageBadgeWarning || 30, ", critical: ").concat(sc.ageBadgeCritical || 60, " }\n    },\n    currentUser: '', // Set to logged-in user");
  } else if (style === 'committee-voting') {
    styleConfigBlock = "\n    // Committee voting config\n    voting: {\n        members: ".concat(JSON.stringify(sc.committeeMembers, null, 8), "\n    },\n    currentUser: '', // Set to logged-in user");
  } else if (style === 'expandable' || style === 'pdf-signatures' || style === 'award-nominations') {
    var allFields = getAllFields();
    var detailFieldDefs = (sc.detailFields || []).map(function (id) {
      var f = allFields.find(function (x) {
        return x.id === id || x.id === String(id);
      });
      return f ? "{ field: '".concat(escapeJS(f.alias || f.id), "', label: '").concat(escapeJS(f.name), "' }") : "{ field: '".concat(escapeJS(id), "', label: '").concat(escapeJS(id), "' }");
    });
    styleConfigBlock = "\n    // Expandable row detail fields\n    expandable: {\n        detailFields: [".concat(detailFieldDefs.join(', '), "]\n    },");
  } else if (style === 'alpha-split') {
    styleConfigBlock = "\n    // Alpha split config\n    alphaSplit: {\n        nameField: '".concat(escapeJS(sc.nameField || 'LastName'), "',\n        ranges: ").concat(JSON.stringify(sc.alphaRanges), "\n    },");
  } else if (style === 'workflow-actions') {
    styleConfigBlock = "\n    // Workflow action buttons per swimlane\n    workflowActions: ".concat(JSON.stringify(sc.workflowActions, null, 8), ",");
  } else if (style === 'survey-analytics') {
    styleConfigBlock = "\n    // Survey field mappings\n    survey: {\n        ratingField: '".concat(escapeJS(sc.ratingField || ''), "',\n        commentField: '").concat(escapeJS(sc.commentField || ''), "',\n        departmentField: '").concat(escapeJS(sc.departmentField || ''), "'\n    },");
  } else if (style === 'cards-dashboard') {
    styleConfigBlock = "\n    // Card layout field mappings\n    cards: {\n        titleField: '".concat(escapeJS(sc.cardTitleField || ''), "',\n        statusField: '").concat(escapeJS(sc.cardStatusField || ''), "',\n        leadField: '").concat(escapeJS(sc.cardLeadField || ''), "',\n        budgetField: '").concat(escapeJS(sc.cardBudgetField || ''), "'\n    },");
  } else if (style === 'bulk-actions') {
    styleConfigBlock = "\n    // Bulk action reassign targets\n    bulkActions: {\n        reassignTargets: ".concat(JSON.stringify(sc.reassignTargets), "\n    },");
  }

  // Security config block
  var securityConfigBlock = '';
  if (State.securityConfig && State.securityConfig.enabled) {
    var secGroups = (State.securityConfig.swimlaneGroups || []).filter(function(g) { return g.groupId; });
    securityConfigBlock = "\n    // Security-first access control\n    // Power users load all data; others only load their authorized swimlanes.\n    // Data is filtered BEFORE rendering — unauthorized data never reaches the browser.\n    security: {\n        enabled: true,\n        powerGroupId: '" + escapeJS(State.securityConfig.powerGroupId || '') + "',\n        powerGroupName: '" + escapeJS(State.securityConfig.powerGroupName || '') + "',\n        swimlaneGroups: " + JSON.stringify(secGroups, null, 8) + "\n    },";
  } else {
    securityConfigBlock = "\n    // Security: disabled (all users see all data)\n    security: { enabled: false },";
  }

  return "/**\n * Dashboard Configuration\n * Generated by Dashboard Builder v3.0\n * Style: ".concat(style, "\n * ").concat(new Date().toISOString(), "\n */\n\nconsole.log('[Dashboard] configuration.js loaded');\n\nvar DashboardConfig = {\n    title: '").concat(escapeJS(State.dashboardTitle) || 'My Dashboard', "',\n    sourceName: '").concat(escapeJS(State.sourceName) || 'Dashboard', "',\n    mode: '").concat(escapeJS(State.mode), "',\n    style: '").concat(escapeJS(style), "',\n\n    integration: {\n        source: '").concat(escapeJS(State.sourceName) || 'Dashboard', "',\n        refreshInterval: 300000\n    },\n\n    swimlanes: [\n").concat(swimlaneConfigs, "\n    ],\n\n    columns: [\n").concat(generateColumnDefinitions(), "\n    ],\n").concat(styleConfigBlock, "\n").concat(securityConfigBlock, "\n\n    // Base URL for View links. Leave empty for relative URLs (works when\n    // the dashboard is hosted on the same domain as Central submissions).\n    // Set to your Etrieve Central domain if your dashboard is on a different\n    // subdomain, e.g. 'https://mysite.etrieve.cloud'\n    baseUrl: '',\n\n    ui: {\n        showSearch: true,\n        showFilters: true,\n        rowsPerPage: 25,\n        defaultSort: { field: 'date', direction: 'desc' }\n    }\n};\n\nconsole.log('[Dashboard] DashboardConfig created, source: ' + DashboardConfig.integration.source);\n\n// AMD registration for Etrieve RequireJS (loaded as 'template/configuration')\nif (typeof define === 'function' && define.amd) {\n    define('template/configuration', [], function() { return DashboardConfig; });\n}\n// Node.js fallback for local testing\nif (typeof module !== 'undefined') { module.exports = DashboardConfig; }\n").concat(generateWriteIntegrationVars(), "\n");
}
function generateWriteIntegrationVars() {
  var name = safeName(State.dashboardTitle || State.sourceName || 'Dashboard');
  var style = State.selectedStyle || 'simple-status';
  if (style === 'claims') {
    return "\n// Write-back integrations (on-prem SQL via Hybrid Server)\nvar claimIntegration = '".concat(name, "_ClaimItem';\nvar unclaimIntegration = '").concat(name, "_UnclaimItem';\n");
  } else if (style === 'committee-voting') {
    return "\n// Write-back integrations (on-prem SQL via Hybrid Server)\nvar castVoteIntegration = '".concat(name, "_CastVote';\nvar finalDecisionIntegration = '").concat(name, "_FinalDecision';\n");
  } else if (style === 'workflow-actions') {
    return "\n// Workflow action buttons use Etrieve's built-in workflow transitions\n// No on-prem SQL required\n";
  } else if (style === 'bulk-actions') {
    return "\n// Bulk action buttons use Etrieve's built-in workflow transitions\n// No on-prem SQL required\n";
  }
  return '';
}
function generateReadme() {
  var _State$selectedArea2, _State$selectedArea3, _State$selectedTempla;
  var style = State.selectedStyle || 'simple-status';
  var styleDef = DashboardStyles.find(function (s) {
    return s.id === style;
  }) || {
    name: 'Simple Status',
    description: ''
  };
  var name = safeName(State.dashboardTitle || State.sourceName || 'Dashboard');
  var isWriteBack = needsWriteBack();
  var styleNotes = {
    'simple-status': 'Basic swimlane dashboard. Items are grouped by status into collapsible sections.',
    'request-type': 'Items are grouped by request type/category rather than status.',
    'expandable': 'Rows can be expanded (+/- toggle) to show detail fields in a grid layout.',
    'alpha-split': 'Items are automatically split into alphabetical ranges by last name for workload distribution.',
    'claims': 'Staff can claim/unclaim items. Includes personal stats, quick-filter chips, and age badges. **Requires write-back integrations** via Hybrid Server.',
    'workflow-actions': 'Each swimlane has context-sensitive action buttons with confirmation modals. Uses Etrieve workflow transitions.',
    'pdf-signatures': 'Expandable rows show signatures and document details. Includes PDF generation.',
    'survey-analytics': 'Includes stats cards, word cloud, theme analysis, and table/card view modes.',
    'award-nominations': 'Expandable nomination details with category badges for award programs.',
    'committee-voting': 'Named voter columns for committee decisions. Includes vote buttons and document preview. **Requires write-back integrations** via Hybrid Server.',
    'cards-dashboard': 'Executive card layout with status metrics, progress tracking, and responsive grid.',
    'bulk-actions': 'Bulk checkbox selection with approve/deny/reassign operations and row-level action menus. Uses Etrieve workflow transitions.'
  };
  var writeBackSection = '';
  if (isWriteBack) {
    writeBackSection += "\n### ".concat(style === 'claims' ? '4' : '4', ". Create Write-Back Schema (On-Prem SQL Server)\n\nThis style requires tables and stored procedures on your on-prem SQL Server,\nconnected to Etrieve Cloud via the **Hybrid Server** agent.\n\n1. Open `schema.sql` in SQL Server Management Studio (SSMS)\n2. Review the generated CREATE TABLE and CREATE OR ALTER PROCEDURE statements\n3. Execute against your on-prem database\n4. Verify the tables and procs were created successfully\n\n");
    if (style === 'claims') {
      writeBackSection += "### 5. Create Write-Back Integration Sources\n\nYou need **two** additional integration sources on the Hybrid Server:\n\n| Integration Name | Type | Stored Procedure | Parameters |\n|------------------|------|-----------------|------------|\n| `".concat(name, "_ClaimItem` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_ClaimItem]` | `@FormID VARCHAR(50)`, `@ClaimedBy NVARCHAR(100)` |\n| `").concat(name, "_UnclaimItem` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_UnclaimItem]` | `@FormID VARCHAR(50)`, `@ClaimedBy NVARCHAR(100)` |\n\nFor each integration:\n1. In Etrieve Central > Admin > Sources, click **Add Source**\n2. Name it exactly as shown above (must match `configuration.js` variable names)\n3. Set type to **SQL Stored Procedure** and select your Hybrid connection\n4. Map the parameters as listed\n\n");
    } else if (style === 'committee-voting') {
      writeBackSection += "### 5. Create Write-Back Integration Sources\n\nYou need **two** additional integration sources on the Hybrid Server:\n\n| Integration Name | Type | Stored Procedure | Parameters |\n|------------------|------|-----------------|------------|\n| `".concat(name, "_CastVote` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_CastVote]` | `@DocumentID VARCHAR(50)`, `@MemberIndex INT`, `@Vote VARCHAR(10)`, `@VotedBy NVARCHAR(100)`, `@Comment NVARCHAR(500)` |\n| `").concat(name, "_FinalDecision` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_FinalDecision]` | `@DocumentID VARCHAR(50)`, `@Decision VARCHAR(10)`, `@DecidedBy NVARCHAR(100)` |\n\n");
    } else if (style === 'workflow-actions') {
      writeBackSection += "### 5. Create Write-Back Integration Sources\n\nYou need **one** additional integration source on the Hybrid Server:\n\n| Integration Name | Type | Stored Procedure | Parameters |\n|------------------|------|-----------------|------------|\n| `".concat(name, "_QueueAction` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_QueueAction]` | `@DocumentID VARCHAR(50)`, `@Action VARCHAR(50)`, `@Swimlane VARCHAR(100)`, `@PerformedBy NVARCHAR(100)` |\n\n");
    } else if (style === 'bulk-actions') {
      writeBackSection += "### 5. Create Write-Back Integration Sources\n\nYou need **two** additional integration sources on the Hybrid Server:\n\n| Integration Name | Type | Stored Procedure | Parameters |\n|------------------|------|-----------------|------------|\n| `".concat(name, "_BulkDecision` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_BulkDecision]` | `@DocumentIDs VARCHAR(MAX)`, `@Decision VARCHAR(20)`, `@DecidedBy NVARCHAR(100)` |\n| `").concat(name, "_RecordDecision` | SQL (Hybrid) | `[dbo].[sp_").concat(name, "_RecordDecision]` | `@DocumentID VARCHAR(50)`, `@Decision VARCHAR(20)`, `@DecidedBy NVARCHAR(100)`, `@AssignTo NVARCHAR(100)` |\n\n");
    }
  }
  var dataSourceNotes = '';
  if (State.mode === 'content') {
    var _State$selectedArea;
    dataSourceNotes = "### Data Source: Etrieve Content (Documents)\n\nThe `integration-query.sql` reads from the **Etrieve Content** database tables:\n- `dbo.DocumentType` \u2014 document types in the selected area\n- `dbo.Document` \u2014 document records\n- `dbo.Node` \u2014 folder/catalog assignment (`CatalogID = ".concat(((_State$selectedArea = State.selectedArea) === null || _State$selectedArea === void 0 ? void 0 : _State$selectedArea.id) || 'XXX', "`)\n- `dbo.ivDocumentTextFieldValue` / `dbo.ivDocumentDateFieldValue` \u2014 indexed field values\n\nEach selected field is LEFT JOINed by `FieldID` to retrieve the value per document.");
  } else if (State.mode === 'forms') {
    dataSourceNotes = "### Data Source: Etrieve Central Forms\n\nThe `integration-query.sql` reads from the **Central Forms** reporting tables:\n- `reporting.central_forms_Form` \u2014 submitted form instances\n- `reporting.central_forms_InputValue` \u2014 field values per form (pivoted via CASE/MAX)\n".concat(State.selectedWorkflowSteps.length > 0 ? "- `reporting.central_flow_PackageDocument` \u2014 links forms to workflow packages\n- `reporting.central_flow_TaskQueue` \u2014 current step assignment\n- `reporting.central_flow_ProcessStep` \u2014 step name/code lookup" : '', "\n\n**Important:** The query filters by `TemplateVersionID`. If you publish a new version\nof the form, you must update the ID in the SQL query.");
  } else if (State.mode === 'combined') {
    dataSourceNotes = "### Data Source: Combined (Documents + Forms)\n\nThe query uses `UNION ALL` to merge document and form data:\n- **Documents**: `dbo.DocumentType`, `dbo.Document`, `dbo.Node`, field value tables\n- **Forms**: `reporting.central_forms_Form`, `reporting.central_forms_InputValue`\n\nBoth result sets are normalized into matching columns (`RecordType`, `RecordID`,\n`Category`, `Field1..3`, `url`).";
  }
  var filesTable = "| File | Description |\n|------|-------------|\n| `integration-query.sql` | SQL query for the read-only Etrieve integration source |\n| `configuration.js` | Dashboard config: swimlanes, filters, columns, style settings |\n| `viewmodel.js` | Dashboard JS: data loading, rendering, interactions (AMD module) |\n| `index.html` | Dashboard HTML template with embedded CSS |\n| `README.md` | This setup guide |";
  if (isWriteBack) {
    filesTable += "\n| `schema.sql` | **SQL Server schema**: CREATE TABLE + stored procedures for write-back |";
  }
  return "# ".concat(State.dashboardTitle || 'Dashboard', "\n\nGenerated by **Dashboard Builder v3.0** on ").concat(new Date().toLocaleDateString(), "\n\n**Style:** ").concat(styleDef.name, "\n").concat(styleNotes[style] || styleDef.description, "\n\n---\n\n## Files Included\n\n").concat(filesTable, "\n\n## Setup Instructions\n\n### 1. Create the Read Integration Source\n\nThe main integration source provides data to the dashboard.\n\n1. In **Etrieve Central** > **Admin** > **Integrations** > **Sources**, click **Add Source**\n2. Name it exactly: `").concat(State.sourceName || 'Dashboard', "`\n3. Set connection to your ").concat(State.mode === 'content' ? 'Content database' : State.mode === 'forms' ? 'Central Forms (reporting) database' : 'Content + Central Forms databases', "\n4. Paste the contents of `integration-query.sql` as the query\n5. Click **Test** to verify it returns data\n6. Save the source\n\n").concat(dataSourceNotes, "\n\n### 2. Upload Dashboard Files to Etrieve\n\nAll JS files are loaded via Etrieve's RequireJS system. **Do NOT add `<script src=\"\">` tags** \u2014 they will 404 in Etrieve Cloud.\n\n1. In **Etrieve Central** > **Dashboards**, create a new dashboard (or edit an existing one)\n2. Upload these files:\n   - `index.html` \u2014 the main template\n   - `configuration.js` \u2014 registered as RequireJS module `template/configuration`\n   - `viewmodel.js` \u2014 registered as RequireJS module `template/viewmodel`\n3. Set the dashboard's main template to `index.html`\n\n### 3. Configure Permissions\n\nEnsure dashboard users have access to:\n- The dashboard itself (Etrieve Central > Dashboards > Permissions)\n").concat(State.mode === 'content' || State.mode === 'combined' ? "- The content area/catalog: **".concat(((_State$selectedArea2 = State.selectedArea) === null || _State$selectedArea2 === void 0 ? void 0 : _State$selectedArea2.name) || 'N/A', "** (CatalogID: ").concat(((_State$selectedArea3 = State.selectedArea) === null || _State$selectedArea3 === void 0 ? void 0 : _State$selectedArea3.id) || 'N/A', ")") : '', "\n").concat(State.mode === 'forms' || State.mode === 'combined' ? "- The form template: **".concat(((_State$selectedTempla = State.selectedTemplate) === null || _State$selectedTempla === void 0 ? void 0 : _State$selectedTempla.name) || 'N/A', "**") : '', "\n- The integration source: `").concat(State.sourceName || 'Dashboard', "`\n").concat(writeBackSection, "\n## Swimlane Configuration\n\nSwimlanes are defined in `configuration.js` and control how data is grouped:\n\n").concat(State.swimlanes.map(function (sl) {
    var filterDesc = sl.filters && sl.filters.length > 0 ? sl.filters.map(function (f) {
      return "`".concat(f.fieldName, "` IN (").concat(f.values.map(function (v) {
        return "`".concat(v, "`");
      }).join(', '), ")");
    }).join(' AND ') : 'No filters (catch-all — shows remaining items)';
    return "- **".concat(sl.name, "**: ").concat(filterDesc);
  }).join('\n'), "\n\n## Style-Specific Features\n\n").concat(style === 'claims' ? "- **Claim/Unclaim**: Staff can claim items for processing (writes to on-prem SQL)\n- **Filter Chips**: Quick filters: ".concat((State.styleConfig.filterChips || []).join(', '), "\n- **Age Badges**: Warning (yellow) at ").concat(State.styleConfig.ageBadgeWarning || 30, " days, Critical (red) at ").concat(State.styleConfig.ageBadgeCritical || 60, " days\n- **Personal Stats**: Shows each user's claimed count vs total") : '', "\n").concat(style === 'committee-voting' ? "- **Committee Members**: ".concat((State.styleConfig.committeeMembers || []).map(function (m) {
    return m.name;
  }).join(', '), "\n- **Voting**: Each member has Approve / Deny / Request More Info buttons\n- **Vote Tracking**: Computed columns count approvals, denials, and completion") : '', "\n").concat(style === 'expandable' || style === 'pdf-signatures' || style === 'award-nominations' ? "- **Expandable Rows**: Click +/- to show detail fields in a grid layout" : '', "\n").concat(style === 'alpha-split' ? "- **Alpha Ranges**: ".concat((State.styleConfig.alphaRanges || []).map(function (r) {
    return r[0] + '-' + r[1];
  }).join(', '), "\n- **Name Field**: Split by `").concat(State.styleConfig.nameField ? 'configured field' : 'last name', "`") : '', "\n").concat(style === 'workflow-actions' ? "- **Action Buttons**: Context-sensitive per swimlane (e.g., Approve, Deny, Request Info)\n- **Confirmation Modals**: Each action shows a confirmation dialog before executing" : '', "\n").concat(style === 'survey-analytics' ? "- **Stats Cards**: Response count, average rating, distribution\n- **View Modes**: Toggle between table view and card view\n- **Theme Analysis**: Auto-generated themes from text responses" : '', "\n").concat(style === 'cards-dashboard' ? "- **Card Layout**: Responsive grid of cards with status badges\n- **Status Metrics**: Summary bar with color-coded status counts\n- **Card Fields**: Title, Status, Lead, Budget (as configured)" : '', "\n").concat(style === 'bulk-actions' ? "- **Bulk Operations**: Select multiple items via checkboxes, then Approve / Deny / Reassign\n- **Reassign Targets**: ".concat((State.styleConfig.reassignTargets || []).join(', '), "\n- **Row Actions**: Individual approve/deny/reassign per row") : '', "\n\n## Customization\n\n### Modifying the SQL Query\nEdit `integration-query.sql` to add/remove columns, change filters, or adjust JOINs.\nAfter changes, update the integration source in Etrieve Central and verify the column\nnames match what `configuration.js` expects in the `columns` array.\n\n### Modifying Swimlanes\nEdit the `swimlanes` array in `configuration.js`. Each swimlane has:\n- `name`: Display name in the header\n- `filters`: Array of `{field, values}` objects that determine which rows appear\n\n### Changing the Style\nThe dashboard style is set in `configuration.js` (`style` property) and the\ncorresponding rendering logic is in `viewmodel.js`. To change styles, re-run the\nDashboard Builder wizard and generate new files.\n\n## Troubleshooting\n\n| Problem | Solution |\n|---------|----------|\n| Dashboard shows \"Unable to load data\" | Check integration source name matches `configuration.js` sourceName |\n| 404 errors in browser console | Ensure files are uploaded as dashboard template files, not as attachments |\n| Columns don't match | Verify SQL column aliases match `configuration.js` columns[].field values |\n| Write-back actions fail | Check Hybrid Server connection and stored procedure parameter names |\n| \"integration is not defined\" | The Etrieve `integration` API object requires the dashboard to be served from Etrieve |\n\n---\n\n*Generated by Dashboard Builder Wizard v3.0*\n");
}
function htmlHead(extraCss) {
  return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>".concat(escapeHtml(State.dashboardTitle || 'Dashboard'), "</title>\n    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css\" rel=\"stylesheet\">\n    <style>\n        :root {\n            --primary: #006341;\n            --primary-dark: #004d35;\n            --accent: #f4b41a;\n        }\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Segoe UI', sans-serif; background: #f5f7fa; min-height: 100vh; }\n        .header { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 20px 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n        .header h1 { font-size: 1.5rem; }\n        .container { max-width: 1400px; margin: 0 auto; padding: 30px; }\n        .toolbar { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }\n        .search-box { flex: 1; min-width: 250px; position: relative; }\n        .search-box input { width: 100%; padding: 12px 15px 12px 45px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; }\n        .search-box i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; }\n        .swimlane { background: white; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }\n        .swimlane-header { background: #f8f9fa; padding: 15px 20px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 600; border-bottom: 1px solid #e9ecef; }\n        .swimlane-header:hover { background: #f0f2f5; }\n        .swimlane-header .count { background: var(--primary); color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.85rem; }\n        .swimlane-content { padding: 0; }\n        .swimlane-content.collapsed { display: none; }\n        .data-table { width: 100%; border-collapse: collapse; }\n        .data-table th { background: #f8f9fa; padding: 12px 15px; text-align: left; font-weight: 600; border-bottom: 2px solid #e9ecef; }\n        .data-table td { padding: 12px 15px; border-bottom: 1px solid #f0f2f5; }\n        .data-table tr:hover td { background: #fafbfc; }\n        .view-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-size: 0.85rem; border: none; cursor: pointer; }\n        .view-btn:hover { background: var(--primary-dark); }\n        .error-message { text-align: center; padding: 50px; color: #dc3545; }\n        .error-message i { font-size: 3rem; margin-bottom: 15px; }\n        .export-btn { margin-left: auto; padding: 4px 12px; background: var(--accent); color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }\n        .export-btn:hover { opacity: 0.9; }\n        .btn { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }\n        .btn-success { background: #28a745; color: white; }\n        .btn-danger { background: #dc3545; color: white; }\n        .btn-info { background: #17a2b8; color: white; }\n        .btn-primary { background: var(--primary); color: white; }\n        .btn-warning { background: #ffc107; color: #000; }\n        .btn-secondary { background: #6c757d; color: white; }\n        .btn-sm { padding: 4px 10px; font-size: 0.8rem; }\n        .btn-outline-primary { background: transparent; color: var(--primary); border: 1px solid var(--primary); }\n        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }\n        ").concat(extraCss || '', "\n    </style>\n</head>");
}
function htmlBody(innerContent) {
  return "\n<body>\n    <div class=\"loading\" style=\"display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.7);z-index:9999;justify-content:center;align-items:center;\">\n        <div style=\"text-align:center;\"><div style=\"width:40px;height:40px;border:4px solid #e9ecef;border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 10px;\"></div><span>Loading...</span></div>\n    </div>\n    <style>@keyframes spin { to { transform: rotate(360deg); } } .toast-notification { position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:12px 24px;border-radius:8px;font-size:0.9rem;opacity:0;transition:opacity 0.3s;z-index:9999; } .toast-notification.show { opacity:1; } .toast-success { background:#28a745; } .toast-error { background:#dc3545; }</style>\n    <div class=\"header\">\n        <h1><i class=\"bi bi-grid-3x3-gap\"></i> ".concat(escapeHtml(State.dashboardTitle || 'Dashboard'), "</h1>\n    </div>\n    <div class=\"container\">\n        <div class=\"toolbar\">\n            <div class=\"search-box\">\n                <i class=\"bi bi-search\"></i>\n                <input type=\"text\" placeholder=\"Search...\" data-notsaved=\"true\" oninput=\"dashboard.searchTerm = this.value; dashboard.applyFilters(); dashboard.render();\">\n            </div>\n            <button id=\"refreshBtn\" class=\"btn btn-primary btn-sm\" onclick=\"dashboard.loadData()\" title=\"Refresh data\"><i class=\"bi bi-arrow-clockwise\"></i> Refresh</button>\n        </div>\n        ").concat(innerContent, "\n    </div>\n    <!-- JS loaded via Etrieve RequireJS: template/configuration, template/viewmodel -->\n    <!-- Do NOT add <script src=\"\"> tags \u2014 they will 404 in Etrieve Cloud -->\n</body>\n</html>");
}
function generateHTML_simple() {
  return htmlHead('') + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_expandable() {
  var extraCss = "\n        .toggle-btn { width: 28px; height: 28px; border: 2px solid var(--primary); background: white; color: var(--primary); border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; }\n        .toggle-btn:hover { background: var(--primary); color: white; }\n        .child-row td { background: #f8f9fa; border-left: 4px solid var(--primary); }\n        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 15px; }\n        .detail-item label { display: block; font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }\n        .detail-item span { font-size: 0.9rem; }\n        .separator-bar td { height: 3px; background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 50%, #e0e0e0 100%); padding: 0; }\n        .signature-display { font-family: 'Brush Script MT', cursive; font-size: 1.5rem; color: #333; padding: 5px; border-bottom: 1px solid #999; display: inline-block; }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_alphaSplit() {
  return htmlHead('') + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_claims() {
  var extraCss = "\n        .personal-stats { background: #f8f9fa; border-left: 4px solid var(--primary); border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; }\n        .personal-stats h6 { color: var(--primary); font-weight: 700; margin-bottom: 10px; }\n        .stat-row { display: flex; gap: 30px; }\n        .stat-item { text-align: center; }\n        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }\n        .stat-label { font-size: 0.8rem; color: #888; }\n        .action-bar { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }\n        .action-bar-left, .action-bar-right { display: flex; align-items: center; gap: 10px; }\n        .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }\n        .filter-chip { padding: 6px 14px; background: #e9ecef; border-radius: 20px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }\n        .filter-chip.active { background: var(--primary); color: white; }\n        .filter-chip:hover { opacity: 0.85; }\n        .btn-claim { padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }\n        .btn-unclaim { padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }\n        .badge-claimed { display: inline-block; padding: 4px 10px; background: #d4edda; color: #155724; border-radius: 4px; font-size: 0.8rem; }\n        .badge-unclaimed { display: inline-block; padding: 4px 10px; background: #f8d7da; color: #721c24; border-radius: 4px; font-size: 0.8rem; }\n        .age-badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }\n        .age-badge-normal { background: #d4edda; color: #155724; }\n        .age-badge-warning { background: #fff3cd; color: #856404; }\n        .age-badge-critical { background: #f8d7da; color: #721c24; }\n        .row-checkbox { cursor: pointer; }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_workflow() {
  var extraCss = "\n        .action-btn { padding: 4px 8px; font-size: 0.8rem; margin: 0 2px; border-radius: 4px; border: none; cursor: pointer; color: white; }\n        .confirmation-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; }\n        .confirmation-modal.show { display: flex; }\n        .modal-content-custom { background: white; border-radius: 8px; padding: 25px; max-width: 500px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }\n        .modal-content-custom h5 { color: var(--primary); margin-bottom: 15px; }\n        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_survey() {
  var extraCss = "\n        .survey-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 25px; }\n        .survey-stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid var(--primary); }\n        .survey-stat-card h3 { color: var(--primary); margin-bottom: 5px; }\n        .survey-stat-card small { color: #888; }\n        .action-bar { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }\n        .action-bar-left { display: flex; align-items: center; gap: 10px; }\n        .survey-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }\n        .survey-response-card { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_voting() {
  var extraCss = "\n        .voting-user-bar { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }\n        .vote-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0 2px; font-size: 1rem; transition: transform 0.1s, box-shadow 0.1s; }\n        .vote-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }\n        .vote-approve { background: #28a745; color: white; }\n        .vote-deny { background: #dc3545; color: white; }\n        .vote-info { background: #ffc107; color: #000; }\n        .toast-notification { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 12px 24px; border-radius: 8px; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s; z-index: 9999; }\n        .toast-notification.show { opacity: 1; }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_cards() {
  var extraCss = "\n        .cards-metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px; }\n        .cards-metric-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e9ecef; }\n        .cards-metric-card h6 { color: #888; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 10px; }\n        .cards-status-list { font-size: 0.85rem; }\n        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px; }\n        .item-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e9ecef; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }\n        .item-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }\n        .item-card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px; border-bottom: 1px solid #f0f2f5; }\n        .item-card-title { font-weight: 600; font-size: 0.95rem; }\n        .item-card-meta { font-size: 0.75rem; color: #888; margin-top: 3px; }\n        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }\n        .item-card-body { padding: 15px; }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function generateHTML_bulkActions() {
  var extraCss = "\n        .action-bar { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }\n        .action-bar-left, .action-bar-right { display: flex; align-items: center; gap: 10px; }\n        .reassign-wrapper { position: relative; }\n        .reassign-dropdown { position: absolute; top: 100%; left: 0; background: white; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; min-width: 180px; }\n        .reassign-dropdown a { display: block; padding: 10px 15px; cursor: pointer; font-size: 0.9rem; color: #333; text-decoration: none; }\n        .reassign-dropdown a:hover { background: #f0f2f5; }\n        .row-action-dropdown { position: relative; display: inline-block; }\n        .row-action-menu { display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; min-width: 160px; }\n        .row-action-menu.show { display: block; }\n        .row-action-menu a { display: block; padding: 10px 15px; cursor: pointer; font-size: 0.85rem; color: #333; text-decoration: none; }\n        .row-action-menu a:hover { background: #f0f2f5; }\n        .bulk-cb { cursor: pointer; }\n    ";
  return htmlHead(extraCss) + htmlBody("<div id=\"dashboardContent\"><p style=\"text-align:center;padding:50px;color:#666;\">Loading...</p></div>");
}
function vmPreamble() {
  return "/**\n * Dashboard ViewModel\n * Generated by Dashboard Builder v3.0\n * Style: ".concat(State.selectedStyle || 'simple-status', "\n *\n * Loaded by Etrieve RequireJS as 'template/viewmodel'.\n * Dependencies: integration (Etrieve data layer), user (current user info),\n *               template/configuration (dashboard config with source names).\n */\n\n// All code runs in global scope; define() at the bottom registers for RequireJS.\n\n");
}
function vmBaseClass() {
  var secEnabled = State.securityConfig && State.securityConfig.enabled;
  var securityBlock = '';

  if (secEnabled) {
    var powerGid = escapeJS(State.securityConfig.powerGroupId || '');
    var swimlaneGroupsJSON = JSON.stringify((State.securityConfig.swimlaneGroups || []).filter(function(g) { return g.groupId; }));

    securityBlock = "\n// ===== SECURITY-FIRST ACCESS CONTROL =====\n// Data is only loaded if the user belongs to an authorized group.\n// Power users get the full dataset; others get filtered per-swimlane.\n\nDashboardViewModel.prototype._securityEnabled = true;\nDashboardViewModel.prototype._powerGroupId = '" + powerGid + "';\nDashboardViewModel.prototype._swimlaneGroups = " + swimlaneGroupsJSON + ";\n\nDashboardViewModel.prototype._checkAccess = function() {\n    // Check if user module is available (Etrieve provides this)\n    if (typeof user === 'undefined' || typeof user.hasGroupOrRole !== 'function') {\n        console.error('Security: user module not available. Access denied (fail-closed).');\n        return { authorized: false, isPower: false, allowedSwimlanes: [] };\n    }\n\n    // Power user check\n    if (this._powerGroupId && user.hasGroupOrRole(this._powerGroupId)) {\n        return { authorized: true, isPower: true, allowedSwimlanes: [] };\n    }\n\n    // Per-swimlane group check\n    var allowed = [];\n    for (var i = 0; i < this._swimlaneGroups.length; i++) {\n        var sg = this._swimlaneGroups[i];\n        if (sg.groupId && user.hasGroupOrRole(sg.groupId)) {\n            allowed.push(sg.swimlaneName);\n        }\n    }\n\n    if (allowed.length > 0) {\n        return { authorized: true, isPower: false, allowedSwimlanes: allowed };\n    }\n\n    return { authorized: false, isPower: false, allowedSwimlanes: [] };\n};\n\n";
  }

  return "// Runtime HTML escaping to prevent XSS from API data\nfunction _esc(str) {\n    if (str == null) return '';\n    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');\n}\n\n// Runtime JS string escaping for onclick attributes (prevents quote breakout)\n// Also HTML-encodes the result for safe use inside HTML attribute values.\nfunction _escJS(str) {\n    if (str == null) return '';\n    var s = String(str).replace(/\\\\/g,'\\\\\\\\').replace(/'/g,\"\\\\'\").replace(/\"/g,'\\\\\"');\n    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');\n}\n\n// Toast notification helper\nfunction showToast(msg, type) {\n    var t = document.createElement('div');\n    t.className = 'toast-notification' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');\n    t.textContent = msg;\n    document.body.appendChild(t);\n    setTimeout(function() { t.classList.add('show'); }, 10);\n    setTimeout(function() { t.remove(); }, 3000);\n}\n\n// Refresh helper (replaces jQuery dependency)\nfunction _refreshDashboard(delayMs) {\n    setTimeout(function() { var rb = document.getElementById('refreshBtn'); if (rb) rb.click(); }, delayMs || 1500);\n}\n\nclass DashboardViewModel {\n    constructor(config) {\n        this.config = config;\n        this.data = [];\n        this.filteredData = [];\n        this.searchTerm = '';\n        this.activeFilters = {};\n" + (secEnabled ? "        this._accessResult = null; // cached access check\n" : "") + "    }\n\n    loadData() {\n        var self = this;\n" + (secEnabled ?
"        // Security-first: check group membership before loading any data\n        if (this._securityEnabled) {\n            this._accessResult = this._checkAccess();\n            if (!this._accessResult.authorized) {\n                this.showError('Access Denied. You do not have permission to view this dashboard. Contact your supervisor for access.');\n                return;\n            }\n        }\n\n" : "") +
"        // Use Etrieve integration.all() if available, otherwise fall back to fetch\n        if (typeof integration !== 'undefined' && typeof integration.all === 'function') {\n            console.log('[Dashboard] Loading data from source: ' + this.config.integration.source);\n            integration.all(this.config.integration.source).then(function(data) {\n                self.data = data || [];\n                console.log('[Dashboard] Data loaded: ' + self.data.length + ' rows');\n                if (self.data.length > 0) {\n                    console.log('[Dashboard] Column names:', Object.keys(self.data[0]));\n                    console.log('[Dashboard] First row sample:', JSON.stringify(self.data[0]).substring(0, 500));\n                }\n                // Auto-resolve filter field names: if a filter field doesn't match\n                // any column in the actual data, try to find the correct column.\n                // This self-heals dashboards generated with older wizard versions\n                // that used display names instead of SQL aliases.\n                if (self.data.length > 0 && self.config.swimlanes) {\n                    var cols = Object.keys(self.data[0]);\n                    var colsLower = cols.map(function(c) { return c.toLowerCase(); });\n                    self.config.swimlanes.forEach(function(sl) {\n                        if (!sl.filters) return;\n                        sl.filters.forEach(function(f) {\n                            if (cols.indexOf(f.field) !== -1) return; // exact match, OK\n                            // Try case-insensitive match\n                            var lowerField = f.field.toLowerCase();\n                            var ciIdx = colsLower.indexOf(lowerField);\n                            if (ciIdx !== -1) {\n                                console.warn('[Dashboard] Auto-fix: filter field \"' + f.field + '\" matched column \"' + cols[ciIdx] + '\" (case mismatch)');\n                                f.field = cols[ciIdx];\n                                return;\n                            }\n                            // Try known display-name → SQL-alias mappings\n                            var knownMap = { 'current workflow step': 'CurrentStepName', 'document type': 'DocumentType', 'category': 'Category', 'record type': 'RecordType' };\n                            var mapped = knownMap[lowerField];\n                            if (mapped && cols.indexOf(mapped) !== -1) {\n                                console.warn('[Dashboard] Auto-fix: filter field \"' + f.field + '\" resolved to column \"' + mapped + '\" (display name → SQL alias)');\n                                f.field = mapped;\n                                return;\n                            }\n                            // Try partial match (column name contains filter field or vice versa)\n                            for (var i = 0; i < cols.length; i++) {\n                                if (colsLower[i].indexOf(lowerField.replace(/\\s+/g, '')) !== -1 || lowerField.replace(/\\s+/g, '').indexOf(colsLower[i]) !== -1) {\n                                    console.warn('[Dashboard] Auto-fix: filter field \"' + f.field + '\" fuzzy-matched to column \"' + cols[i] + '\"');\n                                    f.field = cols[i];\n                                    return;\n                                }\n                            }\n                            console.error('[Dashboard] FILTER FIELD MISMATCH: \"' + f.field + '\" does not match any column. Available: ' + cols.join(', '));\n                        });\n                    });\n                }\n                // Prepend baseUrl to view links if configured\n                if (self.config.baseUrl) {\n                    self.data.forEach(function(row) {\n                        if (row.url && row.url.charAt(0) === '/') {\n                            row.url = self.config.baseUrl + row.url;\n                        }\n                    });\n                }\n                // Log swimlane filter diagnostics\n                if (self.config.swimlanes) {\n                    self.config.swimlanes.forEach(function(sl) {\n                        var filterDesc = (!sl.filters || sl.filters.length === 0) ? 'NO FILTERS (shows all)' : sl.filters.map(function(f) {\n                            var sampleValues = self.data.slice(0, 10).map(function(r) { return r[f.field]; }).filter(function(v) { return v !== undefined; });\n                            return f.field + ' IN [' + f.values.join(', ') + '] (actual data samples: [' + sampleValues.join(', ') + '])';\n                        }).join('; ');\n                        var matchCount = self.data.filter(function(row) {\n                            if (!sl.filters || sl.filters.length === 0) return true;\n                            return sl.filters.every(function(f) { return f.values.some(function(v) { return String(v) === String(row[f.field]); }); });\n                        }).length;\n                        console.log('[Dashboard] Swimlane \"' + sl.name + '\": ' + filterDesc + ' => ' + matchCount + '/' + self.data.length + ' rows');\n                    });\n                }\n" + (secEnabled ?
"                // Security-first: filter data to only authorized swimlanes\n                if (self._securityEnabled && self._accessResult && !self._accessResult.isPower) {\n                    var allowed = self._accessResult.allowedSwimlanes;\n                    self.data = self.data.filter(function(row) {\n                        return self.config.swimlanes.some(function(sl) {\n                            if (allowed.indexOf(sl.name) === -1) return false;\n                            if (!sl.filters || sl.filters.length === 0) return true;\n                            return sl.filters.every(function(f) { return f.values.some(function(v) { return String(v) === String(row[f.field]); }); });\n                        });\n                    });\n                }\n" : "") +
"                self.applyFilters();\n                self.render();\n            }).catch(function(error) {\n                console.error('Failed to load dashboard data:', error);\n                self.showError('Unable to load data. Please try again.');\n            });\n        } else {\n            fetch('/api/integration/' + this.config.integration.source)\n                .then(function(r) { return r.json(); })\n                .then(function(data) {\n                    self.data = data || [];\n                    self.applyFilters();\n                    self.render();\n                })\n                .catch(function(error) {\n                    console.error('Failed to load dashboard data:', error);\n                    self.showError('Unable to load data. Please try again.');\n                });\n        }\n    }\n\n    applyFilters() {\n        this.filteredData = this.data.filter(row => {\n            if (this.searchTerm) {\n                const searchLower = this.searchTerm.toLowerCase();\n                const matches = Object.values(row).some(val => String(val).toLowerCase().includes(searchLower));\n                if (!matches) return false;\n            }\n            for (const [field, value] of Object.entries(this.activeFilters)) {\n                if (value && row[field] !== value) return false;\n            }\n            return true;\n        });\n    }\n\n    getRowsForSwimlane(swimlane) {\n" + (secEnabled ?
"        // Security-first: hide swimlanes the user doesn't have access to\n        if (this._securityEnabled && this._accessResult && !this._accessResult.isPower) {\n            var allowed = this._accessResult.allowedSwimlanes;\n            if (allowed.indexOf(swimlane.name) === -1) return [];\n        }\n" : "") +
"        return this.filteredData.filter(row => {\n            if (!swimlane.filters || swimlane.filters.length === 0) return true;\n            return swimlane.filters.every(f => f.values.some(v => String(v) === String(row[f.field])));\n        });\n    }\n\n    showError(message) {\n        const container = document.getElementById('dashboardContent');\n        if (container) {\n            container.innerHTML = '<div class=\"error-message\"><i class=\"bi bi-exclamation-triangle\"></i> ' + _esc(message) + '</div>';\n        }\n    }\n}\n" + securityBlock;
}
function vmInit() {
  return "\nconsole.log('[Dashboard] viewmodel.js loaded');\n\nfunction toggleSwimlane(header) {\n    var content = header.nextElementSibling;\n    var icon = header.querySelector('i');\n    content.classList.toggle('collapsed');\n    icon.classList.toggle('bi-chevron-down');\n    icon.classList.toggle('bi-chevron-right');\n}\n\n// ============================================================\n// Etrieve Viewmodel Registration\n// ============================================================\n// Follows the same pattern as the wizard: unnamed define with\n// vmBase, user, integration, and configuration as dependencies.\n// Etrieve calls vm.onLoad() after the form is ready.\ndefine([\n    'knockout',\n    'vmBase',\n    'user',\n    'integration',\n    'template/configuration'\n], function(ko, vm, user, integration, config) {\n    console.log('[Dashboard] define() callback fired. integration:', typeof integration, ', user:', typeof user, ', config:', typeof config);\n\n    // Make integration available as a global for the DashboardViewModel class\n    window.integration = integration;\n    window.user = user;\n\n    // Use the config module return value, or fall back to global DashboardConfig\n    var cfg = (config && config.integration) ? config : (typeof DashboardConfig !== 'undefined' ? DashboardConfig : null);\n\n    vm.onLoad = function(source, inputValues) {\n        console.log('[Dashboard] onLoad fired');\n        if (!cfg) {\n            console.error('[Dashboard] No DashboardConfig found! Make sure configuration.js is uploaded.');\n            return;\n        }\n        if (typeof DashboardViewModel === 'undefined') {\n            console.error('[Dashboard] DashboardViewModel class not found!');\n            return;\n        }\n\n        // Set current user\n        if (user && user.userName) {\n            cfg.currentUser = user.userName;\n            console.log('[Dashboard] Current user: ' + user.userName);\n        }\n\n        try {\n            console.log('[Dashboard] Initializing with source: ' + cfg.integration.source);\n            window.dashboard = new DashboardViewModel(cfg);\n            window.dashboard.loadData();\n\n            // Auto-refresh (guard: min 30s, clear previous on re-init)\n            if (window._dashboardRefreshTimer) { clearTimeout(window._dashboardRefreshTimer); }\n            var refreshMs = (cfg.integration.refreshInterval == null) ? 300000 : (cfg.integration.refreshInterval === 0 ? 0 : Math.max(cfg.integration.refreshInterval, 30000));\n            if (refreshMs > 0) {\n                (function scheduleRefresh() {\n                    window._dashboardRefreshTimer = setTimeout(function() {\n                        if (window.dashboard) { window.dashboard.loadData(); }\n                        scheduleRefresh();\n                    }, refreshMs);\n                })();\n            }\n            console.log('[Dashboard] Initialization complete, loadData() called.');\n        } catch(e) {\n            console.error('[Dashboard] Error during initialization:', e);\n        }\n    };\n\n    vm.setDefaults = function(source, inputValues) {};\n    vm.afterLoad = function() {};\n\n    return vm;\n});\n";
}
function vmExportFn() {
  return "\nfunction exportSwimlane(btn) {\n    var table = btn.closest('.swimlane').querySelector('table');\n    if (!table) return;\n    var rows = Array.from(table.querySelectorAll('tr'));\n    var csv = rows.map(function(r) { return Array.from(r.querySelectorAll('th,td')).map(function(c) { return '\"' + c.textContent.trim().replace(/\"/g, '\"\"') + '\"'; }).join(','); }).join('\\n');\n    var blob = new Blob([csv], {type: 'text/csv'});\n    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'export.csv'; a.click();\n}\n";
}
function generateVM_simple() {
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    container.innerHTML = this.config.swimlanes.map(function(sl) {\n        var rows = self.getRowsForSwimlane(sl);\n        return self.renderSwimlane(sl, rows);\n    }).join('');\n};\n\nDashboardViewModel.prototype.renderSwimlane = function(swimlane, rows) {\n    var self = this;\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rowsHtml = rows.map(function(row) { return self.renderRow(row); }).join('');\n    return '<div class=\"swimlane\">' +\n        '<div class=\"swimlane-header\" onclick=\"toggleSwimlane(this)\">' +\n            '<i class=\"bi bi-chevron-down\"></i>' +\n            '<span>' + _esc(swimlane.name) + '</span>' +\n            '<span class=\"count\">' + rows.length + '</span>' +\n            '<button class=\"export-btn\" onclick=\"event.stopPropagation(); exportSwimlane(this)\">Export</button>' +\n        '</div>' +\n        '<div class=\"swimlane-content\">' +\n            '<table class=\"data-table\"><thead><tr>' + colHeaders + '<th>Actions</th></tr></thead>' +\n            '<tbody>' + rowsHtml + '</tbody></table>' +\n        '</div></div>';\n};\n\nDashboardViewModel.prototype.renderRow = function(row) {\n    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n    return '<tr>' + cells + '<td><a href=\"' + encodeURI(row.url || '#') + '\" target=\"_blank\" class=\"view-btn\"><i class=\"bi bi-eye\"></i> View</a></td></tr>';\n};\n" + vmExportFn() + vmInit();
}
function generateVM_expandable() {
  var detailFields = State.styleConfig.detailFields || [];
  var allFields = getAllFields();
  var detailFieldDefs = detailFields.map(function (id) {
    var f = allFields.find(function (x) {
      return x.id === id || x.id === String(id);
    });
    return f ? {
      field: f.alias || f.id,
      label: f.name
    } : {
      field: id,
      label: String(id)
    };
  });
  var isPdf = State.selectedStyle === 'pdf-signatures';
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.detailFields = ".concat(JSON.stringify(detailFieldDefs), ";\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    container.innerHTML = this.config.swimlanes.map(function(sl) {\n        var rows = self.getRowsForSwimlane(sl);\n        return self.renderSwimlane(sl, rows);\n    }).join('');\n};\n\nDashboardViewModel.prototype.renderSwimlane = function(swimlane, rows) {\n    var self = this;\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rowsHtml = rows.map(function(row) { return self.renderExpandableRow(row); }).join('');\n    return '<div class=\"swimlane\">' +\n        '<div class=\"swimlane-header\" onclick=\"toggleSwimlane(this)\">' +\n            '<i class=\"bi bi-chevron-down\"></i><span>' + _esc(swimlane.name) + '</span><span class=\"count\">' + rows.length + '</span>' +\n            '<button class=\"export-btn\" onclick=\"event.stopPropagation(); exportSwimlane(this)\">Export</button>' +\n        '</div>' +\n        '<div class=\"swimlane-content\"><table class=\"data-table\"><thead><tr><th style=\"width:40px;\"></th>' + colHeaders + '<th>Actions</th></tr></thead>' +\n        '<tbody>' + rowsHtml + '</tbody></table></div></div>';\n};\n\nDashboardViewModel.prototype.renderExpandableRow = function(row) {\n    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n    var detailHtml = this.detailFields.map(function(df) {\n        return '<div class=\"detail-item\"><label>' + _esc(df.label) + '</label><span>' + _esc(row[df.field] || '-') + '</span></div>';\n    }).join('');\n    ").concat(isPdf ? "detailHtml += '<div class=\"detail-item\"><label>Signature</label><div class=\"signature-display\">' + _esc(row.Signature || 'Not signed') + '</div></div>';" : '', "\n    var colSpan = this.config.columns.length + 1;\n    return '<tr class=\"data-row\"><td><button class=\"toggle-btn\" onclick=\"toggleExpandableRow(this)\">+</button></td>' + cells +\n        '<td><a href=\"' + encodeURI(row.url || '#') + '\" target=\"_blank\" class=\"view-btn\"><i class=\"bi bi-eye\"></i> View</a></td></tr>' +\n        '<tr class=\"child-row\" style=\"display:none;\"><td></td><td colspan=\"' + colSpan + '\"><div class=\"detail-grid\">' + detailHtml + '</div></td></tr>' +\n        '<tr class=\"separator-bar\" style=\"display:none;\"><td colspan=\"' + (colSpan + 1) + '\"></td></tr>';\n};\n\nfunction toggleExpandableRow(btn) {\n    var row = btn.closest('tr');\n    var child = row.nextElementSibling;\n    var sep = child.nextElementSibling;\n    var showing = child.style.display === 'none';\n    child.style.display = showing ? '' : 'none';\n    if (sep && sep.classList.contains('separator-bar')) sep.style.display = showing ? '' : 'none';\n    btn.textContent = showing ? '-' : '+';\n}\n") + vmExportFn() + vmInit();
}
function generateVM_alphaSplit() {
  var nameField = State.styleConfig.nameField || 'LastName';
  var allFields = getAllFields();
  var fieldDef = allFields.find(function (f) {
    return f.id === nameField || f.id === String(nameField);
  });
  var fieldAlias = fieldDef ? fieldDef.alias || fieldDef.id : nameField;
  var ranges = State.styleConfig.alphaRanges || [['A', 'H'], ['I', 'P'], ['Q', 'Z']];
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.alphaField = '".concat(escapeJS(String(fieldAlias)), "';\nDashboardViewModel.prototype.alphaRanges = ").concat(JSON.stringify(ranges), ";\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    container.innerHTML = this.alphaRanges.map(function(range) {\n        var label = range[0] + ' \\u2014 ' + range[1];\n        var rows = self.filteredData.filter(function(row) {\n            var val = (row[self.alphaField] || '').charAt(0).toUpperCase();\n            return val >= range[0] && val <= range[1];\n        });\n        return self.renderSwimlane({ name: label }, rows);\n    }).join('');\n};\n\nDashboardViewModel.prototype.renderSwimlane = function(swimlane, rows) {\n    var self = this;\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rowsHtml = rows.map(function(row) {\n        var cells = self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n        return '<tr>' + cells + '<td><a href=\"' + encodeURI(row.url || '#') + '\" target=\"_blank\" class=\"view-btn\"><i class=\"bi bi-eye\"></i> View</a></td></tr>';\n    }).join('');\n    return '<div class=\"swimlane\"><div class=\"swimlane-header\" onclick=\"toggleSwimlane(this)\">' +\n        '<i class=\"bi bi-chevron-down\"></i><span>' + _esc(swimlane.name) + '</span><span class=\"count\">' + rows.length + '</span></div>' +\n        '<div class=\"swimlane-content\"><table class=\"data-table\"><thead><tr>' + colHeaders + '<th>Actions</th></tr></thead>' +\n        '<tbody>' + rowsHtml + '</tbody></table></div></div>';\n};\n") + vmInit();
}
function generateVM_claims() {
  var chips = State.styleConfig.filterChips || ['All'];
  var warn = State.styleConfig.ageBadgeWarning || 30;
  var crit = State.styleConfig.ageBadgeCritical || 60;
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.filterChips = ".concat(JSON.stringify(chips), ";\nDashboardViewModel.prototype.activeChip = 'All';\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    var myItems = this.filteredData.filter(function(r) { return r.ClaimedBy === (DashboardConfig.currentUser || ''); });\n\n    var statsHtml = '<div class=\"personal-stats\"><h6><i class=\"bi bi-person-circle\"></i> Your Stats</h6>' +\n        '<div class=\"stat-row\"><div class=\"stat-item\"><div class=\"stat-value\">' + myItems.length + '</div><div class=\"stat-label\">My Claimed</div></div>' +\n        '<div class=\"stat-item\"><div class=\"stat-value\">' + this.filteredData.length + '</div><div class=\"stat-label\">Total</div></div></div></div>';\n\n    var chipsHtml = this.filterChips.map(function(c) {\n        return '<span class=\"filter-chip ' + (self.activeChip === c ? 'active' : '') + '\" onclick=\"dashboard.setChip(\\'' + _escJS(c) + '\\')\">' + _esc(c) + '</span>';\n    }).join('');\n\n    var actionBar = '<div class=\"action-bar\"><div class=\"action-bar-left\">' +\n        '<button class=\"btn-claim\" onclick=\"dashboard.claimSelected()\"><i class=\"bi bi-hand-index\"></i> Claim Selected</button>' +\n        '<button class=\"btn-unclaim\" onclick=\"dashboard.unclaimSelected()\"><i class=\"bi bi-hand-index-thumb\"></i> Unclaim</button></div>' +\n        '<div class=\"action-bar-right\"><div class=\"quick-filters\">' + chipsHtml + '</div></div></div>';\n\n    var swimlanesHtml = this.config.swimlanes.map(function(sl) {\n        var rows = self.getRowsForSwimlane(sl);\n        return self.renderClaimsSwimlane(sl, rows);\n    }).join('');\n\n    container.innerHTML = statsHtml + actionBar + swimlanesHtml;\n};\n\nDashboardViewModel.prototype.renderClaimsSwimlane = function(swimlane, rows) {\n    var self = this;\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rowsHtml = rows.map(function(row) { return self.renderClaimsRow(row); }).join('');\n    return '<div class=\"swimlane\"><div class=\"swimlane-header\" onclick=\"toggleSwimlane(this)\">' +\n        '<i class=\"bi bi-chevron-down\"></i><span>' + _esc(swimlane.name) + '</span><span class=\"count\">' + rows.length + '</span></div>' +\n        '<div class=\"swimlane-content\"><table class=\"data-table\" style=\"min-width:1100px;\"><thead><tr>' +\n        '<th style=\"width:40px;\"><input type=\"checkbox\" data-notsaved=\"true\" onchange=\"dashboard.toggleAll(this)\"></th><th>Status</th>' + colHeaders + '<th>Age</th><th>Actions</th></tr></thead>' +\n        '<tbody>' + rowsHtml + '</tbody></table></div></div>';\n};\n\nDashboardViewModel.prototype.renderClaimsRow = function(row) {\n    var age = row.AgeDays || 0;\n    var ageBadge = age >= ").concat(crit, " ? 'age-badge-critical' : age >= ").concat(warn, " ? 'age-badge-warning' : 'age-badge-normal';\n    var claimed = row.ClaimedBy ? '<span class=\"badge-claimed\">' + _esc(row.ClaimedBy) + '</span>' : '<span class=\"badge-unclaimed\">Unclaimed</span>';\n    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n    var id = _esc(row.DocumentID || row.FormID || '');\n    return '<tr><td style=\"width:40px;\"><input type=\"checkbox\" class=\"row-checkbox\" data-notsaved=\"true\" data-id=\"' + id + '\"></td>' +\n        '<td>' + claimed + '</td>' + cells +\n        '<td><span class=\"age-badge ' + ageBadge + '\">' + age + 'd</span></td>' +\n        '<td><a href=\"' + encodeURI(row.url || '#') + '\" target=\"_blank\" class=\"view-btn\"><i class=\"bi bi-eye\"></i> View</a></td></tr>';\n};\n\nDashboardViewModel.prototype.setChip = function(chip) {\n    this.activeChip = chip;\n    // Apply chip filter to filteredData\n    this.applyFilters(); // Reset to base filters first\n    if (chip && chip.toLowerCase() !== 'all') {\n        var self = this;\n        // Check if chip is an age filter like \"30+ Days\" or \"60+ Days\"\n        var ageMatch = chip.match(/^(\\d+)\\+?\\s*days?$/i);\n        if (ageMatch) {\n            var minAge = parseInt(ageMatch[1], 10);\n            this.filteredData = this.filteredData.filter(function(r) { return (r.AgeDays || 0) >= minAge; });\n        } else if (chip.toLowerCase().indexOf('my') >= 0 || chip.toLowerCase().indexOf('claimed') >= 0) {\n            // \"My Claims\" style filter\n            this.filteredData = this.filteredData.filter(function(r) { return r.ClaimedBy === (DashboardConfig.currentUser || ''); });\n        } else {\n            // Generic text filter: match chip text against any column value\n            var chipLower = chip.toLowerCase();\n            this.filteredData = this.filteredData.filter(function(r) {\n                return Object.values(r).some(function(v) { return String(v).toLowerCase().indexOf(chipLower) >= 0; });\n            });\n        }\n    }\n    this.render();\n};\nDashboardViewModel.prototype.toggleAll = function(cb) { cb.closest('table').querySelectorAll('.row-checkbox').forEach(function(c) { c.checked = cb.checked; }); };\nDashboardViewModel.prototype.claimSelected = function() {\n    var ids = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(function(c) { return c.dataset.id; });\n    if (ids.length === 0) { showToast('Select items first.', 'warning'); return; }\n    if (typeof integration === 'undefined' || !claimIntegration) { showToast('Claimed ' + ids.length + ' item(s) (no integration configured)'); return; }\n    var self = this; var pending = ids.length; var done = 0;\n    document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'flex');\n    ids.forEach(function(id) {\n        integration.all(claimIntegration, { FormID: id, ClaimedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {\n            done++; if (done === pending) { showToast('Claimed ' + done + ' item(s)', 'success'); document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); _refreshDashboard(1500); }\n        }).catch(function(err) {\n            done++; showToast('Claim failed: ' + (err.message || 'Error'), 'error'); if (done === pending) { document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); }\n        });\n    });\n};\nDashboardViewModel.prototype.unclaimSelected = function() {\n    var ids = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(function(c) { return c.dataset.id; });\n    if (ids.length === 0) { showToast('Select items first.', 'warning'); return; }\n    if (typeof integration === 'undefined' || !unclaimIntegration) { showToast('Released ' + ids.length + ' item(s) (no integration configured)'); return; }\n    var self = this; var pending = ids.length; var done = 0;\n    document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'flex');\n    ids.forEach(function(id) {\n        integration.all(unclaimIntegration, { FormID: id, ClaimedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {\n            done++; if (done === pending) { showToast('Released ' + done + ' item(s)', 'success'); document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); _refreshDashboard(1500); }\n        }).catch(function(err) {\n            done++; showToast('Unclaim failed: ' + (err.message || 'Error'), 'error'); if (done === pending) { document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); }\n        });\n    });\n};\n") + vmInit();
}
function generateVM_workflow() {
  var actionsMap = State.styleConfig.workflowActions || {};
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.workflowActions = ".concat(JSON.stringify(actionsMap), ";\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    container.innerHTML = this.config.swimlanes.map(function(sl) {\n        var rows = self.getRowsForSwimlane(sl);\n        return self.renderWorkflowSwimlane(sl, rows);\n    }).join('') + '<div id=\"confirmationModal\" class=\"confirmation-modal\"><div class=\"modal-content-custom\">' +\n        '<h5 id=\"modalTitle\"></h5><p id=\"modalMessage\"></p>' +\n        '<div class=\"modal-actions\"><button class=\"btn btn-secondary\" onclick=\"hideConfirmationModal()\">Cancel</button>' +\n        '<button class=\"btn btn-primary\" onclick=\"confirmAction()\">Confirm</button></div></div></div>';\n};\n\nDashboardViewModel.prototype.renderWorkflowSwimlane = function(swimlane, rows) {\n    var self = this;\n    var colors = ['#ffc107', '#17a2b8', '#007bff', '#28a745', '#dc3545', '#6f42c1'];\n    var idx = this.config.swimlanes.indexOf(swimlane);\n    var color = colors[idx % colors.length];\n    var textColor = idx === 0 ? '#000' : '#fff';\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rowsHtml = rows.map(function(row) { return self.renderActionRow(row, swimlane.name); }).join('');\n    return '<div class=\"swimlane\"><div class=\"swimlane-header\" onclick=\"toggleSwimlane(this)\" style=\"background:linear-gradient(135deg,' + color + ' 0%,' + color + 'cc 100%);color:' + textColor + ';\">' +\n        '<i class=\"bi bi-chevron-down\"></i><span>' + _esc(swimlane.name) + '</span><span class=\"count\" style=\"background:rgba(0,0,0,0.2);color:#fff;\">' + rows.length + '</span></div>' +\n        '<div class=\"swimlane-content\"><table class=\"data-table\"><thead><tr><th>Actions</th>' + colHeaders + '</tr></thead>' +\n        '<tbody>' + rowsHtml + '</tbody></table></div></div>';\n};\n\nDashboardViewModel.prototype.renderActionRow = function(row, swimlaneName) {\n    var actions = this.workflowActions[swimlaneName] || [];\n    var id = row.DocumentID || row.FormID || '';\n    var btns = actions.map(function(a) {\n        return '<button class=\"btn btn-' + _esc(a.btnStyle) + ' action-btn\" onclick=\"showConfirmationModal(\\'' + _escJS(a.label) + '\\',\\'' + _escJS(id) + '\\')\"><i class=\"bi ' + _esc(a.icon) + '\"></i> ' + _esc(a.label) + '</button>';\n    }).join(' ');\n    var viewBtn = '<button class=\"btn btn-success action-btn\" onclick=\"window.open(\\'' + encodeURI(row.url || '#') + '\\')\"><i class=\"bi bi-eye\"></i></button>';\n    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n    return '<tr><td style=\"white-space:nowrap;\">' + viewBtn + ' ' + btns + '</td>' + cells + '</tr>';\n};\n\nvar _pendingAction = '';\nvar _pendingFormId = '';\nfunction showConfirmationModal(action, formId) {\n    document.getElementById('modalTitle').textContent = 'Confirm: ' + action;\n    document.getElementById('modalMessage').textContent = 'Are you sure you want to perform \"' + action + '\" on this item?';\n    document.getElementById('confirmationModal').classList.add('show');\n    _pendingAction = action;\n    _pendingFormId = formId || '';\n}\nfunction hideConfirmationModal() { document.getElementById('confirmationModal').classList.remove('show'); }\nfunction confirmAction() {\n    hideConfirmationModal();\n    if (typeof integration === 'undefined' || !queueActionIntegration) { showToast(_pendingAction + ' confirmed (no integration configured)'); return; }\n    document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'flex');\n    integration.all(queueActionIntegration, { FormID: _pendingFormId, ActionType: _pendingAction }).then(function(resp) {\n        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');\n        showToast(_pendingAction + ' queued successfully', 'success');\n        var rb = document.getElementById('refreshBtn'); if (rb) setTimeout(function(){ rb.click(); }, 2000);\n    }).catch(function(err) {\n        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');\n        showToast('Action failed: ' + (err.message || 'Error'), 'error');\n    });\n}\n") + vmInit();
}
function generateVM_survey() {
  var sc = State.styleConfig;
  var ratingF = escapeJS(sc.ratingField || 'Rating');
  var commentF = escapeJS(sc.commentField || 'Comments');
  var deptF = escapeJS(sc.departmentField || 'Department');
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.currentView = 'table';\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    var total = this.filteredData.length;\n    var deptSet = {};\n    var ratingSum = 0; var ratingCount = 0;\n    this.filteredData.forEach(function(r) {\n        if (r['".concat(deptF, "']) deptSet[r['").concat(deptF, "']] = true;\n        var v = parseFloat(r['").concat(ratingF, "']);\n        if (!isNaN(v)) { ratingSum += v; ratingCount++; }\n    });\n    var avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 'N/A';\n\n    var statsHtml = '<div class=\"survey-stats-row\">' +\n        '<div class=\"survey-stat-card\"><h3>' + total + '</h3><small>Total Responses</small></div>' +\n        '<div class=\"survey-stat-card\"><h3>' + Object.keys(deptSet).length + '</h3><small>Departments</small></div>' +\n        '<div class=\"survey-stat-card\"><h3>' + avgRating + '</h3><small>Avg Rating</small></div></div>';\n\n    var viewToggle = '<div class=\"action-bar\"><div class=\"action-bar-left\"><strong>View Mode:</strong>' +\n        '<button class=\"btn btn-sm ' + (this.currentView==='table'?'btn-primary':'btn-outline-primary') + '\" onclick=\"dashboard.switchView(\\'table\\')\">Table</button>' +\n        '<button class=\"btn btn-sm ' + (this.currentView==='cards'?'btn-primary':'btn-outline-primary') + '\" onclick=\"dashboard.switchView(\\'cards\\')\">Cards</button></div></div>';\n\n    var viewHtml = this.currentView === 'table' ? this.renderTableView() : this.renderCardsView();\n    container.innerHTML = statsHtml + viewToggle + viewHtml;\n};\n\nDashboardViewModel.prototype.renderTableView = function() {\n    var self = this;\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rows = this.filteredData.map(function(row) {\n        return '<tr>' + self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('') + '</tr>';\n    }).join('');\n    return '<table class=\"data-table\"><thead><tr>' + colHeaders + '</tr></thead><tbody>' + rows + '</tbody></table>';\n};\n\nDashboardViewModel.prototype.renderCardsView = function() {\n    return '<div class=\"survey-cards-grid\">' + this.filteredData.map(function(row) {\n        var rating = row['").concat(ratingF, "'] || 'N/A';\n        var comment = row['").concat(commentF, "'] || '';\n        var dept = row['").concat(deptF, "'] || '';\n        var v = parseFloat(rating);\n        var color = v >= 4 ? '#28a745' : v >= 3 ? '#ffc107' : '#dc3545';\n        return '<div class=\"survey-response-card\" style=\"border-left:4px solid ' + color + ';\">' +\n            '<div style=\"display:flex;justify-content:space-between;margin-bottom:8px;\">' +\n            '<span class=\"badge\" style=\"background:' + color + ';color:#fff;\">' + _esc(rating) + '/5</span>' +\n            '<small style=\"color:#888;\">' + _esc(dept) + '</small></div>' +\n            '<p style=\"font-size:0.9rem;\">' + _esc(comment.substring(0, 200)) + (comment.length > 200 ? '...' : '') + '</p></div>';\n    }).join('') + '</div>';\n};\n\nDashboardViewModel.prototype.switchView = function(view) { this.currentView = view; this.render(); };\n") + vmInit();
}
function generateVM_voting() {
  var members = State.styleConfig.committeeMembers || [];
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.members = ".concat(JSON.stringify(members), ";\nDashboardViewModel.prototype.votes = {};\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n\n    var userBar = '<div class=\"voting-user-bar\"><div><i class=\"bi bi-person-circle me-2\"></i><strong>Logged in as:</strong> ' +\n        _esc(DashboardConfig.currentUser || 'Committee Member') + '</div>' +\n        '<div><span class=\"badge\" style=\"background:rgba(255,255,255,0.2);color:#fff;\"><i class=\"bi bi-inbox me-1\"></i>Pending: <strong>' + this.filteredData.length + '</strong></span></div></div>';\n\n    var memberHeaders = this.members.map(function(m) { return '<th style=\"background:' + _esc(m.color) + ';text-align:center;\">' + _esc(m.name) + '</th>'; }).join('');\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n\n    var rows = this.filteredData.map(function(row) {\n        var id = row.DocumentID || row.FormID || '';\n        var memberCells = self.members.map(function(m) {\n            var vote = (self.votes[id] || {})[m.name] || '';\n            var icon = vote === 'approved' ? '<i class=\"bi bi-check-circle-fill\" style=\"color:#28a745;\"></i>' :\n                       vote === 'denied' ? '<i class=\"bi bi-x-circle-fill\" style=\"color:#dc3545;\"></i>' :\n                       vote === 'more-info' ? '<i class=\"bi bi-question-circle-fill\" style=\"color:#ffc107;\"></i>' : '-';\n            return '<td style=\"background:' + _esc(m.color) + ';text-align:center;\">' + icon + '</td>';\n        }).join('');\n        var cells = self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n        return '<tr><td><button class=\"view-btn\" onclick=\"window.open(\\'' + encodeURI(row.url || '#') + '\\')\"><i class=\"bi bi-eye\"></i> View</button></td>' + cells + memberCells +\n            '<td style=\"white-space:nowrap;\">' +\n            '<button class=\"vote-btn vote-approve\" onclick=\"dashboard.castVote(\\'' + _escJS(id) + '\\',\\'approved\\')\"><i class=\"bi bi-check-circle\"></i></button>' +\n            '<button class=\"vote-btn vote-deny\" onclick=\"dashboard.castVote(\\'' + _escJS(id) + '\\',\\'denied\\')\"><i class=\"bi bi-x-circle\"></i></button>' +\n            '<button class=\"vote-btn vote-info\" onclick=\"dashboard.castVote(\\'' + _escJS(id) + '\\',\\'more-info\\')\"><i class=\"bi bi-question-circle\"></i></button></td></tr>';\n    }).join('');\n\n    container.innerHTML = userBar + '<div style=\"overflow-x:auto;\"><table class=\"data-table\" style=\"min-width:1200px;\"><thead><tr><th>Document</th>' +\n        colHeaders + memberHeaders + '<th>Your Vote</th></tr></thead><tbody>' + rows + '</tbody></table></div>';\n};\n\nDashboardViewModel.prototype.castVote = function(id, decision) {\n    var user = DashboardConfig.currentUser || (this.members[0] ? this.members[0].name : 'You');\n    var self = this;\n    var voteMap = { approved: 'Approve', denied: 'Deny', 'more-info': 'Abstain' };\n    if (typeof integration !== 'undefined' && castVoteIntegration) {\n        integration.all(castVoteIntegration, { DocumentID: id, MemberSlot: (DashboardConfig.memberSlot || 'A'), Vote: (voteMap[decision] || decision), VotedBy: user }).then(function() {\n            showToast('Vote recorded: ' + decision, 'success');\n            _refreshDashboard(1500);\n        }).catch(function(err) { showToast('Vote failed: ' + (err.message || 'Error'), 'error'); });\n    } else {\n        if (!this.votes[id]) this.votes[id] = {};\n        this.votes[id][user] = decision;\n        this.render();\n        showToast('Vote recorded: ' + decision);\n    }\n};\n\n") + vmInit();
}
function generateVM_cards() {
  var sc = State.styleConfig;
  var titleField = escapeJS(sc.cardTitleField || 'Name');
  var statusField = escapeJS(sc.cardStatusField || 'Status');
  var leadField = escapeJS(sc.cardLeadField || 'Lead');
  var budgetField = sc.cardBudgetField ? escapeJS(sc.cardBudgetField) : '';
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var statusCounts = {};\n    this.filteredData.forEach(function(r) { var s = r['".concat(statusField, "'] || 'Unknown'; statusCounts[s] = (statusCounts[s] || 0) + 1; });\n    var total = this.filteredData.length;\n    var statusColors = {'On Track':'#059669','At Risk':'#D97706','Delayed':'#DC2626','Complete':'#006747','Pending':'#6366f1','Approved':'#059669','Denied':'#DC2626'};\n\n    var statusList = Object.entries(statusCounts).map(function(e) {\n        return '<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:4px;\">' +\n            '<div style=\"width:12px;height:12px;border-radius:50%;background:' + (statusColors[e[0]]||'#888') + ';\"></div>' +\n            '<span>' + _esc(e[0]) + ': <strong>' + e[1] + '</strong></span></div>';\n    }).join('');\n\n    var metricsHtml = '<div class=\"cards-metrics-row\">' +\n        '<div class=\"cards-metric-card\"><h6>Status Overview</h6><div class=\"cards-status-list\">' + statusList + '</div></div>' +\n        '<div class=\"cards-metric-card\"><h6>Total Items</h6><div style=\"font-size:2.5rem;font-weight:700;color:var(--primary);\">' + total + '</div></div></div>';\n\n    var cardsHtml = '<div class=\"cards-grid\">' + this.filteredData.map(function(row) {\n        var title = row['").concat(titleField, "'] || 'Untitled';\n        var status = row['").concat(statusField, "'] || 'Unknown';\n        var lead = row['").concat(leadField, "'] || '';\n        ").concat(budgetField ? "var budget = row['".concat(budgetField, "'] || '';") : "var budget = '';", "\n        var color = statusColors[status] || '#888';\n        return '<div class=\"item-card\"><div class=\"item-card-header\"><div><div class=\"item-card-title\">' + _esc(title) + '</div>' +\n            '<div class=\"item-card-meta\">' + (lead ? 'Lead: ' + _esc(lead) : '') + '</div></div>' +\n            '<span class=\"status-badge\" style=\"background:' + color + '15;color:' + color + ';border:1px solid ' + color + '30;\">' + _esc(status) + '</span></div>' +\n            '<div class=\"item-card-body\">' + (budget ? '<small style=\"color:#666;\">Budget: ' + _esc(budget) + '</small>' : '') + '</div></div>';\n    }).join('') + '</div>';\n\n    container.innerHTML = metricsHtml + cardsHtml;\n};\n") + vmInit();
}
function generateVM_bulkActions() {
  var targets = State.styleConfig.reassignTargets || [];
  return vmPreamble() + vmBaseClass() + "\nDashboardViewModel.prototype.reassignTargets = ".concat(JSON.stringify(targets), ";\nDashboardViewModel.prototype.selectedIds = [];\n\nDashboardViewModel.prototype.render = function() {\n    var container = document.getElementById('dashboardContent');\n    if (!container) return;\n    var self = this;\n    var count = this.selectedIds.length;\n\n    var targetsMenu = this.reassignTargets.map(function(t) { return '<a onclick=\"dashboard.bulkReassign(\\'' + _escJS(t) + '\\')\">' + _esc(t) + '</a>'; }).join('');\n    var actionBar = '<div class=\"action-bar\"><div class=\"action-bar-left\">' +\n        '<button class=\"btn btn-success\" onclick=\"dashboard.bulkAction(\\'approve\\')\" ' + (count===0?'disabled':'') + '><i class=\"bi bi-check-circle me-1\"></i>Bulk Approve (' + count + ')</button>' +\n        '<button class=\"btn btn-danger\" onclick=\"dashboard.bulkAction(\\'deny\\')\" ' + (count===0?'disabled':'') + '><i class=\"bi bi-x-circle me-1\"></i>Bulk Deny (' + count + ')</button>' +\n        '<div class=\"reassign-wrapper\"><button class=\"btn btn-info\" onclick=\"toggleReassignMenu()\"><i class=\"bi bi-arrow-repeat me-1\"></i>Reassign</button>' +\n        '<div class=\"reassign-dropdown\" id=\"reassignMenu\" style=\"display:none;\">' + targetsMenu + '</div></div></div>' +\n        '<div class=\"action-bar-right\"><button class=\"btn btn-warning\" onclick=\"dashboard.exportSelected()\"><i class=\"bi bi-download me-1\"></i>Export Selected</button></div></div>';\n\n    var swimlanesHtml = this.config.swimlanes.map(function(sl) {\n        var rows = self.getRowsForSwimlane(sl);\n        return self.renderBulkSwimlane(sl, rows);\n    }).join('');\n\n    container.innerHTML = actionBar + swimlanesHtml;\n};\n\nDashboardViewModel.prototype.renderBulkSwimlane = function(swimlane, rows) {\n    var self = this;\n    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');\n    var rowsHtml = rows.map(function(row) {\n        var id = row.DocumentID || row.FormID || row.RequestID || '';\n        var cells = self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');\n        return '<tr><td><input type=\"checkbox\" class=\"bulk-cb\" data-notsaved=\"true\" data-id=\"' + _esc(id) + '\" onchange=\"dashboard.updateSelection()\"></td>' + cells +\n            '<td><div class=\"row-action-dropdown\"><button class=\"btn btn-sm btn-secondary\" onclick=\"toggleRowMenu(this)\"><i class=\"bi bi-three-dots-vertical\"></i></button>' +\n            '<div class=\"row-action-menu\"><a onclick=\"window.open(\\'' + encodeURI(row.url || '#') + '\\')\">View Details</a>' +\n            '<a onclick=\"dashboard.quickAction(\\'' + _escJS(id) + '\\',\\'approve\\')\">Quick Approve</a>' +\n            '<a onclick=\"dashboard.quickAction(\\'' + _escJS(id) + '\\',\\'deny\\')\">Quick Deny</a></div></div></td></tr>';\n    }).join('');\n    return '<div class=\"swimlane\"><div class=\"swimlane-header\" onclick=\"toggleSwimlane(this)\">' +\n        '<i class=\"bi bi-chevron-down\"></i><span>' + _esc(swimlane.name) + '</span><span class=\"count\">' + rows.length + '</span></div>' +\n        '<div class=\"swimlane-content\"><table class=\"data-table\" style=\"min-width:1200px;\"><thead><tr><th style=\"width:40px;\"><input type=\"checkbox\" data-notsaved=\"true\" onchange=\"dashboard.toggleAllBulk(this)\"></th>' +\n        colHeaders + '<th>Actions</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>';\n};\n\nDashboardViewModel.prototype.updateSelection = function() {\n    this.selectedIds = Array.from(document.querySelectorAll('.bulk-cb:checked')).map(function(c) { return c.dataset.id; });\n    // Update action bar counts without full re-render\n    var btns = document.querySelectorAll('.action-bar .btn');\n    btns.forEach(function(b) { if (b.textContent.match(/\\(\\d+\\)/)) b.disabled = (dashboard.selectedIds.length === 0); });\n};\nDashboardViewModel.prototype.toggleAllBulk = function(cb) {\n    cb.closest('table').querySelectorAll('.bulk-cb').forEach(function(c) { c.checked = cb.checked; });\n    this.updateSelection();\n};\nDashboardViewModel.prototype.bulkAction = function(action) {\n    if (this.selectedIds.length === 0) return;\n    var self = this; var count = this.selectedIds.length;\n    if (typeof integration !== 'undefined' && bulkDecisionIntegration) {\n        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'flex');\n        integration.all(bulkDecisionIntegration, { FormIDs: this.selectedIds.join(','), Decision: action, DecidedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {\n            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');\n            showToast('Bulk ' + action + ' applied to ' + count + ' item(s)', 'success');\n            self.selectedIds = []; _refreshDashboard(1500);\n        }).catch(function(err) {\n            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');\n            showToast('Bulk action failed: ' + (err.message || 'Error'), 'error');\n        });\n    } else { showToast('Bulk ' + action + ' applied to ' + count + ' item(s).', 'success'); self.selectedIds = []; self.render(); }\n};\nDashboardViewModel.prototype.bulkReassign = function(target) {\n    if (this.selectedIds.length === 0) return;\n    var self = this; var count = this.selectedIds.length;\n    document.getElementById('reassignMenu').style.display = 'none';\n    if (typeof integration !== 'undefined' && bulkDecisionIntegration) {\n        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'flex');\n        integration.all(bulkDecisionIntegration, { FormIDs: this.selectedIds.join(','), Decision: 'Reassign', ReassignTarget: target, DecidedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {\n            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');\n            showToast('Reassigned ' + count + ' item(s) to ' + target, 'success');\n            self.selectedIds = []; _refreshDashboard(1500);\n        }).catch(function(err) {\n            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');\n            showToast('Reassign failed: ' + (err.message || 'Error'), 'error');\n        });\n    } else { showToast('Reassigned ' + count + ' item(s) to ' + target, 'success'); self.selectedIds = []; self.render(); }\n};\nDashboardViewModel.prototype.quickAction = function(id, action) {\n    if (typeof integration !== 'undefined' && recordDecisionIntegration) {\n        integration.all(recordDecisionIntegration, { FormID: id, Decision: action, DecidedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {\n            showToast(action + ' recorded', 'success'); _refreshDashboard(1500);\n        }).catch(function(err) { showToast('Action failed: ' + (err.message || 'Error'), 'error'); });\n    } else { showToast(action + ' applied.', 'success'); }\n};\nDashboardViewModel.prototype.exportSelected = function() {\n    if (this.selectedIds.length === 0) { showToast('Select items first.', 'warning'); return; }\n    var self = this;\n    var selected = this.data.filter(function(row) {\n        var id = row.DocumentID || row.FormID || row.RequestID || '';\n        return self.selectedIds.indexOf(String(id)) !== -1;\n    });\n    if (selected.length === 0) { showToast('No matching rows found.', 'warning'); return; }\n    var headers = self.config.columns.map(function(c) { return c.label; });\n    var csvRows = [headers.join(',')];\n    selected.forEach(function(row) {\n        var cells = self.config.columns.map(function(c) { return '\"' + String(row[c.field] || '').replace(/\"/g, '\"\"') + '\"'; });\n        csvRows.push(cells.join(','));\n    });\n    var blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });\n    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'selected_export.csv'; a.click();\n    showToast('Exported ' + selected.length + ' item(s)', 'success');\n};\n\nfunction toggleReassignMenu() { var m = document.getElementById('reassignMenu'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; }\nfunction toggleRowMenu(btn) { document.querySelectorAll('.row-action-menu.show').forEach(function(m) { m.classList.remove('show'); }); btn.nextElementSibling.classList.toggle('show'); }\ndocument.addEventListener('click', function(e) { if (!e.target.closest('.row-action-dropdown')) { document.querySelectorAll('.row-action-menu.show').forEach(function(m) { m.classList.remove('show'); }); } });\n") + vmInit();
}
function renderPreview() {
  var container = document.getElementById('previewContent');
  if (!container) return;
  var title = State.dashboardTitle || 'My Dashboard';
  var style = State.selectedStyle || 'simple-status';
  var styleDef = DashboardStyles.find(function (s) {
    return s.id === style;
  });
  var swimlanes = State.swimlanes.length > 0 ? State.swimlanes : [{
    name: 'In Progress'
  }, {
    name: 'Completed'
  }];
  var columns = [];
  if (State.mode === 'content') {
    var _State$selectedArea4;
    var fields = SimulatedData.keyFields[(_State$selectedArea4 = State.selectedArea) === null || _State$selectedArea4 === void 0 ? void 0 : _State$selectedArea4.id] || [];
    columns = fields.filter(function (f) {
      return State.selectedFields.includes(f.id);
    }).map(function (f) {
      return f.name;
    });
  } else if (State.mode === 'forms') {
    var _State$selectedTempla2;
    var inputs = SimulatedData.formInputIds[(_State$selectedTempla2 = State.selectedTemplate) === null || _State$selectedTempla2 === void 0 ? void 0 : _State$selectedTempla2.id] || [];
    columns = inputs.filter(function (i) {
      return State.selectedInputIds.includes(i.id);
    }).map(function (i) {
      return i.label;
    });
  } else if (State.mode === 'combined') {
    var _State$selectedArea5, _State$selectedTempla3;
    var docFields = SimulatedData.keyFields[(_State$selectedArea5 = State.selectedArea) === null || _State$selectedArea5 === void 0 ? void 0 : _State$selectedArea5.id] || [];
    var formInputs = SimulatedData.formInputIds[(_State$selectedTempla3 = State.selectedTemplate) === null || _State$selectedTempla3 === void 0 ? void 0 : _State$selectedTempla3.id] || [];
    columns = [].concat(_toConsumableArray(docFields.filter(function (f) {
      return State.selectedFields.includes(f.id);
    }).map(function (f) {
      return f.name;
    })), _toConsumableArray(formInputs.filter(function (i) {
      return State.selectedInputIds.includes(i.id);
    }).map(function (i) {
      return i.label;
    })));
  }
  if (columns.length === 0) columns = ['Name', 'Date', 'Status'];
  columns = columns.slice(0, 3);
  var fakeData = generateFakePreviewData(columns);
  var styleIndicator = '';
  var extraPreview = '';
  if (styleDef) {
    styleIndicator = "<div style=\"display:flex;align-items:center;gap:6px;padding:6px 10px;background:#f0f7f4;border-radius:6px;margin-bottom:8px;font-size:0.7rem;color:var(--primary);\">\n            <i class=\"bi ".concat(escapeHtml(styleDef.icon), "\"></i> ").concat(escapeHtml(styleDef.name), "\n        </div>");
  }
  if (style === 'claims') {
    extraPreview = "<div style=\"background:#f8f9fa;border-left:3px solid var(--primary);padding:6px 8px;margin-bottom:6px;border-radius:4px;font-size:0.65rem;\">\n            <strong style=\"color:var(--primary);\">Your Stats</strong>: 2 Claimed | 47 Total\n            <div style=\"margin-top:3px;display:flex;gap:4px;\">\n                ".concat((State.styleConfig.filterChips || ['All']).slice(0, 3).map(function (c, i) {
      return "<span style=\"padding:2px 6px;background:".concat(i === 0 ? 'var(--primary)' : '#e9ecef', ";color:").concat(i === 0 ? '#fff' : '#333', ";border-radius:10px;font-size:0.6rem;\">").concat(escapeHtml(c), "</span>");
    }).join(''), "\n            </div>\n        </div>");
  } else if (style === 'committee-voting') {
    var members = (State.styleConfig.committeeMembers || []).slice(0, 4);
    var memberCols = members.map(function (m) {
      return "<th style=\"background:".concat(escapeHtml(m.color), ";font-size:0.55rem;padding:2px 4px;text-align:center;\">").concat(escapeHtml(m.name.split(' ').pop()), "</th>");
    }).join('');
    extraPreview = "<div style=\"font-size:0.6rem;background:var(--primary);color:#fff;padding:4px 8px;border-radius:4px;margin-bottom:6px;\">Committee Voting | ".concat(escapeHtml(String(members.length)), " Members</div>");
  } else if (style === 'expandable' || style === 'pdf-signatures' || style === 'award-nominations') {
    extraPreview = "<div style=\"font-size:0.6rem;color:#888;margin-bottom:4px;\"><i class=\"bi bi-arrows-expand\"></i> Rows expandable with +/- toggle</div>";
  } else if (style === 'alpha-split') {
    extraPreview = "<div style=\"font-size:0.6rem;color:#888;margin-bottom:4px;\"><i class=\"bi bi-sort-alpha-down\"></i> Auto-split: ".concat((State.styleConfig.alphaRanges || []).map(function (r) {
      return escapeHtml(r[0]) + '-' + escapeHtml(r[1]);
    }).join(', '), "</div>");
  } else if (style === 'workflow-actions') {
    extraPreview = "<div style=\"font-size:0.6rem;color:#888;margin-bottom:4px;\"><i class=\"bi bi-lightning\"></i> Action buttons per swimlane</div>";
  } else if (style === 'survey-analytics') {
    extraPreview = "<div style=\"display:flex;gap:6px;margin-bottom:6px;\">\n            <div style=\"background:#fff;border-left:2px solid var(--primary);padding:4px 8px;border-radius:4px;font-size:0.6rem;text-align:center;\"><strong style=\"color:var(--primary);\">47</strong><br>Responses</div>\n            <div style=\"background:#fff;border-left:2px solid var(--primary);padding:4px 8px;border-radius:4px;font-size:0.6rem;text-align:center;\"><strong style=\"color:var(--primary);\">4.2</strong><br>Avg Rating</div>\n        </div>";
  } else if (style === 'cards-dashboard') {
    extraPreview = "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;\">\n            <div style=\"background:#fff;border:1px solid #e9ecef;border-radius:4px;padding:6px;font-size:0.6rem;\">\n                <div style=\"font-weight:600;\">Item A</div>\n                <span style=\"background:#05966915;color:#059669;padding:1px 4px;border-radius:2px;font-size:0.5rem;\">On Track</span>\n            </div>\n            <div style=\"background:#fff;border:1px solid #e9ecef;border-radius:4px;padding:6px;font-size:0.6rem;\">\n                <div style=\"font-weight:600;\">Item B</div>\n                <span style=\"background:#D9770615;color:#D97706;padding:1px 4px;border-radius:2px;font-size:0.5rem;\">At Risk</span>\n            </div>\n        </div>";
  } else if (style === 'bulk-actions') {
    extraPreview = "<div style=\"background:#f8f9fa;padding:4px 8px;border-radius:4px;margin-bottom:6px;font-size:0.6rem;display:flex;gap:4px;\">\n            <span style=\"background:#28a745;color:#fff;padding:2px 6px;border-radius:3px;\">Approve (0)</span>\n            <span style=\"background:#dc3545;color:#fff;padding:2px 6px;border-radius:3px;\">Deny (0)</span>\n            <span style=\"background:#17a2b8;color:#fff;padding:2px 6px;border-radius:3px;\">Reassign</span>\n        </div>";
  }
  var swimlanesHtml = swimlanes.map(function (sl, idx) {
    var rowCount = idx === 0 ? 3 : 2;
    var rows = fakeData.slice(0, rowCount).map(function (row) {
      return "\n            <tr>".concat(columns.map(function (col) {
        return "<td>".concat(escapeHtml(row[col] || '—'), "</td>");
      }).join(''), "</tr>\n        ");
    }).join('');
    var filterSummary = sl.filters && sl.filters.length > 0 ? sl.filters.map(function (f) {
      return "".concat(escapeHtml(f.fieldName), ": ").concat(f.values.slice(0, 2).map(function (v) {
        return escapeHtml(v);
      }).join(', ')).concat(f.values.length > 2 ? '...' : '');
    }).join(' | ') : '';
    return "\n            <div class=\"preview-swimlane\">\n                <div class=\"preview-swimlane-header\">\n                    <i class=\"bi bi-chevron-down\" style=\"font-size:0.7rem;\"></i>\n                    ".concat(escapeHtml(sl.name), "\n                    <span class=\"count\">").concat(rowCount, "</span>\n                </div>\n                ").concat(filterSummary ? "<div class=\"preview-filter-hint\"><i class=\"bi bi-funnel\"></i> ".concat(filterSummary, "</div>") : '', "\n                <table class=\"preview-table\">\n                    <thead><tr>").concat(columns.map(function (col) {
      return "<th>".concat(escapeHtml(col), "</th>");
    }).join(''), "</tr></thead>\n                    <tbody>").concat(rows, "</tbody>\n                </table>\n            </div>\n        ");
  }).join('');
  container.innerHTML = "\n        <div class=\"preview-label\"><i class=\"bi bi-eye\"></i> Preview</div>\n        <div class=\"preview-dashboard\">\n            <div class=\"preview-dashboard-header\">\n                <h4>".concat(escapeHtml(title), "</h4>\n                <small>").concat(State.mode === 'content' ? 'Document' : State.mode === 'forms' ? 'Forms' : 'Combined', " Dashboard</small>\n            </div>\n            ").concat(styleIndicator, "\n            ").concat(extraPreview, "\n            ").concat(style === 'cards-dashboard' ? '' : swimlanesHtml, "\n        </div>\n    ");
}
function safeName(title) {
  if (!title) return 'Dashboard';
  return title.replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
}
function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}
function needsWriteBack() {
  var s = State.selectedStyle;
  // Only styles that track persistent state (claims, votes) need on-prem SQL.
  // Workflow-actions and bulk-actions use Etrieve's built-in workflow transitions.
  return s === 'claims' || s === 'committee-voting';
}
function generateSchemaSQL() {
  var s = State.selectedStyle;
  if (s === 'claims') return generateSchema_claims();
  if (s === 'committee-voting') return generateSchema_voting();
  if (s === 'workflow-actions') return generateSchema_workflowActions();
  if (s === 'bulk-actions') return generateSchema_bulkActions();
  return '';
}
function generateSchema_claims() {
  var n = safeName(State.dashboardTitle);
  var sql = '';
  sql += '-- ============================================\n';
  sql += '-- ' + escapeSQL(State.dashboardTitle || 'Dashboard') + ' - Claims System Schema\n';
  sql += '-- Generated by Dashboard Builder Wizard\n';
  sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
  sql += '-- ============================================\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_Claims\')\n';
  sql += 'BEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_Claims] (\n';
  sql += '        [ClaimID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [FormID] VARCHAR(50) NOT NULL,\n';
  sql += '        [ClaimedBy] NVARCHAR(100) NULL,\n';
  sql += '        [ClaimedDate] DATETIME NULL,\n';
  sql += '        [UnclaimedDate] DATETIME NULL,\n';
  sql += '        [Status] VARCHAR(20) DEFAULT \'Active\'\n';
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_Claims_FormID ON [dbo].[' + n + '_Claims]([FormID])\n';
  sql += '    CREATE INDEX IX_' + n + '_Claims_Status ON [dbo].[' + n + '_Claims]([Status])\n';
  sql += '    PRINT \'Created table: ' + n + '_Claims\'\n';
  sql += 'END\nGO\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_ClaimsAudit\')\n';
  sql += 'BEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_ClaimsAudit] (\n';
  sql += '        [LogID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [FormID] VARCHAR(50) NULL,\n';
  sql += '        [Action] VARCHAR(20) NULL,\n';
  sql += '        [PerformedBy] NVARCHAR(100) NULL,\n';
  sql += '        [PerformedDate] DATETIME DEFAULT GETDATE()\n';
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_ClaimsAudit_FormID ON [dbo].[' + n + '_ClaimsAudit]([FormID])\n';
  sql += '    PRINT \'Created table: ' + n + '_ClaimsAudit\'\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_ClaimItem]\n';
  sql += '    @FormID VARCHAR(50),\n';
  sql += '    @ClaimedBy NVARCHAR(100)\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    IF EXISTS (SELECT 1 FROM [dbo].[' + n + '_Claims] WHERE [FormID] = @FormID AND [Status] = \'Active\')\n';
  sql += '    BEGIN\n';
  sql += '        SELECT \'{"success": false, "error": "Item already claimed"}\' AS response\n';
  sql += '        RETURN\n';
  sql += '    END\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_Claims] ([FormID], [ClaimedBy], [ClaimedDate], [Status])\n';
  sql += '    VALUES (@FormID, @ClaimedBy, GETDATE(), \'Active\')\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_ClaimsAudit] ([FormID], [Action], [PerformedBy])\n';
  sql += '    VALUES (@FormID, \'Claim\', SYSTEM_USER)\n\n';
  sql += '    SELECT \'{"success": true, "message": "Item claimed"}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_UnclaimItem]\n';
  sql += '    @FormID VARCHAR(50),\n';
  sql += '    @ClaimedBy NVARCHAR(100)\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    UPDATE [dbo].[' + n + '_Claims]\n';
  sql += '    SET [UnclaimedDate] = GETDATE(), [Status] = \'Released\'\n';
  sql += '    WHERE [FormID] = @FormID AND [Status] = \'Active\'\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_ClaimsAudit] ([FormID], [Action], [PerformedBy])\n';
  sql += '    VALUES (@FormID, \'Unclaim\', SYSTEM_USER)\n\n';
  sql += '    SELECT \'{"success": true, "message": "Item released"}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetClaimsStatus]\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    SELECT [ClaimID], [FormID], [ClaimedBy], [ClaimedDate], [Status]\n';
  sql += '    FROM [dbo].[' + n + '_Claims] WHERE [Status] = \'Active\'\n';
  sql += 'END\nGO\n\n';
  return sql;
}
function generateSchema_voting() {
  var n = safeName(State.dashboardTitle);
  var members = State.styleConfig.committeeMembers || [];
  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var sql = '';
  sql += '-- ============================================\n';
  sql += '-- ' + escapeSQL(State.dashboardTitle || 'Dashboard') + ' - Committee Voting Schema\n';
  sql += '-- Generated by Dashboard Builder Wizard\n';
  sql += '-- Committee Members: ' + members.length + '\n';
  sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
  sql += '-- ============================================\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_Votes\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_Votes] (\n';
  sql += '        [VoteID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [DocumentID] VARCHAR(50) NOT NULL,\n';
  for (var i = 0; i < members.length; i++) {
    var L = letters.charAt(i);
    sql += '        [Member' + L + '_Vote] VARCHAR(10) NULL,\n';
    sql += '        [Member' + L + '_VotedBy] NVARCHAR(100) NULL,\n';
    sql += '        [Member' + L + '_Timestamp] DATETIME NULL,\n';
    sql += '        [Member' + L + '_Comment] NVARCHAR(500) NULL,\n';
  }
  sql += '        [VotesComplete] INT DEFAULT 0,\n';
  var appParts = [];
  var denyParts = [];
  var completeParts = [];
  for (var i = 0; i < members.length; i++) {
    var L = letters.charAt(i);
    appParts.push('(CASE WHEN [Member' + L + '_Vote] = \'Approve\' THEN 1 ELSE 0 END)');
    denyParts.push('(CASE WHEN [Member' + L + '_Vote] = \'Deny\' THEN 1 ELSE 0 END)');
    completeParts.push('(CASE WHEN [Member' + L + '_Vote] IS NOT NULL THEN 1 ELSE 0 END)');
  }
  sql += '        [ApproveCount] AS (' + appParts.join(' + ') + ') PERSISTED,\n';
  sql += '        [DenyCount] AS (' + denyParts.join(' + ') + ') PERSISTED,\n';
  sql += '        [FinalDecision] VARCHAR(10) NULL,\n';
  sql += '        [FinalDecisionBy] NVARCHAR(100) NULL,\n';
  sql += '        [FinalDecisionDate] DATETIME NULL,\n';
  sql += '        [FinalDecisionComment] NVARCHAR(500) NULL,\n';
  sql += '        [CreatedDate] DATETIME DEFAULT GETDATE(),\n';
  sql += '        [ModifiedDate] DATETIME DEFAULT GETDATE()\n';
  for (var i = 0; i < members.length; i++) {
    var L = letters.charAt(i);
    sql += '        ,CONSTRAINT CK_' + n + '_M' + L + ' CHECK ([Member' + L + '_Vote] IN (\'Approve\',\'Deny\',\'Abstain\') OR [Member' + L + '_Vote] IS NULL)\n';
  }
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_Votes_DocID ON [dbo].[' + n + '_Votes]([DocumentID])\n';
  sql += '    PRINT \'Created table: ' + n + '_Votes\'\n';
  sql += 'END\nGO\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_Members\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_Members] (\n';
  sql += '        [MemberID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [MemberSlot] VARCHAR(10) NOT NULL,\n';
  sql += '        [Username] NVARCHAR(100) NULL,\n';
  sql += '        [DisplayName] NVARCHAR(100) NULL,\n';
  sql += '        [Email] NVARCHAR(100) NULL,\n';
  sql += '        [IsChair] BIT DEFAULT 0,\n';
  sql += '        [IsActive] BIT DEFAULT 1\n';
  sql += '    )\n';
  sql += '    CREATE UNIQUE INDEX IX_' + n + '_Members_Slot ON [dbo].[' + n + '_Members]([MemberSlot])\n\n';
  sql += '    -- Seed placeholder data (update Username/Email before use)\n';
  for (var i = 0; i < members.length; i++) {
    var L = letters.charAt(i);
    var mName = escapeSQL(members[i].name || 'Member ' + L);
    sql += '    INSERT INTO [dbo].[' + n + '_Members] ([MemberSlot],[DisplayName],[IsChair],[IsActive]) VALUES (\'' + L + '\',\'' + mName + '\',' + (i === 0 ? '1' : '0') + ',1)\n';
  }
  sql += '    PRINT \'Created table: ' + n + '_Members\'\n';
  sql += 'END\nGO\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_VoteHistory\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_VoteHistory] (\n';
  sql += '        [HistoryID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [VoteID] INT NULL,\n';
  sql += '        [DocumentID] VARCHAR(50) NULL,\n';
  sql += '        [Action] VARCHAR(50) NULL,\n';
  sql += '        [MemberSlot] VARCHAR(10) NULL,\n';
  sql += '        [OldValue] VARCHAR(50) NULL,\n';
  sql += '        [NewValue] VARCHAR(50) NULL,\n';
  sql += '        [PerformedBy] NVARCHAR(100) NULL,\n';
  sql += '        [PerformedDate] DATETIME DEFAULT GETDATE()\n';
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_VoteHist_DocID ON [dbo].[' + n + '_VoteHistory]([DocumentID])\n';
  sql += '    PRINT \'Created table: ' + n + '_VoteHistory\'\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_CastVote]\n';
  sql += '    @DocumentID VARCHAR(50),\n    @MemberSlot VARCHAR(10),\n    @Vote VARCHAR(10),\n';
  sql += '    @VotedBy NVARCHAR(100),\n    @Comment NVARCHAR(500) = NULL\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n';
  sql += '    DECLARE @VoteID INT, @OldVote VARCHAR(10), @SQL NVARCHAR(MAX)\n\n';
  sql += '    -- Validate @MemberSlot against Members table to prevent SQL injection\n';
  sql += '    IF NOT EXISTS (SELECT 1 FROM [dbo].[' + n + '_Members] WHERE [MemberSlot] = @MemberSlot AND [IsActive] = 1)\n';
  sql += '    BEGIN\n';
  sql += '        SELECT \'{"success": false, "error": "Invalid member slot"}\' AS response\n';
  sql += '        RETURN\n';
  sql += '    END\n\n';
  sql += '    -- Auto-create vote record if not exists\n';
  sql += '    IF NOT EXISTS (SELECT 1 FROM [dbo].[' + n + '_Votes] WHERE [DocumentID] = @DocumentID)\n';
  sql += '        INSERT INTO [dbo].[' + n + '_Votes] ([DocumentID]) VALUES (@DocumentID)\n\n';
  sql += '    SELECT @VoteID = [VoteID] FROM [dbo].[' + n + '_Votes] WHERE [DocumentID] = @DocumentID\n\n';
  sql += '    -- Get old vote for audit\n';
  sql += '    SET @SQL = N\'SELECT @OldVote = [Member\' + @MemberSlot + \'_Vote] FROM [dbo].[' + n + '_Votes] WHERE [VoteID] = @VoteID\'\n';
  sql += '    EXEC sp_executesql @SQL, N\'@VoteID INT, @OldVote VARCHAR(10) OUTPUT\', @VoteID, @OldVote OUTPUT\n\n';
  sql += '    -- Update vote\n';
  sql += '    SET @SQL = N\'UPDATE [dbo].[' + n + '_Votes] SET \' +\n';
  sql += '        N\'[Member\' + @MemberSlot + \'_Vote] = @Vote, \' +\n';
  sql += '        N\'[Member\' + @MemberSlot + \'_VotedBy] = @VotedBy, \' +\n';
  sql += '        N\'[Member\' + @MemberSlot + \'_Timestamp] = GETDATE(), \' +\n';
  sql += '        N\'[Member\' + @MemberSlot + \'_Comment] = @Comment, \' +\n';
  sql += '        N\'[ModifiedDate] = GETDATE() WHERE [VoteID] = @VoteID\'\n';
  sql += '    EXEC sp_executesql @SQL, N\'@Vote VARCHAR(10), @VotedBy NVARCHAR(100), @Comment NVARCHAR(500), @VoteID INT\',\n';
  sql += '        @Vote, @VotedBy, @Comment, @VoteID\n\n';
  sql += '    -- Recalculate VotesComplete\n';
  sql += '    UPDATE [dbo].[' + n + '_Votes] SET [VotesComplete] = (' + completeParts.join(' + ') + ')\n';
  sql += '    WHERE [VoteID] = @VoteID\n\n';
  sql += '    -- Audit\n';
  sql += '    INSERT INTO [dbo].[' + n + '_VoteHistory] ([VoteID],[DocumentID],[Action],[MemberSlot],[OldValue],[NewValue],[PerformedBy])\n';
  sql += '    VALUES (@VoteID, @DocumentID, CASE WHEN @OldVote IS NULL THEN \'VoteCast\' ELSE \'VoteChanged\' END, @MemberSlot, @OldVote, @Vote, SYSTEM_USER)\n\n';
  sql += '    SELECT \'{"success": true}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_FinalDecision]\n';
  sql += '    @DocumentID VARCHAR(50),\n    @Decision VARCHAR(10),\n    @DecisionBy NVARCHAR(100),\n    @Comment NVARCHAR(500) = NULL\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n';
  sql += '    DECLARE @VoteID INT, @VotesComplete INT\n\n';
  sql += '    SELECT @VoteID = [VoteID], @VotesComplete = [VotesComplete] FROM [dbo].[' + n + '_Votes] WHERE [DocumentID] = @DocumentID\n\n';
  sql += '    IF @VoteID IS NULL BEGIN SELECT \'{"success": false, "error": "Vote record not found"}\' AS response RETURN END\n';
  sql += '    IF @VotesComplete < ' + members.length + ' BEGIN SELECT \'{"success": false, "error": "Not all members have voted"}\' AS response RETURN END\n\n';
  sql += '    UPDATE [dbo].[' + n + '_Votes] SET [FinalDecision] = @Decision, [FinalDecisionBy] = @DecisionBy,\n';
  sql += '        [FinalDecisionDate] = GETDATE(), [FinalDecisionComment] = @Comment, [ModifiedDate] = GETDATE()\n';
  sql += '    WHERE [VoteID] = @VoteID\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_VoteHistory] ([VoteID],[DocumentID],[Action],[NewValue],[PerformedBy])\n';
  sql += '    VALUES (@VoteID, @DocumentID, \'FinalDecision\', @Decision, SYSTEM_USER)\n\n';
  sql += '    SELECT \'{"success": true}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetDashboard]\n    @StatusFilter VARCHAR(20) = NULL\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    SELECT *, CASE\n';
  sql += '        WHEN [FinalDecision] IS NOT NULL THEN \'Completed\'\n';
  sql += '        WHEN [VotesComplete] = ' + members.length + ' THEN \'Ready for Decision\'\n';
  sql += '        WHEN [VotesComplete] > 0 THEN \'In Progress\'\n';
  sql += '        ELSE \'Pending\'\n';
  sql += '    END AS [DashboardStatus],\n';
  sql += '    CAST([ApproveCount] AS VARCHAR) + \' Approve, \' + CAST([DenyCount] AS VARCHAR) + \' Deny\' AS [VoteSummary]\n';
  sql += '    FROM [dbo].[' + n + '_Votes]\n';
  sql += '    ORDER BY [ModifiedDate] DESC\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetUserInfo]\n    @Username NVARCHAR(100), @DocumentID VARCHAR(50)\nAS\nBEGIN\n    SET NOCOUNT ON;\n';
  sql += '    DECLARE @MemberSlot VARCHAR(10), @IsChair BIT, @CurrentVote VARCHAR(10), @SQL NVARCHAR(MAX)\n\n';
  sql += '    SELECT @MemberSlot = [MemberSlot], @IsChair = [IsChair] FROM [dbo].[' + n + '_Members] WHERE [Username] = @Username AND [IsActive] = 1\n\n';
  sql += '    -- @MemberSlot comes from Members table lookup (trusted), but validate anyway\n';
  sql += '    IF @MemberSlot IS NOT NULL AND @MemberSlot LIKE \'[A-Z]\' BEGIN\n';
  sql += '        SET @SQL = N\'SELECT @CV = [Member\' + @MemberSlot + \'_Vote] FROM [dbo].[' + n + '_Votes] WHERE [DocumentID] = @DocID\'\n';
  sql += '        EXEC sp_executesql @SQL, N\'@DocID VARCHAR(50), @CV VARCHAR(10) OUTPUT\', @DocumentID, @CurrentVote OUTPUT\n';
  sql += '    END\n\n';
  sql += '    SELECT CASE WHEN @MemberSlot IS NOT NULL THEN 1 ELSE 0 END AS [CanVote],\n';
  sql += '        ISNULL(@IsChair,0) AS [IsChair], @MemberSlot AS [MemberSlot], @CurrentVote AS [CurrentVote]\n';
  sql += 'END\nGO\n\n';
  return sql;
}
function generateSchema_workflowActions() {
  var n = safeName(State.dashboardTitle);
  var sql = '';
  sql += '-- ============================================\n';
  sql += '-- ' + escapeSQL(State.dashboardTitle || 'Dashboard') + ' - Workflow Actions Schema\n';
  sql += '-- Generated by Dashboard Builder Wizard\n';
  sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
  sql += '-- ============================================\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_ActionQueue\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_ActionQueue] (\n';
  sql += '        [QueueID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [FormID] VARCHAR(50) NOT NULL,\n';
  sql += '        [ActionType] VARCHAR(50) NOT NULL,\n';
  sql += '        [ActionParams] NVARCHAR(MAX) NULL,\n';
  sql += '        [Status] VARCHAR(20) DEFAULT \'Pending\',\n';
  sql += '        [Result] NVARCHAR(MAX) NULL,\n';
  sql += '        [CreatedBy] NVARCHAR(100) NULL,\n';
  sql += '        [CreatedDate] DATETIME DEFAULT GETDATE(),\n';
  sql += '        [ProcessedDate] DATETIME NULL\n';
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_AQ_Status ON [dbo].[' + n + '_ActionQueue]([Status],[CreatedDate])\n';
  sql += '    CREATE INDEX IX_' + n + '_AQ_FormID ON [dbo].[' + n + '_ActionQueue]([FormID])\n';
  sql += '    PRINT \'Created table: ' + n + '_ActionQueue\'\n';
  sql += 'END\nGO\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_ActionLog\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_ActionLog] (\n';
  sql += '        [LogID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [FormID] VARCHAR(50) NULL,\n';
  sql += '        [ActionType] VARCHAR(50) NULL,\n';
  sql += '        [Details] NVARCHAR(MAX) NULL,\n';
  sql += '        [PerformedBy] NVARCHAR(100) NULL,\n';
  sql += '        [PerformedDate] DATETIME DEFAULT GETDATE()\n';
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_AL_FormID ON [dbo].[' + n + '_ActionLog]([FormID])\n';
  sql += '    PRINT \'Created table: ' + n + '_ActionLog\'\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_QueueAction]\n';
  sql += '    @FormID VARCHAR(50), @ActionType VARCHAR(50), @ActionParams NVARCHAR(MAX) = NULL\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n    DECLARE @QueueID INT\n\n';
  sql += '    IF EXISTS (SELECT 1 FROM [dbo].[' + n + '_ActionQueue] WHERE [FormID] = @FormID AND [ActionType] = @ActionType AND [Status] = \'Pending\')\n';
  sql += '    BEGIN SELECT \'{"success": false, "error": "Duplicate pending action"}\' AS response RETURN END\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_ActionQueue] ([FormID],[ActionType],[ActionParams],[CreatedBy]) VALUES (@FormID, @ActionType, @ActionParams, SYSTEM_USER)\n';
  sql += '    SET @QueueID = SCOPE_IDENTITY()\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_ActionLog] ([FormID],[ActionType],[Details],[PerformedBy]) VALUES (@FormID, @ActionType, \'Queued\', SYSTEM_USER)\n\n';
  sql += '    SELECT \'{"success": true, "queueId": \' + CAST(@QueueID AS VARCHAR) + \'}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetPendingActions]\n    @MaxItems INT = 10\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    UPDATE TOP (@MaxItems) [dbo].[' + n + '_ActionQueue]\n';
  sql += '    SET [Status] = \'Processing\', [ProcessedDate] = GETDATE()\n';
  sql += '    OUTPUT inserted.[QueueID], inserted.[FormID], inserted.[ActionType], inserted.[ActionParams]\n';
  sql += '    WHERE [Status] = \'Pending\' ORDER BY [CreatedDate] ASC\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_CompleteAction]\n    @QueueID INT, @Success BIT, @Result NVARCHAR(MAX) = NULL\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    UPDATE [dbo].[' + n + '_ActionQueue] SET [Status] = CASE WHEN @Success = 1 THEN \'Completed\' ELSE \'Failed\' END,\n';
  sql += '        [Result] = @Result, [ProcessedDate] = GETDATE() WHERE [QueueID] = @QueueID\n\n';
  sql += '    SELECT \'{"success": true}\' AS response\n';
  sql += 'END\nGO\n\n';
  return sql;
}
function generateSchema_bulkActions() {
  var n = safeName(State.dashboardTitle);
  var sql = '';
  sql += '-- ============================================\n';
  sql += '-- ' + escapeSQL(State.dashboardTitle || 'Dashboard') + ' - Bulk Actions Schema\n';
  sql += '-- Generated by Dashboard Builder Wizard\n';
  sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
  sql += '-- ============================================\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_Decisions\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_Decisions] (\n';
  sql += '        [DecisionID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [FormID] VARCHAR(50) NOT NULL,\n';
  sql += '        [Decision] VARCHAR(20) NOT NULL,\n';
  sql += '        [ReassignTarget] NVARCHAR(100) NULL,\n';
  sql += '        [DecidedBy] NVARCHAR(100) NULL,\n';
  sql += '        [DecidedDate] DATETIME DEFAULT GETDATE(),\n';
  sql += '        [Comment] NVARCHAR(500) NULL,\n';
  sql += '        CONSTRAINT CK_' + n + '_Decision CHECK ([Decision] IN (\'Approve\',\'Deny\',\'Reassign\'))\n';
  sql += '    )\n';
  sql += '    CREATE UNIQUE INDEX IX_' + n + '_Dec_FormID ON [dbo].[' + n + '_Decisions]([FormID])\n';
  sql += '    PRINT \'Created table: ' + n + '_Decisions\'\n';
  sql += 'END\nGO\n\n';
  sql += 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = \'' + n + '_DecisionLog\')\nBEGIN\n';
  sql += '    CREATE TABLE [dbo].[' + n + '_DecisionLog] (\n';
  sql += '        [LogID] INT PRIMARY KEY IDENTITY(1,1),\n';
  sql += '        [FormID] VARCHAR(50) NULL,\n';
  sql += '        [Action] VARCHAR(50) NULL,\n';
  sql += '        [Details] NVARCHAR(MAX) NULL,\n';
  sql += '        [PerformedBy] NVARCHAR(100) NULL,\n';
  sql += '        [PerformedDate] DATETIME DEFAULT GETDATE()\n';
  sql += '    )\n';
  sql += '    CREATE INDEX IX_' + n + '_DL_FormID ON [dbo].[' + n + '_DecisionLog]([FormID])\n';
  sql += '    PRINT \'Created table: ' + n + '_DecisionLog\'\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_RecordDecision]\n';
  sql += '    @FormID VARCHAR(50), @Decision VARCHAR(20), @DecidedBy NVARCHAR(100),\n';
  sql += '    @ReassignTarget NVARCHAR(100) = NULL, @Comment NVARCHAR(500) = NULL\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    IF @Decision = \'Reassign\' AND @ReassignTarget IS NULL\n';
  sql += '    BEGIN SELECT \'{"success": false, "error": "Reassign target required"}\' AS response RETURN END\n\n';
  sql += '    IF EXISTS (SELECT 1 FROM [dbo].[' + n + '_Decisions] WHERE [FormID] = @FormID)\n';
  sql += '        UPDATE [dbo].[' + n + '_Decisions] SET [Decision] = @Decision, [ReassignTarget] = @ReassignTarget,\n';
  sql += '            [DecidedBy] = @DecidedBy, [DecidedDate] = GETDATE(), [Comment] = @Comment WHERE [FormID] = @FormID\n';
  sql += '    ELSE\n';
  sql += '        INSERT INTO [dbo].[' + n + '_Decisions] ([FormID],[Decision],[ReassignTarget],[DecidedBy],[Comment])\n';
  sql += '        VALUES (@FormID, @Decision, @ReassignTarget, @DecidedBy, @Comment)\n\n';
  sql += '    INSERT INTO [dbo].[' + n + '_DecisionLog] ([FormID],[Action],[Details],[PerformedBy])\n';
  sql += '    VALUES (@FormID, \'Decision\', @Decision + \' by \' + @DecidedBy, SYSTEM_USER)\n\n';
  sql += '    SELECT \'{"success": true}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_BulkDecision]\n';
  sql += '    @FormIDs NVARCHAR(MAX), @Decision VARCHAR(20), @DecidedBy NVARCHAR(100),\n';
  sql += '    @ReassignTarget NVARCHAR(100) = NULL, @Comment NVARCHAR(500) = NULL\n';
  sql += 'AS\nBEGIN\n    SET NOCOUNT ON;\n    DECLARE @Count INT = 0\n\n';
  sql += '    -- Process each FormID from CSV\n';
  sql += '    DECLARE @ID VARCHAR(50)\n';
  sql += '    DECLARE cur CURSOR FOR SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@FormIDs, \',\') WHERE LTRIM(RTRIM(value)) <> \'\'\n';
  sql += '    OPEN cur FETCH NEXT FROM cur INTO @ID\n';
  sql += '    WHILE @@FETCH_STATUS = 0 BEGIN\n';
  sql += '        IF EXISTS (SELECT 1 FROM [dbo].[' + n + '_Decisions] WHERE [FormID] = @ID)\n';
  sql += '            UPDATE [dbo].[' + n + '_Decisions] SET [Decision]=@Decision,[ReassignTarget]=@ReassignTarget,[DecidedBy]=@DecidedBy,[DecidedDate]=GETDATE(),[Comment]=@Comment WHERE [FormID]=@ID\n';
  sql += '        ELSE\n';
  sql += '            INSERT INTO [dbo].[' + n + '_Decisions] ([FormID],[Decision],[ReassignTarget],[DecidedBy],[Comment]) VALUES (@ID,@Decision,@ReassignTarget,@DecidedBy,@Comment)\n';
  sql += '        INSERT INTO [dbo].[' + n + '_DecisionLog] ([FormID],[Action],[Details],[PerformedBy]) VALUES (@ID,\'BulkDecision\',@Decision,SYSTEM_USER)\n';
  sql += '        SET @Count = @Count + 1\n';
  sql += '        FETCH NEXT FROM cur INTO @ID\n';
  sql += '    END\n    CLOSE cur DEALLOCATE cur\n\n';
  sql += '    SELECT \'{"success": true, "count": \' + CAST(@Count AS VARCHAR) + \'}\' AS response\n';
  sql += 'END\nGO\n\n';
  sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetDecisionStatus]\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
  sql += '    SELECT [DecisionID],[FormID],[Decision],[ReassignTarget],[DecidedBy],[DecidedDate],[Comment]\n';
  sql += '    FROM [dbo].[' + n + '_Decisions] ORDER BY [DecidedDate] DESC\n';
  sql += 'END\nGO\n\n';
  return sql;
}
function generateIntegrationInstructions() {
  var n = safeName(State.dashboardTitle);
  var s = State.selectedStyle;
  var instructions = [];
  if (s === 'claims') {
    instructions.push({
      name: n + '_ClaimItem',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_ClaimItem @FormID, @ClaimedBy',
      desc: 'Claim an item (called by Claim button)'
    });
    instructions.push({
      name: n + '_UnclaimItem',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_UnclaimItem @FormID, @ClaimedBy',
      desc: 'Release a claim (called by Unclaim button)'
    });
    instructions.push({
      name: n + '_GetClaims',
      method: 'GET',
      sql: 'EXEC sp_' + n + '_GetClaimsStatus',
      desc: 'Read active claims (join with form data)'
    });
  } else if (s === 'committee-voting') {
    instructions.push({
      name: n + '_CastVote',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_CastVote @DocumentID, @MemberSlot, @Vote, @VotedBy, @Comment',
      desc: 'Cast or change a vote'
    });
    instructions.push({
      name: n + '_FinalDecision',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_FinalDecision @DocumentID, @Decision, @DecisionBy, @Comment',
      desc: 'Submit final decision (Chair only)'
    });
    instructions.push({
      name: n + '_GetDashboard',
      method: 'GET',
      sql: 'EXEC sp_' + n + '_GetDashboard',
      desc: 'Read dashboard data with vote status'
    });
    instructions.push({
      name: n + '_GetUserInfo',
      method: 'GET',
      sql: 'EXEC sp_' + n + '_GetUserInfo @Username, @DocumentID',
      desc: 'Check if user can vote and their current vote'
    });
  } else if (s === 'workflow-actions') {
    instructions.push({
      name: n + '_QueueAction',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_QueueAction @FormID, @ActionType, @ActionParams',
      desc: 'Queue a workflow action'
    });
    instructions.push({
      name: n + '_GetPending',
      method: 'GET',
      sql: 'EXEC sp_' + n + '_GetPendingActions',
      desc: 'Get pending queue items (for PowerShell agent)'
    });
    instructions.push({
      name: n + '_CompleteAction',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_CompleteAction @QueueID, @Success, @Result',
      desc: 'Mark queue item complete (called by agent)'
    });
  } else if (s === 'bulk-actions') {
    instructions.push({
      name: n + '_RecordDecision',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_RecordDecision @FormID, @Decision, @DecidedBy, @ReassignTarget, @Comment',
      desc: 'Record a single decision'
    });
    instructions.push({
      name: n + '_BulkDecision',
      method: 'POST',
      sql: 'EXEC sp_' + n + '_BulkDecision @FormIDs, @Decision, @DecidedBy, @ReassignTarget, @Comment',
      desc: 'Record bulk decisions (comma-separated FormIDs)'
    });
    instructions.push({
      name: n + '_GetDecisions',
      method: 'GET',
      sql: 'EXEC sp_' + n + '_GetDecisionStatus',
      desc: 'Read all decisions (join with form data)'
    });
  }
  return instructions;
}
function renderStyleStep() {
  var categories = ['Basic', 'Advanced', 'Specialized'];
  var html = "\n        <div class=\"step-description\">\n            <p><i class=\"bi bi-lightbulb\" style=\"color:var(--accent);margin-right:8px;\"></i>\n            Each style includes different features and layouts. Pick the one that best matches your workflow.</p>\n        </div>\n    ";
  categories.forEach(function (cat) {
    var styles = DashboardStyles.filter(function (s) {
      return s.category === cat;
    });
    html += "<div class=\"style-category-label\">".concat(cat, "</div>\n                 <div class=\"style-grid\">");
    styles.forEach(function (s) {
      var selected = State.selectedStyle === s.id;
      var sqlBadge = getStyleBadgeHTML(s.id);
      html += "\n                <div class=\"style-select-card ".concat(selected ? 'selected' : '', "\" onclick=\"selectStyle('").concat(escapeJS(s.id), "')\">\n                    <div class=\"style-select-icon\"><i class=\"bi ").concat(escapeHtml(s.icon), "\"></i></div>\n                    <div class=\"style-select-info\">\n                        <div class=\"style-select-name\">").concat(escapeHtml(s.name)).concat(sqlBadge ? ' ' + sqlBadge : '', "</div>\n                        <div class=\"style-select-desc\">").concat(escapeHtml(s.description), "</div>\n                        <div class=\"style-select-best\"><strong>Best for:</strong> ").concat(escapeHtml(s.bestFor), "</div>\n                    </div>\n                    ").concat(selected ? '<div class="style-select-check"><i class="bi bi-check-circle-fill"></i></div>' : '', "\n                </div>\n            ");
    });
    html += '</div>';
  });
  return html;
}
var _baseRenderGenerateStep = null;
(function () {})();
function _buildBaseGenerateStep() {
  var sql = State.customSQL || generateSQL();
  var summary = [];
  summary.push('<strong>Dashboard Name:</strong> ' + escapeHtml(State.dashboardTitle || 'Untitled Dashboard'));
  if (State.advancedMode) {
    summary.push('<strong>Source Name:</strong> <code>' + escapeHtml(State.sourceName) + '</code>');
  }
  if (State.mode === 'content' && State.selectedArea) {
    summary.push('<strong>Folder:</strong> ' + escapeHtml(State.selectedArea.name));
    summary.push('<strong>Document Types:</strong> ' + State.selectedDocTypes.length + ' selected');
    summary.push('<strong>Columns:</strong> ' + State.selectedFields.length + ' fields');
  } else if (State.mode === 'forms' && State.selectedTemplate) {
    summary.push('<strong>Form:</strong> ' + escapeHtml(State.selectedTemplate.name));
    summary.push('<strong>Fields:</strong> ' + State.selectedInputIds.length + ' selected');
    summary.push('<strong>Workflow Steps:</strong> ' + State.selectedWorkflowSteps.length + ' tracked');
  } else if (State.mode === 'combined') {
    if (State.selectedArea) {
      summary.push('<strong>Document Folder:</strong> ' + escapeHtml(State.selectedArea.name));
      summary.push('<strong>Document Types:</strong> ' + State.selectedDocTypes.length + ' selected');
      summary.push('<strong>Document Fields:</strong> ' + State.selectedFields.length + ' fields');
    }
    if (State.selectedTemplate) {
      summary.push('<strong>Form:</strong> ' + escapeHtml(State.selectedTemplate.name));
      summary.push('<strong>Form Fields:</strong> ' + State.selectedInputIds.length + ' selected');
    }
    if (State.selectedWorkflowSteps.length > 0) {
      summary.push('<strong>Workflow Steps:</strong> ' + State.selectedWorkflowSteps.length + ' tracked');
    }
  }
  summary.push('<strong>Groups:</strong> ' + State.swimlanes.map(function (s) {
    return escapeHtml(s.name);
  }).join(', '));
  // Security summary
  if (State.securityConfig && State.securityConfig.enabled) {
    summary.push('<strong>Access Control:</strong> <span style="color:#059669;">Enabled (security-first)</span>');
    if (State.securityConfig.powerGroupName) {
      summary.push('<strong>Power Group:</strong> ' + escapeHtml(State.securityConfig.powerGroupName));
    }
    var securedLanes = (State.securityConfig.swimlaneGroups || []).filter(function(g) { return g.groupId; }).length;
    if (securedLanes > 0) {
      summary.push('<strong>Secured Swimlanes:</strong> ' + securedLanes + ' of ' + State.swimlanes.length);
    }
  } else {
    summary.push('<strong>Access Control:</strong> <span style="color:#888;">Disabled (all users see all data)</span>');
  }
  if (State.advancedMode) {
    return '\
            <div class="step-description" style="background:rgba(40,167,69,0.1);border-color:var(--success);">\
                <p><i class="bi bi-check-circle-fill" style="color:var(--success);margin-right:8px;"></i>\
                Your dashboard is ready! Review and customize the SQL below.</p>\
            </div>\
            <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">\
                <h4 style="margin-bottom:15px;color:var(--primary);"><i class="bi bi-clipboard-check"></i> Summary</h4>\
                <div style="line-height:2;">' + summary.map(function (s) {
      return '<div>' + s + '</div>';
    }).join('') + '</div>\
            </div>\
            <!-- writeback-insert-point -->\
            <div class="advanced-section active">\
                <h5><i class="bi bi-code-slash"></i> SQL Query Editor</h5>\
                <div class="editor-toolbar">\
                    <button onclick="resetSQL()" title="Reset to generated SQL"><i class="bi bi-arrow-counterclockwise"></i> Reset</button>\
                    <button onclick="copySQL(event)" title="Copy to clipboard"><i class="bi bi-clipboard"></i> Copy</button>\
                    <button onclick="formatSQL()" title="Format SQL"><i class="bi bi-text-indent-left"></i> Format</button>\
                    ' + (State.customSQL ? '<span style="margin-left:auto;color:var(--accent);font-size:0.8rem;"><i class="bi bi-pencil"></i> Modified</span>' : '') + '\
                </div>\
                <textarea class="sql-editor" id="sqlEditor" oninput="State.customSQL = this.value" spellcheck="false">' + escapeHtml(sql) + '</textarea>\
                <small style="color:#666;display:block;margin-top:10px;"><i class="bi bi-info-circle"></i> Edit the SQL directly. Changes will be included in your download.</small>\
            </div>\
            <div class="info-box" style="background:rgba(23,162,184,0.08);margin-top:20px;">\
                <h4><i class="bi bi-arrow-right-circle"></i> What happens next?</h4>\
                <ol style="line-height:2;margin:10px 0 0 0;padding-left:20px;">\
                    <li>Click <strong>Download Dashboard</strong> below</li>\
                    <li>Create Source in Etrieve Central: <code>' + escapeHtml(State.sourceName) + '</code></li>\
                    <li>Paste your SQL query into the Source</li>\
                    <li>Upload the dashboard files</li>\
                </ol>\
            </div>\
            <div class="advanced-toggle" style="margin-top:20px;">\
                <label><input type="checkbox" ' + (State.advancedMode ? 'checked' : '') + ' onchange="toggleAdvancedMode(this.checked)"><span>Advanced Mode</span></label>\
                <span class="badge-advanced">Power User</span>\
            </div>';
  }
  return '\
        <div class="step-description" style="background:rgba(40,167,69,0.1);border-color:var(--success);">\
            <p><i class="bi bi-check-circle-fill" style="color:var(--success);margin-right:8px;"></i>\
            Your dashboard is ready! Review the summary below and download your files.</p>\
        </div>\
        <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">\
            <h4 style="margin-bottom:15px;color:var(--primary);"><i class="bi bi-clipboard-check"></i> Summary</h4>\
            <div style="line-height:2;">' + summary.map(function (s) {
    return '<div>' + s + '</div>';
  }).join('') + '</div>\
        </div>\
        <!-- writeback-insert-point -->\
        <details style="margin:20px 0;">\
            <summary style="cursor:pointer;font-weight:600;padding:10px 0;color:var(--primary);">\
                <i class="bi bi-code-slash"></i> View Generated SQL (Technical)\
            </summary>\
            <div class="sql-preview" style="margin-top:15px;"><pre>' + highlightSQL(sql) + '</pre></div>\
        </details>\
        <div class="info-box" style="background:rgba(23,162,184,0.08);">\
            <h4><i class="bi bi-arrow-right-circle"></i> What happens next?</h4>\
            <ol style="line-height:2;margin:10px 0 0 0;padding-left:20px;">\
                <li>Click <strong>Download Dashboard</strong> below</li>\
                <li>Send the files to your Softdocs administrator</li>\
                <li>They\'ll set it up in Etrieve Central</li>\
                <li>You\'re done!</li>\
            </ol>\
        </div>\
        <div class="advanced-toggle" style="margin-top:20px;">\
            <label><input type="checkbox" ' + (State.advancedMode ? 'checked' : '') + ' onchange="toggleAdvancedMode(this.checked)"><span>Advanced Mode</span></label>\
            <span class="badge-advanced">Power User</span>\
        </div>';
}
function renderGenerateStep() {
  var baseHtml = _buildBaseGenerateStep();
  if (!needsWriteBack()) {
    return baseHtml;
  }
  var style = State.selectedStyle;
  var schemaSQL = generateSchemaSQL();
  var instructions = generateIntegrationInstructions();
  var styleName = {
    'claims': 'Claims System',
    'committee-voting': 'Committee Voting',
    'workflow-actions': 'Workflow Actions',
    'bulk-actions': 'Bulk Actions'
  }[style] || style;
  var warningBanner = "\n        <div class=\"writeback-warning-banner\">\n            <div style=\"display:flex;align-items:flex-start;gap:12px;\">\n                <i class=\"bi bi-exclamation-triangle-fill\" style=\"font-size:1.4rem;color:#856404;flex-shrink:0;margin-top:2px;\"></i>\n                <div>\n                    <strong>On-Prem SQL Server Required</strong>\n                    <p style=\"margin:6px 0 0;font-size:0.9rem;\">\n                        The <strong>".concat(escapeHtml(styleName), "</strong> style requires an on-prem SQL Server connected via Hybrid Server\n                        to track state (votes, claims, decisions, etc.). The generated SQL schema must be deployed\n                        to your SQL Server <strong>before</strong> the dashboard will work.\n                    </p>\n                </div>\n            </div>\n        </div>");
  var schemaSection = "\n        <div class=\"writeback-schema-section\">\n            <div class=\"schema-header\" onclick=\"toggleSchemaSection(this)\">\n                <h4 style=\"margin:0;display:flex;align-items:center;gap:8px;\">\n                    <i class=\"bi bi-database-fill-gear\" style=\"color:var(--primary);\"></i>\n                    Database Schema (Run First)\n                    <span class=\"badge-sql-required\">SQL</span>\n                </h4>\n                <div style=\"display:flex;align-items:center;gap:8px;\">\n                    <button class=\"btn btn-sm\" onclick=\"event.stopPropagation();copySchemaSQL(event)\" title=\"Copy schema SQL\">\n                        <i class=\"bi bi-clipboard\"></i> Copy\n                    </button>\n                    <i class=\"bi bi-chevron-down schema-chevron\"></i>\n                </div>\n            </div>\n            <div class=\"schema-body\" style=\"display:none;\">\n                <p style=\"margin:0 0 12px;font-size:0.85rem;color:#666;\">\n                    <i class=\"bi bi-info-circle\"></i> Run this SQL on your on-prem SQL Server before setting up integrations.\n                    Creates all required tables, indexes, and stored procedures.\n                </p>\n                <div class=\"sql-preview schema-sql-preview\">\n                    <pre id=\"schemaPreview\">".concat(escapeHtml(schemaSQL), "</pre>\n                </div>\n            </div>\n        </div>");
  var instructionRows = instructions.map(function (inst) {
    return "\n        <tr>\n            <td><code>".concat(escapeHtml(inst.name), "</code></td>\n            <td><span class=\"badge ").concat(inst.method === 'POST' ? 'bg-warning' : 'bg-info', "\" style=\"font-size:0.75rem;\">").concat(inst.method, "</span></td>\n            <td><code style=\"font-size:0.8rem;\">").concat(escapeHtml(inst.sql), "</code></td>\n            <td style=\"font-size:0.85rem;\">").concat(escapeHtml(inst.desc), "</td>\n        </tr>");
  }).join('');
  var instructionsSection = "\n        <div class=\"writeback-schema-section\" style=\"margin-top:15px;\">\n            <div class=\"schema-header\" onclick=\"toggleSchemaSection(this)\">\n                <h4 style=\"margin:0;display:flex;align-items:center;gap:8px;\">\n                    <i class=\"bi bi-plug-fill\" style=\"color:var(--accent);\"></i>\n                    Integration Setup Instructions\n                </h4>\n                <i class=\"bi bi-chevron-down schema-chevron\"></i>\n            </div>\n            <div class=\"schema-body\" style=\"display:none;\">\n                <p style=\"margin:0 0 12px;font-size:0.85rem;color:#666;\">\n                    <i class=\"bi bi-info-circle\"></i> Create these integration sources in\n                    <strong>Etrieve Central \u2192 Admin Settings \u2192 Sources</strong>.\n                    Point each to your Hybrid Server connection.\n                </p>\n                <div style=\"overflow-x:auto;\">\n                    <table class=\"integration-table\">\n                        <thead>\n                            <tr>\n                                <th>Integration Name</th>\n                                <th>Method</th>\n                                <th>SQL Command</th>\n                                <th>Description</th>\n                            </tr>\n                        </thead>\n                        <tbody>".concat(instructionRows, "</tbody>\n                    </table>\n                </div>\n                <div style=\"margin-top:12px;padding:10px 14px;background:rgba(23,162,184,0.08);border-radius:8px;font-size:0.85rem;\">\n                    <strong>Important:</strong> After creating each source, go to your dashboard form under\n                    <strong>Connect \u2192 Available Sources</strong> and add it. Check <strong>\"Get\"</strong> for\n                    read sources and <strong>\"Post\"</strong> for write sources.\n                </div>\n            </div>\n        </div>");
  var summaryEndMarker = '<!-- writeback-insert-point -->';
  if (baseHtml.indexOf(summaryEndMarker) !== -1) {
    return baseHtml.replace(summaryEndMarker, warningBanner + schemaSection + instructionsSection);
  }
  var stepDescEnd = baseHtml.indexOf('</div>', baseHtml.indexOf('step-description'));
  if (stepDescEnd !== -1) {
    var insertPoint = baseHtml.indexOf('</div>', stepDescEnd + 6);
    if (insertPoint !== -1) {
      var searchFrom = baseHtml.indexOf('clipboard-check');
      if (searchFrom !== -1) {
        var depth = 0;
        var idx = baseHtml.indexOf('<div', searchFrom - 50);
        for (var i = idx; i < baseHtml.length; i++) {
          if (baseHtml.substring(i, i + 4) === '<div') depth++;
          if (baseHtml.substring(i, i + 6) === '</div>') {
            depth--;
            if (depth === 0) {
              return baseHtml.substring(0, i + 6) + warningBanner + schemaSection + instructionsSection + baseHtml.substring(i + 6);
            }
          }
        }
      }
    }
  }
  return warningBanner + baseHtml + schemaSection + instructionsSection;
}
function toggleSchemaSection(header) {
  var body = header.nextElementSibling;
  var chevron = header.querySelector('.schema-chevron');
  if (body.style.display === 'none') {
    body.style.display = 'block';
    chevron.classList.add('rotated');
  } else {
    body.style.display = 'none';
    chevron.classList.remove('rotated');
  }
}
function copySchemaSQL(e) {
  try {
    var schemaSQL = generateSchemaSQL();
  } catch (err) {
    showToast('Failed to generate schema SQL.', 'error');
    return;
  }
  navigator.clipboard.writeText(schemaSQL).then(function () {
    var btn = e.target.closest('button');
    if (btn) {
      var orig = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
      setTimeout(function () {
        btn.innerHTML = orig;
      }, 2000);
    }
  })["catch"](function () {
    showToast('Failed to copy — try selecting and copying manually.', 'error');
  });
}
function generateDashboardFiles() {
  var sql = State.customSQL || generateSQL();
  var config = generateConfigJS();
  var viewModel = generateViewModelJS();
  var indexHtml = generateIndexHTML();
  var readme = generateReadme();
  var files = {
    'integration-query.sql': sql,
    'configuration.js': config,
    'viewmodel.js': viewModel,
    'index.html': indexHtml,
    'README.md': readme
  };
  if (needsWriteBack()) {
    var schemaSQL = generateSchemaSQL();
    if (schemaSQL) {
      files['schema.sql'] = schemaSQL;
    }
  }
  return files;
}
function getStyleBadgeHTML(styleId) {
  var writeBackStyles = ['claims', 'committee-voting'];
  if (writeBackStyles.indexOf(styleId) !== -1) {
    return '<span class="badge-sql-required" title="Requires on-prem SQL Server via Hybrid Server">SQL Required</span>';
  }
  return '';
}
console.log('Dashboard Builder Wizard 3.0 - Style generators + write-back SQL loaded');
if (typeof define === 'function' && define.amd) {
  define('template/wizard-generators', ['template/wizard-demo'], function () {
    return {
      loaded: true
    };
  });
}
