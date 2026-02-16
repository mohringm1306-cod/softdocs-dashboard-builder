/**
 * Dashboard Builder Wizard 3.0 - Style Template Generators
 * Generates production-ready HTML, JS, and config files for each dashboard style.
 * Loaded after wizard-demo.js
 */

// ============================================================================
// VIEWMODEL GENERATOR DISPATCHER
// ============================================================================

function generateViewModelJS() {
    const style = State.selectedStyle || 'simple-status';
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

// ============================================================================
// INDEX HTML GENERATOR DISPATCHER
// ============================================================================

function generateIndexHTML() {
    const style = State.selectedStyle || 'simple-status';
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

// ============================================================================
// CONFIG GENERATOR OVERRIDE
// ============================================================================

function generateConfigJS() {
    const swimlaneConfigs = State.swimlanes.map(sl => {
        const filterStr = sl.filters && sl.filters.length > 0
            ? sl.filters.map(f => `{ field: '${escapeJS(f.fieldName)}', values: [${f.values.map(v => `'${escapeJS(v)}'`).join(', ')}] }`).join(', ')
            : '';
        return `    { name: '${escapeJS(sl.name)}', filters: [${filterStr}] }`;
    }).join(',\n');

    // Style-specific config
    let styleConfigBlock = '';
    const sc = State.styleConfig;
    const style = State.selectedStyle || 'simple-status';

    if (style === 'claims') {
        styleConfigBlock = `
    // Claims system config
    claims: {
        filterChips: ${JSON.stringify(sc.filterChips)},
        ageBadgeThresholds: { warning: ${sc.ageBadgeWarning || 30}, critical: ${sc.ageBadgeCritical || 60} }
    },
    currentUser: '', // Set to logged-in user`;
    } else if (style === 'committee-voting') {
        styleConfigBlock = `
    // Committee voting config
    voting: {
        members: ${JSON.stringify(sc.committeeMembers, null, 8)}
    },
    currentUser: '', // Set to logged-in user`;
    } else if (style === 'expandable' || style === 'pdf-signatures' || style === 'award-nominations') {
        const allFields = getAllFields();
        const detailFieldDefs = (sc.detailFields || []).map(id => {
            const f = allFields.find(x => x.id === id || x.id === String(id));
            return f ? `{ field: '${escapeJS(f.alias || f.id)}', label: '${escapeJS(f.name)}' }` : `{ field: '${id}', label: '${id}' }`;
        });
        styleConfigBlock = `
    // Expandable row detail fields
    expandable: {
        detailFields: [${detailFieldDefs.join(', ')}]
    },`;
    } else if (style === 'alpha-split') {
        styleConfigBlock = `
    // Alpha split config
    alphaSplit: {
        nameField: '${escapeJS(sc.nameField || 'LastName')}',
        ranges: ${JSON.stringify(sc.alphaRanges)}
    },`;
    } else if (style === 'workflow-actions') {
        styleConfigBlock = `
    // Workflow action buttons per swimlane
    workflowActions: ${JSON.stringify(sc.workflowActions, null, 8)},`;
    } else if (style === 'survey-analytics') {
        styleConfigBlock = `
    // Survey field mappings
    survey: {
        ratingField: '${escapeJS(sc.ratingField || '')}',
        commentField: '${escapeJS(sc.commentField || '')}',
        departmentField: '${escapeJS(sc.departmentField || '')}'
    },`;
    } else if (style === 'cards-dashboard') {
        styleConfigBlock = `
    // Card layout field mappings
    cards: {
        titleField: '${escapeJS(sc.cardTitleField || '')}',
        statusField: '${escapeJS(sc.cardStatusField || '')}',
        leadField: '${escapeJS(sc.cardLeadField || '')}',
        budgetField: '${escapeJS(sc.cardBudgetField || '')}'
    },`;
    } else if (style === 'bulk-actions') {
        styleConfigBlock = `
    // Bulk action reassign targets
    bulkActions: {
        reassignTargets: ${JSON.stringify(sc.reassignTargets)}
    },`;
    }

    return `/**
 * Dashboard Configuration
 * Generated by Dashboard Builder v3.0
 * Style: ${style}
 * ${new Date().toISOString()}
 */

const DashboardConfig = {
    title: '${escapeJS(State.dashboardTitle) || 'My Dashboard'}',
    sourceName: '${escapeJS(State.sourceName) || 'Dashboard'}',
    mode: '${State.mode}',
    style: '${style}',

    integration: {
        source: '${State.sourceName || 'Dashboard'}',
        refreshInterval: 300000
    },

    swimlanes: [
${swimlaneConfigs}
    ],

    columns: [
${generateColumnDefinitions()}
    ],
${styleConfigBlock}

    ui: {
        showSearch: true,
        showFilters: true,
        rowsPerPage: 25,
        defaultSort: { field: 'date', direction: 'desc' }
    }
};

if (typeof module !== 'undefined') { module.exports = DashboardConfig; }
${generateWriteIntegrationVars()}
`;
}

// Generate write integration variable declarations for write-back styles
function generateWriteIntegrationVars() {
    const name = safeName(State.dashboardTitle || State.sourceName || 'Dashboard');
    const style = State.selectedStyle || 'simple-status';

    if (style === 'claims') {
        return `
// Write-back integrations (on-prem SQL via Hybrid Server)
var claimIntegration = '${name}_ClaimItem';
var unclaimIntegration = '${name}_UnclaimItem';
`;
    } else if (style === 'committee-voting') {
        return `
// Write-back integrations (on-prem SQL via Hybrid Server)
var castVoteIntegration = '${name}_CastVote';
var finalDecisionIntegration = '${name}_FinalDecision';
var userInfoIntegration = '${name}_GetUserInfo';
`;
    } else if (style === 'workflow-actions') {
        return `
// Write-back integrations (on-prem SQL via Hybrid Server)
var queueActionIntegration = '${name}_QueueAction';
`;
    } else if (style === 'bulk-actions') {
        return `
// Write-back integrations (on-prem SQL via Hybrid Server)
var bulkDecisionIntegration = '${name}_BulkDecision';
var recordDecisionIntegration = '${name}_RecordDecision';
`;
    }
    return '';
}

// ============================================================================
// README GENERATOR OVERRIDE
// ============================================================================



function generateReadme() {
    const style = State.selectedStyle || 'simple-status';
    const styleDef = DashboardStyles.find(s => s.id === style) || { name: 'Simple Status', description: '' };

    const styleNotes = {
        'simple-status': 'This is a basic swimlane dashboard. Items are grouped by status.',
        'request-type': 'Items are grouped by request type/category rather than status.',
        'expandable': 'Rows can be expanded (+/- toggle) to show detail fields in a grid layout.',
        'alpha-split': 'Items are automatically split into alphabetical ranges by last name for workload distribution.',
        'claims': 'Staff can claim/unclaim items. Includes personal stats, filter chips, and age badges.',
        'workflow-actions': 'Each swimlane has context-sensitive action buttons with confirmation modals.',
        'pdf-signatures': 'Expandable rows show signatures and document details. Includes PDF generation.',
        'survey-analytics': 'Includes stats cards, word cloud, theme analysis, and table/card view modes.',
        'award-nominations': 'Expandable nomination details with category badges for award programs.',
        'committee-voting': 'Named voter columns for committee decisions. Includes vote buttons and document preview.',
        'cards-dashboard': 'Executive card layout with status metrics, progress tracking, and responsive grid.',
        'bulk-actions': 'Bulk checkbox selection with approve/deny/reassign operations and row-level action menus.'
    };

    return `# ${State.dashboardTitle || 'Dashboard'}

Generated by Dashboard Builder v3.0 on ${new Date().toLocaleDateString()}

## Dashboard Style: ${styleDef.name}

${styleNotes[style] || styleDef.description}

## Setup Instructions

### 1. Create Integration Source in Etrieve Central

1. Go to **Etrieve Central** > **Admin** > **Sources**
2. Click **Add Source**
3. Name it: \`${State.sourceName || 'Dashboard'}\`
4. Set type to **SQL Query**
5. Paste the contents of \`integration-query.sql\`
6. Save and test the source

### 2. Upload Dashboard Files

1. Go to **Etrieve Central** > **Dashboards**
2. Create a new dashboard or edit existing
3. Upload \`index.html\`, \`configuration.js\`, and \`viewmodel.js\`

### 3. Configure Permissions

Ensure users have access to:
- The dashboard itself
- The underlying data (Area/Catalog: ${(State.selectedArea && State.selectedArea.name) || 'N/A'})
${State.selectedTemplate ? `- Form template: ${State.selectedTemplate.name}` : ''}

## Files Included

| File | Description |
|------|-------------|
| \`integration-query.sql\` | SQL query for the Etrieve integration source |
| \`configuration.js\` | Dashboard settings, swimlane filters, and style config |
| \`viewmodel.js\` | JavaScript logic for data loading, display, and interactions |
| \`index.html\` | Dashboard HTML template with embedded CSS |

## Style-Specific Features

${style === 'claims' ? `- **Claim/Unclaim**: Staff can claim documents for processing
- **Filter Chips**: Quick filters: ${(State.styleConfig.filterChips || []).join(', ')}
- **Age Badges**: Warning at ${State.styleConfig.ageBadgeWarning || 30} days, critical at ${State.styleConfig.ageBadgeCritical || 60} days` : ''}
${style === 'committee-voting' ? `- **Committee Members**: ${(State.styleConfig.committeeMembers || []).map(m => m.name).join(', ')}
- **Voting**: Approve, Deny, or Request More Info per item` : ''}
${style === 'expandable' || style === 'pdf-signatures' || style === 'award-nominations' ? `- **Expandable Rows**: Click +/- to show detail fields` : ''}
${style === 'alpha-split' ? `- **Alpha Ranges**: ${(State.styleConfig.alphaRanges || []).map(r => r[0] + '-' + r[1]).join(', ')}` : ''}
${style === 'bulk-actions' ? `- **Bulk Operations**: Approve, Deny, Reassign
- **Reassign Targets**: ${(State.styleConfig.reassignTargets || []).join(', ')}` : ''}

## Swimlane Configuration

${State.swimlanes.map(sl => {
    const filterDesc = sl.filters && sl.filters.length > 0
        ? sl.filters.map(f => `${f.fieldName}: ${f.values.join(', ')}`).join('; ')
        : 'No filters (shows all)';
    return `- **${sl.name}**: ${filterDesc}`;
}).join('\n')}

## Support

For questions or issues, contact your Softdocs administrator.
`;
}

// ============================================================================
// SHARED HTML PARTS
// ============================================================================

function htmlHead(extraCss) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(State.dashboardTitle || 'Dashboard')}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        :root {
            --primary: #006341;
            --primary-dark: #004d35;
            --accent: #f4b41a;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f5f7fa; min-height: 100vh; }
        .header { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 20px 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { font-size: 1.5rem; }
        .container { max-width: 1400px; margin: 0 auto; padding: 30px; }
        .toolbar { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
        .search-box { flex: 1; min-width: 250px; position: relative; }
        .search-box input { width: 100%; padding: 12px 15px 12px 45px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; }
        .search-box i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; }
        .swimlane { background: white; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
        .swimlane-header { background: #f8f9fa; padding: 15px 20px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 600; border-bottom: 1px solid #e9ecef; }
        .swimlane-header:hover { background: #f0f2f5; }
        .swimlane-header .count { background: var(--primary); color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.85rem; }
        .swimlane-content { padding: 0; }
        .swimlane-content.collapsed { display: none; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { background: #f8f9fa; padding: 12px 15px; text-align: left; font-weight: 600; border-bottom: 2px solid #e9ecef; }
        .data-table td { padding: 12px 15px; border-bottom: 1px solid #f0f2f5; }
        .data-table tr:hover td { background: #fafbfc; }
        .view-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-size: 0.85rem; border: none; cursor: pointer; }
        .view-btn:hover { background: var(--primary-dark); }
        .error-message { text-align: center; padding: 50px; color: #dc3545; }
        .error-message i { font-size: 3rem; margin-bottom: 15px; }
        .export-btn { margin-left: auto; padding: 4px 12px; background: var(--accent); color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
        .export-btn:hover { opacity: 0.9; }
        .btn { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
        .btn-success { background: #28a745; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-info { background: #17a2b8; color: white; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-warning { background: #ffc107; color: #000; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-sm { padding: 4px 10px; font-size: 0.8rem; }
        .btn-outline-primary { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        ${extraCss || ''}
    </style>
</head>`;
}

function htmlBody(innerContent) {
    return `
<body>
    <div class="loading" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.7);z-index:9999;justify-content:center;align-items:center;">
        <div style="text-align:center;"><div style="width:40px;height:40px;border:4px solid #e9ecef;border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 10px;"></div><span>Loading...</span></div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } } .toast-notification { position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:12px 24px;border-radius:8px;font-size:0.9rem;opacity:0;transition:opacity 0.3s;z-index:9999; } .toast-notification.show { opacity:1; } .toast-success { background:#28a745; } .toast-error { background:#dc3545; }</style>
    <div class="header">
        <h1><i class="bi bi-grid-3x3-gap"></i> ${escapeHtml(State.dashboardTitle || 'Dashboard')}</h1>
    </div>
    <div class="container">
        <div class="toolbar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Search..." oninput="dashboard.searchTerm = this.value; dashboard.applyFilters(); dashboard.render();">
            </div>
            <button id="refreshBtn" class="btn btn-primary btn-sm" onclick="dashboard.loadData()" title="Refresh data"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
        </div>
        ${innerContent}
    </div>
    <script src="configuration.js"><\/script>
    <script src="viewmodel.js"><\/script>
</body>
</html>`;
}

// ============================================================================
// HTML GENERATORS (one per style group)
// ============================================================================

// --- Styles 1/2: Simple ---
function generateHTML_simple() {
    return htmlHead('') + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Styles 3/7/9: Expandable ---
function generateHTML_expandable() {
    const extraCss = `
        .toggle-btn { width: 28px; height: 28px; border: 2px solid var(--primary); background: white; color: var(--primary); border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; }
        .toggle-btn:hover { background: var(--primary); color: white; }
        .child-row td { background: #f8f9fa; border-left: 4px solid var(--primary); }
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 15px; }
        .detail-item label { display: block; font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
        .detail-item span { font-size: 0.9rem; }
        .separator-bar td { height: 3px; background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 50%, #e0e0e0 100%); padding: 0; }
        .signature-display { font-family: 'Brush Script MT', cursive; font-size: 1.5rem; color: #333; padding: 5px; border-bottom: 1px solid #999; display: inline-block; }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 4: Alpha Split ---
function generateHTML_alphaSplit() {
    return htmlHead('') + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 5: Claims ---
function generateHTML_claims() {
    const extraCss = `
        .personal-stats { background: #f8f9fa; border-left: 4px solid var(--primary); border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; }
        .personal-stats h6 { color: var(--primary); font-weight: 700; margin-bottom: 10px; }
        .stat-row { display: flex; gap: 30px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
        .stat-label { font-size: 0.8rem; color: #888; }
        .action-bar { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .action-bar-left, .action-bar-right { display: flex; align-items: center; gap: 10px; }
        .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-chip { padding: 6px 14px; background: #e9ecef; border-radius: 20px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
        .filter-chip.active { background: var(--primary); color: white; }
        .filter-chip:hover { opacity: 0.85; }
        .btn-claim { padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .btn-unclaim { padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .badge-claimed { display: inline-block; padding: 4px 10px; background: #d4edda; color: #155724; border-radius: 4px; font-size: 0.8rem; }
        .badge-unclaimed { display: inline-block; padding: 4px 10px; background: #f8d7da; color: #721c24; border-radius: 4px; font-size: 0.8rem; }
        .age-badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
        .age-badge-normal { background: #d4edda; color: #155724; }
        .age-badge-warning { background: #fff3cd; color: #856404; }
        .age-badge-critical { background: #f8d7da; color: #721c24; }
        .row-checkbox { cursor: pointer; }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 6: Workflow Actions ---
function generateHTML_workflow() {
    const extraCss = `
        .action-btn { padding: 4px 8px; font-size: 0.8rem; margin: 0 2px; border-radius: 4px; border: none; cursor: pointer; color: white; }
        .confirmation-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; }
        .confirmation-modal.show { display: flex; }
        .modal-content-custom { background: white; border-radius: 8px; padding: 25px; max-width: 500px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .modal-content-custom h5 { color: var(--primary); margin-bottom: 15px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 8: Survey Analytics ---
function generateHTML_survey() {
    const extraCss = `
        .survey-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .survey-stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid var(--primary); }
        .survey-stat-card h3 { color: var(--primary); margin-bottom: 5px; }
        .survey-stat-card small { color: #888; }
        .action-bar { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .action-bar-left { display: flex; align-items: center; gap: 10px; }
        .survey-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .survey-response-card { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 10: Committee Voting ---
function generateHTML_voting() {
    const extraCss = `
        .voting-user-bar { background: linear-gradient(135deg, #006747 0%, #004d35 100%); color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .vote-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0 2px; font-size: 1rem; transition: transform 0.1s, box-shadow 0.1s; }
        .vote-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .vote-approve { background: #28a745; color: white; }
        .vote-deny { background: #dc3545; color: white; }
        .vote-info { background: #ffc107; color: #000; }
        .toast-notification { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 12px 24px; border-radius: 8px; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s; z-index: 9999; }
        .toast-notification.show { opacity: 1; }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 11: Cards Dashboard ---
function generateHTML_cards() {
    const extraCss = `
        .cards-metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .cards-metric-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e9ecef; }
        .cards-metric-card h6 { color: #888; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 10px; }
        .cards-status-list { font-size: 0.85rem; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px; }
        .item-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e9ecef; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .item-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
        .item-card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px; border-bottom: 1px solid #f0f2f5; }
        .item-card-title { font-weight: 600; font-size: 0.95rem; }
        .item-card-meta { font-size: 0.75rem; color: #888; margin-top: 3px; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .item-card-body { padding: 15px; }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// --- Style 12: Bulk Actions ---
function generateHTML_bulkActions() {
    const extraCss = `
        .action-bar { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .action-bar-left, .action-bar-right { display: flex; align-items: center; gap: 10px; }
        .reassign-wrapper { position: relative; }
        .reassign-dropdown { position: absolute; top: 100%; left: 0; background: white; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; min-width: 180px; }
        .reassign-dropdown a { display: block; padding: 10px 15px; cursor: pointer; font-size: 0.9rem; color: #333; text-decoration: none; }
        .reassign-dropdown a:hover { background: #f0f2f5; }
        .row-action-dropdown { position: relative; display: inline-block; }
        .row-action-menu { display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; min-width: 160px; }
        .row-action-menu.show { display: block; }
        .row-action-menu a { display: block; padding: 10px 15px; cursor: pointer; font-size: 0.85rem; color: #333; text-decoration: none; }
        .row-action-menu a:hover { background: #f0f2f5; }
        .bulk-cb { cursor: pointer; }
    `;
    return htmlHead(extraCss) + htmlBody(`<div id="dashboardContent"><p style="text-align:center;padding:50px;color:#666;">Loading...</p></div>`);
}

// ============================================================================
// VIEWMODEL GENERATORS
// ============================================================================

function vmPreamble() {
    return `/**
 * Dashboard ViewModel
 * Generated by Dashboard Builder v3.0
 * Style: ${State.selectedStyle || 'simple-status'}
 */\n`;
}

function vmBaseClass() {
    return `// Runtime HTML escaping to prevent XSS from API data
function _esc(str) {
    if (str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Toast notification helper
function showToast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast-notification' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add('show'); }, 10);
    setTimeout(function() { t.remove(); }, 3000);
}

// Refresh helper (replaces jQuery dependency)
function _refreshDashboard(delayMs) {
    setTimeout(function() { var rb = document.getElementById('refreshBtn'); if (rb) rb.click(); }, delayMs || 1500);
}

class DashboardViewModel {
    constructor(config) {
        this.config = config;
        this.data = [];
        this.filteredData = [];
        this.searchTerm = '';
        this.activeFilters = {};
    }

    loadData() {
        var self = this;
        // Use Etrieve integration.all() if available, otherwise fall back to fetch
        if (typeof integration !== 'undefined' && typeof integration.all === 'function') {
            integration.all(this.config.integration.source).then(function(data) {
                self.data = data || [];
                self.applyFilters();
                self.render();
            }).catch(function(error) {
                console.error('Failed to load dashboard data:', error);
                self.showError('Unable to load data. Please try again.');
            });
        } else {
            fetch('/api/integration/' + this.config.integration.source)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    self.data = data || [];
                    self.applyFilters();
                    self.render();
                })
                .catch(function(error) {
                    console.error('Failed to load dashboard data:', error);
                    self.showError('Unable to load data. Please try again.');
                });
        }
    }

    applyFilters() {
        this.filteredData = this.data.filter(row => {
            if (this.searchTerm) {
                const searchLower = this.searchTerm.toLowerCase();
                const matches = Object.values(row).some(val => String(val).toLowerCase().includes(searchLower));
                if (!matches) return false;
            }
            for (const [field, value] of Object.entries(this.activeFilters)) {
                if (value && row[field] !== value) return false;
            }
            return true;
        });
    }

    getRowsForSwimlane(swimlane) {
        return this.filteredData.filter(row => {
            if (!swimlane.filters || swimlane.filters.length === 0) return true;
            return swimlane.filters.every(f => f.values.includes(row[f.field]));
        });
    }

    showError(message) {
        const container = document.getElementById('dashboardContent');
        if (container) {
            container.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i> ' + _esc(message) + '</div>';
        }
    }
}\n`;
}

function vmInit() {
    return `
document.addEventListener('DOMContentLoaded', function() {
    // Detect current user from Etrieve user module if available
    if (typeof user !== 'undefined' && user.userName) {
        DashboardConfig.currentUser = user.userName;
    } else if (window._etrieveUser && window._etrieveUser.username) {
        DashboardConfig.currentUser = window._etrieveUser.username;
    }
    window.dashboard = new DashboardViewModel(DashboardConfig);
    window.dashboard.loadData();
    setInterval(function() { window.dashboard.loadData(); }, DashboardConfig.integration.refreshInterval);
});

function toggleSwimlane(header) {
    var content = header.nextElementSibling;
    var icon = header.querySelector('i');
    content.classList.toggle('collapsed');
    icon.classList.toggle('bi-chevron-down');
    icon.classList.toggle('bi-chevron-right');
}\n`;
}

function vmExportFn() {
    return `
function exportSwimlane(btn) {
    var table = btn.closest('.swimlane').querySelector('table');
    if (!table) return;
    var rows = Array.from(table.querySelectorAll('tr'));
    var csv = rows.map(function(r) { return Array.from(r.querySelectorAll('th,td')).map(function(c) { return '"' + c.textContent.trim().replace(/"/g, '""') + '"'; }).join(','); }).join('\\n');
    var blob = new Blob([csv], {type: 'text/csv'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'export.csv'; a.click();
}\n`;
}

// --- Styles 1/2: Simple ---
function generateVM_simple() {
    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    container.innerHTML = this.config.swimlanes.map(function(sl) {
        var rows = self.getRowsForSwimlane(sl);
        return self.renderSwimlane(sl, rows);
    }).join('');
};

DashboardViewModel.prototype.renderSwimlane = function(swimlane, rows) {
    var self = this;
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');
    var rowsHtml = rows.map(function(row) { return self.renderRow(row); }).join('');
    return '<div class="swimlane">' +
        '<div class="swimlane-header" onclick="toggleSwimlane(this)">' +
            '<i class="bi bi-chevron-down"></i>' +
            '<span>' + _esc(swimlane.name) + '</span>' +
            '<span class="count">' + rows.length + '</span>' +
            '<button class="export-btn" onclick="event.stopPropagation(); exportSwimlane(this)">Export</button>' +
        '</div>' +
        '<div class="swimlane-content">' +
            '<table class="data-table"><thead><tr>' + colHeaders + '<th>Actions</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody></table>' +
        '</div></div>';
};

DashboardViewModel.prototype.renderRow = function(row) {
    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
    return '<tr>' + cells + '<td><a href="' + encodeURI(row.url || '#') + '" target="_blank" class="view-btn"><i class="bi bi-eye"></i> View</a></td></tr>';
};
` + vmExportFn() + vmInit();
}

// --- Styles 3/7/9: Expandable ---
function generateVM_expandable() {
    var detailFields = State.styleConfig.detailFields || [];
    var allFields = getAllFields();
    var detailFieldDefs = detailFields.map(function(id) {
        var f = allFields.find(function(x) { return x.id === id || x.id === String(id); });
        return f ? { field: f.alias || f.id, label: f.name } : { field: id, label: String(id) };
    });
    var isPdf = State.selectedStyle === 'pdf-signatures';

    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.detailFields = ${JSON.stringify(detailFieldDefs)};

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    container.innerHTML = this.config.swimlanes.map(function(sl) {
        var rows = self.getRowsForSwimlane(sl);
        return self.renderSwimlane(sl, rows);
    }).join('');
};

DashboardViewModel.prototype.renderSwimlane = function(swimlane, rows) {
    var self = this;
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');
    var rowsHtml = rows.map(function(row) { return self.renderExpandableRow(row); }).join('');
    return '<div class="swimlane">' +
        '<div class="swimlane-header" onclick="toggleSwimlane(this)">' +
            '<i class="bi bi-chevron-down"></i><span>' + _esc(swimlane.name) + '</span><span class="count">' + rows.length + '</span>' +
            '<button class="export-btn" onclick="event.stopPropagation(); exportSwimlane(this)">Export</button>' +
        '</div>' +
        '<div class="swimlane-content"><table class="data-table"><thead><tr><th style="width:40px;"></th>' + colHeaders + '<th>Actions</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody></table></div></div>';
};

DashboardViewModel.prototype.renderExpandableRow = function(row) {
    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
    var detailHtml = this.detailFields.map(function(df) {
        return '<div class="detail-item"><label>' + _esc(df.label) + '</label><span>' + _esc(row[df.field] || '-') + '</span></div>';
    }).join('');
    ${isPdf ? `detailHtml += '<div class="detail-item"><label>Signature</label><div class="signature-display">' + _esc(row.Signature || 'Not signed') + '</div></div>';` : ''}
    var colSpan = this.config.columns.length + 1;
    return '<tr class="data-row"><td><button class="toggle-btn" onclick="toggleExpandableRow(this)">+</button></td>' + cells +
        '<td><a href="' + encodeURI(row.url || '#') + '" target="_blank" class="view-btn"><i class="bi bi-eye"></i> View</a></td></tr>' +
        '<tr class="child-row" style="display:none;"><td></td><td colspan="' + colSpan + '"><div class="detail-grid">' + detailHtml + '</div></td></tr>' +
        '<tr class="separator-bar" style="display:none;"><td colspan="' + (colSpan + 1) + '"></td></tr>';
};

function toggleExpandableRow(btn) {
    var row = btn.closest('tr');
    var child = row.nextElementSibling;
    var sep = child.nextElementSibling;
    var showing = child.style.display === 'none';
    child.style.display = showing ? '' : 'none';
    if (sep && sep.classList.contains('separator-bar')) sep.style.display = showing ? '' : 'none';
    btn.textContent = showing ? '-' : '+';
}
` + vmExportFn() + vmInit();
}

// --- Style 4: Alpha Split ---
function generateVM_alphaSplit() {
    var nameField = State.styleConfig.nameField || 'LastName';
    var allFields = getAllFields();
    var fieldDef = allFields.find(function(f) { return f.id === nameField || f.id === String(nameField); });
    var fieldAlias = fieldDef ? (fieldDef.alias || fieldDef.id) : nameField;
    var ranges = State.styleConfig.alphaRanges || [['A','H'],['I','P'],['Q','Z']];

    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.alphaField = '${escapeJS(String(fieldAlias))}';
DashboardViewModel.prototype.alphaRanges = ${JSON.stringify(ranges)};

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    container.innerHTML = this.alphaRanges.map(function(range) {
        var label = range[0] + ' \\u2014 ' + range[1];
        var rows = self.filteredData.filter(function(row) {
            var val = (row[self.alphaField] || '').charAt(0).toUpperCase();
            return val >= range[0] && val <= range[1];
        });
        return self.renderSwimlane({ name: label }, rows);
    }).join('');
};

DashboardViewModel.prototype.renderSwimlane = function(swimlane, rows) {
    var self = this;
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');
    var rowsHtml = rows.map(function(row) {
        var cells = self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
        return '<tr>' + cells + '<td><a href="' + encodeURI(row.url || '#') + '" target="_blank" class="view-btn"><i class="bi bi-eye"></i> View</a></td></tr>';
    }).join('');
    return '<div class="swimlane"><div class="swimlane-header" onclick="toggleSwimlane(this)">' +
        '<i class="bi bi-chevron-down"></i><span>' + _esc(swimlane.name) + '</span><span class="count">' + rows.length + '</span></div>' +
        '<div class="swimlane-content"><table class="data-table"><thead><tr>' + colHeaders + '<th>Actions</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody></table></div></div>';
};
` + vmInit();
}

// --- Style 5: Claims ---
function generateVM_claims() {
    var chips = State.styleConfig.filterChips || ['All'];
    var warn = State.styleConfig.ageBadgeWarning || 30;
    var crit = State.styleConfig.ageBadgeCritical || 60;

    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.filterChips = ${JSON.stringify(chips)};
DashboardViewModel.prototype.activeChip = 'All';

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    var myItems = this.filteredData.filter(function(r) { return r.ClaimedBy === (DashboardConfig.currentUser || ''); });

    var statsHtml = '<div class="personal-stats"><h6><i class="bi bi-person-circle"></i> Your Stats</h6>' +
        '<div class="stat-row"><div class="stat-item"><div class="stat-value">' + myItems.length + '</div><div class="stat-label">My Claimed</div></div>' +
        '<div class="stat-item"><div class="stat-value">' + this.filteredData.length + '</div><div class="stat-label">Total</div></div></div></div>';

    var chipsHtml = this.filterChips.map(function(c) {
        return '<span class="filter-chip ' + (self.activeChip === c ? 'active' : '') + '" onclick="dashboard.setChip(' + JSON.stringify(c).replace(/"/g, '&quot;') + ')">' + _esc(c) + '</span>';
    }).join('');

    var actionBar = '<div class="action-bar"><div class="action-bar-left">' +
        '<button class="btn-claim" onclick="dashboard.claimSelected()"><i class="bi bi-hand-index"></i> Claim Selected</button>' +
        '<button class="btn-unclaim" onclick="dashboard.unclaimSelected()"><i class="bi bi-hand-index-thumb"></i> Unclaim</button></div>' +
        '<div class="action-bar-right"><div class="quick-filters">' + chipsHtml + '</div></div></div>';

    var swimlanesHtml = this.config.swimlanes.map(function(sl) {
        var rows = self.getRowsForSwimlane(sl);
        return self.renderClaimsSwimlane(sl, rows);
    }).join('');

    container.innerHTML = statsHtml + actionBar + swimlanesHtml;
};

DashboardViewModel.prototype.renderClaimsSwimlane = function(swimlane, rows) {
    var self = this;
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');
    var rowsHtml = rows.map(function(row) { return self.renderClaimsRow(row); }).join('');
    return '<div class="swimlane"><div class="swimlane-header" onclick="toggleSwimlane(this)">' +
        '<i class="bi bi-chevron-down"></i><span>' + _esc(swimlane.name) + '</span><span class="count">' + rows.length + '</span></div>' +
        '<div class="swimlane-content"><table class="data-table" style="min-width:1100px;"><thead><tr>' +
        '<th style="width:40px;"><input type="checkbox" onchange="dashboard.toggleAll(this)"></th><th>Status</th>' + colHeaders + '<th>Age</th><th>Actions</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody></table></div></div>';
};

DashboardViewModel.prototype.renderClaimsRow = function(row) {
    var age = row.AgeDays || 0;
    var ageBadge = age >= ${crit} ? 'age-badge-critical' : age >= ${warn} ? 'age-badge-warning' : 'age-badge-normal';
    var claimed = row.ClaimedBy ? '<span class="badge-claimed">' + _esc(row.ClaimedBy) + '</span>' : '<span class="badge-unclaimed">Unclaimed</span>';
    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
    var id = _esc(row.DocumentID || row.FormID || '');
    return '<tr><td style="width:40px;"><input type="checkbox" class="row-checkbox" data-id="' + id + '"></td>' +
        '<td>' + claimed + '</td>' + cells +
        '<td><span class="age-badge ' + ageBadge + '">' + age + 'd</span></td>' +
        '<td><a href="' + encodeURI(row.url || '#') + '" target="_blank" class="view-btn"><i class="bi bi-eye"></i> View</a></td></tr>';
};

DashboardViewModel.prototype.setChip = function(chip) { this.activeChip = chip; this.render(); };
DashboardViewModel.prototype.toggleAll = function(cb) { cb.closest('table').querySelectorAll('.row-checkbox').forEach(function(c) { c.checked = cb.checked; }); };
DashboardViewModel.prototype.claimSelected = function() {
    var ids = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(function(c) { return c.dataset.id; });
    if (ids.length === 0) { alert('Select items first.'); return; }
    if (typeof integration === 'undefined' || !claimIntegration) { showToast('Claimed ' + ids.length + ' item(s) (no integration configured)'); return; }
    var self = this; var pending = ids.length; var done = 0;
    document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'block');
    ids.forEach(function(id) {
        integration.all(claimIntegration, { FormID: id, ClaimedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {
            done++; if (done === pending) { showToast('Claimed ' + done + ' item(s)', 'success'); document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); _refreshDashboard(1500); }
        }).catch(function(err) {
            done++; showToast('Claim failed: ' + (err.message || 'Error'), 'error'); if (done === pending) { document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); }
        });
    });
};
DashboardViewModel.prototype.unclaimSelected = function() {
    var ids = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(function(c) { return c.dataset.id; });
    if (ids.length === 0) { alert('Select items first.'); return; }
    if (typeof integration === 'undefined' || !unclaimIntegration) { showToast('Released ' + ids.length + ' item(s) (no integration configured)'); return; }
    var self = this; var pending = ids.length; var done = 0;
    document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'block');
    ids.forEach(function(id) {
        integration.all(unclaimIntegration, { FormID: id, ClaimedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {
            done++; if (done === pending) { showToast('Released ' + done + ' item(s)', 'success'); document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); _refreshDashboard(1500); }
        }).catch(function(err) {
            done++; showToast('Unclaim failed: ' + (err.message || 'Error'), 'error'); if (done === pending) { document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none'); }
        });
    });
};
` + vmInit();
}

// --- Style 6: Workflow Actions ---
function generateVM_workflow() {
    var actionsMap = State.styleConfig.workflowActions || {};
    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.workflowActions = ${JSON.stringify(actionsMap)};

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    container.innerHTML = this.config.swimlanes.map(function(sl) {
        var rows = self.getRowsForSwimlane(sl);
        return self.renderWorkflowSwimlane(sl, rows);
    }).join('') + '<div id="confirmationModal" class="confirmation-modal"><div class="modal-content-custom">' +
        '<h5 id="modalTitle"></h5><p id="modalMessage"></p>' +
        '<div class="modal-actions"><button class="btn btn-secondary" onclick="hideConfirmationModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="confirmAction()">Confirm</button></div></div></div>';
};

DashboardViewModel.prototype.renderWorkflowSwimlane = function(swimlane, rows) {
    var self = this;
    var colors = ['#ffc107', '#17a2b8', '#007bff', '#28a745', '#dc3545', '#6f42c1'];
    var idx = this.config.swimlanes.indexOf(swimlane);
    var color = colors[idx % colors.length];
    var textColor = idx === 0 ? '#000' : '#fff';
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');
    var rowsHtml = rows.map(function(row) { return self.renderActionRow(row, swimlane.name); }).join('');
    return '<div class="swimlane"><div class="swimlane-header" onclick="toggleSwimlane(this)" style="background:linear-gradient(135deg,' + color + ' 0%,' + color + 'cc 100%);color:' + textColor + ';">' +
        '<i class="bi bi-chevron-down"></i><span>' + _esc(swimlane.name) + '</span><span class="count" style="background:rgba(0,0,0,0.2);color:#fff;">' + rows.length + '</span></div>' +
        '<div class="swimlane-content"><table class="data-table"><thead><tr><th>Actions</th>' + colHeaders + '</tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody></table></div></div>';
};

DashboardViewModel.prototype.renderActionRow = function(row, swimlaneName) {
    var actions = this.workflowActions[swimlaneName] || [];
    var id = row.DocumentID || row.FormID || '';
    var btns = actions.map(function(a) {
        return '<button class="btn btn-' + _esc(a.btnStyle) + ' action-btn" onclick="showConfirmationModal(\\'' + _esc(a.label) + '\\',\\'' + _esc(id) + '\\')"><i class="bi ' + _esc(a.icon) + '"></i> ' + _esc(a.label) + '</button>';
    }).join(' ');
    var viewBtn = '<button class="btn btn-success action-btn" onclick="window.open(\\'' + encodeURI(row.url || '#') + '\\')"><i class="bi bi-eye"></i></button>';
    var cells = this.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
    return '<tr><td style="white-space:nowrap;">' + viewBtn + ' ' + btns + '</td>' + cells + '</tr>';
};

var _pendingAction = '';
var _pendingFormId = '';
function showConfirmationModal(action, formId) {
    document.getElementById('modalTitle').textContent = 'Confirm: ' + action;
    document.getElementById('modalMessage').textContent = 'Are you sure you want to perform "' + action + '" on this item?';
    document.getElementById('confirmationModal').classList.add('show');
    _pendingAction = action;
    _pendingFormId = formId || '';
}
function hideConfirmationModal() { document.getElementById('confirmationModal').classList.remove('show'); }
function confirmAction() {
    hideConfirmationModal();
    if (typeof integration === 'undefined' || !queueActionIntegration) { showToast(_pendingAction + ' confirmed (no integration configured)'); return; }
    document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'block');
    integration.all(queueActionIntegration, { FormID: _pendingFormId, ActionType: _pendingAction }).then(function(resp) {
        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');
        showToast(_pendingAction + ' queued successfully', 'success');
        var rb = document.getElementById('refreshBtn'); if (rb) setTimeout(function(){ rb.click(); }, 2000);
    }).catch(function(err) {
        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');
        showToast('Action failed: ' + (err.message || 'Error'), 'error');
    });
}
` + vmInit();
}

// --- Style 8: Survey Analytics ---
function generateVM_survey() {
    var sc = State.styleConfig;
    var ratingF = escapeJS(sc.ratingField || 'Rating');
    var commentF = escapeJS(sc.commentField || 'Comments');
    var deptF = escapeJS(sc.departmentField || 'Department');

    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.currentView = 'table';

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    var total = this.filteredData.length;
    var deptSet = {};
    var ratingSum = 0; var ratingCount = 0;
    this.filteredData.forEach(function(r) {
        if (r['${deptF}']) deptSet[r['${deptF}']] = true;
        var v = parseFloat(r['${ratingF}']);
        if (!isNaN(v)) { ratingSum += v; ratingCount++; }
    });
    var avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 'N/A';

    var statsHtml = '<div class="survey-stats-row">' +
        '<div class="survey-stat-card"><h3>' + total + '</h3><small>Total Responses</small></div>' +
        '<div class="survey-stat-card"><h3>' + Object.keys(deptSet).length + '</h3><small>Departments</small></div>' +
        '<div class="survey-stat-card"><h3>' + avgRating + '</h3><small>Avg Rating</small></div></div>';

    var viewToggle = '<div class="action-bar"><div class="action-bar-left"><strong>View Mode:</strong>' +
        '<button class="btn btn-sm ' + (this.currentView==='table'?'btn-primary':'btn-outline-primary') + '" onclick="dashboard.switchView(\\'table\\')">Table</button>' +
        '<button class="btn btn-sm ' + (this.currentView==='cards'?'btn-primary':'btn-outline-primary') + '" onclick="dashboard.switchView(\\'cards\\')">Cards</button></div></div>';

    var viewHtml = this.currentView === 'table' ? this.renderTableView() : this.renderCardsView();
    container.innerHTML = statsHtml + viewToggle + viewHtml;
};

DashboardViewModel.prototype.renderTableView = function() {
    var self = this;
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + col.label + '</th>'; }).join('');
    var rows = this.filteredData.map(function(row) {
        return '<tr>' + self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<table class="data-table"><thead><tr>' + colHeaders + '</tr></thead><tbody>' + rows + '</tbody></table>';
};

DashboardViewModel.prototype.renderCardsView = function() {
    return '<div class="survey-cards-grid">' + this.filteredData.map(function(row) {
        var rating = row['${ratingF}'] || 'N/A';
        var comment = row['${commentF}'] || '';
        var dept = row['${deptF}'] || '';
        var v = parseFloat(rating);
        var color = v >= 4 ? '#28a745' : v >= 3 ? '#ffc107' : '#dc3545';
        return '<div class="survey-response-card" style="border-left:4px solid ' + color + ';">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
            '<span class="badge" style="background:' + color + ';color:#fff;">' + _esc(rating) + '/5</span>' +
            '<small style="color:#888;">' + _esc(dept) + '</small></div>' +
            '<p style="font-size:0.9rem;">' + _esc(comment.substring(0, 200)) + (comment.length > 200 ? '...' : '') + '</p></div>';
    }).join('') + '</div>';
};

DashboardViewModel.prototype.switchView = function(view) { this.currentView = view; this.render(); };
` + vmInit();
}

// --- Style 10: Committee Voting ---
function generateVM_voting() {
    var members = State.styleConfig.committeeMembers || [];
    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.members = ${JSON.stringify(members)};
DashboardViewModel.prototype.votes = {};

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;

    var userBar = '<div class="voting-user-bar"><div><i class="bi bi-person-circle me-2"></i><strong>Logged in as:</strong> ' +
        _esc(DashboardConfig.currentUser || 'Committee Member') + '</div>' +
        '<div><span class="badge" style="background:rgba(255,255,255,0.2);color:#fff;"><i class="bi bi-inbox me-1"></i>Pending: <strong>' + this.filteredData.length + '</strong></span></div></div>';

    var memberHeaders = this.members.map(function(m) { return '<th style="background:' + _esc(m.color) + ';text-align:center;">' + _esc(m.name) + '</th>'; }).join('');
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');

    var rows = this.filteredData.map(function(row) {
        var id = row.DocumentID || row.FormID || '';
        var memberCells = self.members.map(function(m) {
            var vote = (self.votes[id] || {})[m.name] || '';
            var icon = vote === 'approved' ? '<i class="bi bi-check-circle-fill" style="color:#28a745;"></i>' :
                       vote === 'denied' ? '<i class="bi bi-x-circle-fill" style="color:#dc3545;"></i>' :
                       vote === 'more-info' ? '<i class="bi bi-question-circle-fill" style="color:#ffc107;"></i>' : '-';
            return '<td style="background:' + _esc(m.color) + ';text-align:center;">' + icon + '</td>';
        }).join('');
        var cells = self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
        return '<tr><td><button class="view-btn" onclick="window.open(\\'' + encodeURI(row.url || '#') + '\\')"><i class="bi bi-eye"></i> View</button></td>' + cells + memberCells +
            '<td style="white-space:nowrap;">' +
            '<button class="vote-btn vote-approve" onclick="dashboard.castVote(\\'' + _esc(id) + '\\',\\'approved\\')"><i class="bi bi-check-circle"></i></button>' +
            '<button class="vote-btn vote-deny" onclick="dashboard.castVote(\\'' + _esc(id) + '\\',\\'denied\\')"><i class="bi bi-x-circle"></i></button>' +
            '<button class="vote-btn vote-info" onclick="dashboard.castVote(\\'' + _esc(id) + '\\',\\'more-info\\')"><i class="bi bi-question-circle"></i></button></td></tr>';
    }).join('');

    container.innerHTML = userBar + '<div style="overflow-x:auto;"><table class="data-table" style="min-width:1200px;"><thead><tr><th>Document</th>' +
        colHeaders + memberHeaders + '<th>Your Vote</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
};

DashboardViewModel.prototype.castVote = function(id, decision) {
    var user = DashboardConfig.currentUser || (this.members[0] ? this.members[0].name : 'You');
    var self = this;
    var voteMap = { approved: 'Approve', denied: 'Deny', 'more-info': 'Abstain' };
    if (typeof integration !== 'undefined' && castVoteIntegration) {
        integration.all(castVoteIntegration, { DocumentID: id, MemberSlot: (DashboardConfig.memberSlot || 'A'), Vote: (voteMap[decision] || decision), VotedBy: user }).then(function() {
            showToast('Vote recorded: ' + decision, 'success');
            _refreshDashboard(1500);
        }).catch(function(err) { showToast('Vote failed: ' + (err.message || 'Error'), 'error'); });
    } else {
        if (!this.votes[id]) this.votes[id] = {};
        this.votes[id][user] = decision;
        this.render();
        showToast('Vote recorded: ' + decision);
    }
};

` + vmInit();
}

// --- Style 11: Cards Dashboard ---
function generateVM_cards() {
    var sc = State.styleConfig;
    var titleField = escapeJS(sc.cardTitleField || 'Name');
    var statusField = escapeJS(sc.cardStatusField || 'Status');
    var leadField = escapeJS(sc.cardLeadField || 'Lead');
    var budgetField = sc.cardBudgetField ? escapeJS(sc.cardBudgetField) : '';

    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var statusCounts = {};
    this.filteredData.forEach(function(r) { var s = r['${statusField}'] || 'Unknown'; statusCounts[s] = (statusCounts[s] || 0) + 1; });
    var total = this.filteredData.length;
    var statusColors = {'On Track':'#059669','At Risk':'#D97706','Delayed':'#DC2626','Complete':'#006747','Pending':'#6366f1','Approved':'#059669','Denied':'#DC2626'};

    var statusList = Object.entries(statusCounts).map(function(e) {
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
            '<div style="width:12px;height:12px;border-radius:50%;background:' + (statusColors[e[0]]||'#888') + ';"></div>' +
            '<span>' + e[0] + ': <strong>' + e[1] + '</strong></span></div>';
    }).join('');

    var metricsHtml = '<div class="cards-metrics-row">' +
        '<div class="cards-metric-card"><h6>Status Overview</h6><div class="cards-status-list">' + statusList + '</div></div>' +
        '<div class="cards-metric-card"><h6>Total Items</h6><div style="font-size:2.5rem;font-weight:700;color:#006341;">' + total + '</div></div></div>';

    var cardsHtml = '<div class="cards-grid">' + this.filteredData.map(function(row) {
        var title = row['${titleField}'] || 'Untitled';
        var status = row['${statusField}'] || 'Unknown';
        var lead = row['${leadField}'] || '';
        ${budgetField ? `var budget = row['${budgetField}'] || '';` : "var budget = '';"}
        var color = statusColors[status] || '#888';
        return '<div class="item-card"><div class="item-card-header"><div><div class="item-card-title">' + _esc(title) + '</div>' +
            '<div class="item-card-meta">' + (lead ? 'Lead: ' + _esc(lead) : '') + '</div></div>' +
            '<span class="status-badge" style="background:' + color + '15;color:' + color + ';border:1px solid ' + color + '30;">' + _esc(status) + '</span></div>' +
            '<div class="item-card-body">' + (budget ? '<small style="color:#666;">Budget: ' + _esc(budget) + '</small>' : '') + '</div></div>';
    }).join('') + '</div>';

    container.innerHTML = metricsHtml + cardsHtml;
};
` + vmInit();
}

// --- Style 12: Bulk Actions ---
function generateVM_bulkActions() {
    var targets = State.styleConfig.reassignTargets || [];
    return vmPreamble() + vmBaseClass() + `
DashboardViewModel.prototype.reassignTargets = ${JSON.stringify(targets)};
DashboardViewModel.prototype.selectedIds = [];

DashboardViewModel.prototype.render = function() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;
    var self = this;
    var count = this.selectedIds.length;

    var targetsMenu = this.reassignTargets.map(function(t) { return '<a onclick="dashboard.bulkReassign(\\'' + _esc(t) + '\\')">' + _esc(t) + '</a>'; }).join('');
    var actionBar = '<div class="action-bar"><div class="action-bar-left">' +
        '<button class="btn btn-success" onclick="dashboard.bulkAction(\\'approve\\')" ' + (count===0?'disabled':'') + '><i class="bi bi-check-circle me-1"></i>Bulk Approve (' + count + ')</button>' +
        '<button class="btn btn-danger" onclick="dashboard.bulkAction(\\'deny\\')" ' + (count===0?'disabled':'') + '><i class="bi bi-x-circle me-1"></i>Bulk Deny (' + count + ')</button>' +
        '<div class="reassign-wrapper"><button class="btn btn-info" onclick="toggleReassignMenu()"><i class="bi bi-arrow-repeat me-1"></i>Reassign</button>' +
        '<div class="reassign-dropdown" id="reassignMenu" style="display:none;">' + targetsMenu + '</div></div></div>' +
        '<div class="action-bar-right"><button class="btn btn-warning" onclick="dashboard.exportSelected()"><i class="bi bi-download me-1"></i>Export Selected</button></div></div>';

    var swimlanesHtml = this.config.swimlanes.map(function(sl) {
        var rows = self.getRowsForSwimlane(sl);
        return self.renderBulkSwimlane(sl, rows);
    }).join('');

    container.innerHTML = actionBar + swimlanesHtml;
};

DashboardViewModel.prototype.renderBulkSwimlane = function(swimlane, rows) {
    var self = this;
    var colHeaders = this.config.columns.map(function(col) { return '<th>' + _esc(col.label) + '</th>'; }).join('');
    var rowsHtml = rows.map(function(row) {
        var id = row.DocumentID || row.FormID || row.RequestID || '';
        var cells = self.config.columns.map(function(col) { return '<td>' + _esc(row[col.field] || '-') + '</td>'; }).join('');
        return '<tr><td><input type="checkbox" class="bulk-cb" data-id="' + _esc(id) + '" onchange="dashboard.updateSelection()"></td>' + cells +
            '<td><div class="row-action-dropdown"><button class="btn btn-sm btn-secondary" onclick="toggleRowMenu(this)"><i class="bi bi-three-dots-vertical"></i></button>' +
            '<div class="row-action-menu"><a onclick="window.open(\\'' + encodeURI(row.url || '#') + '\\')">View Details</a>' +
            '<a onclick="dashboard.quickAction(\\'' + _esc(id) + '\\',\\'approve\\')">Quick Approve</a>' +
            '<a onclick="dashboard.quickAction(\\'' + _esc(id) + '\\',\\'deny\\')">Quick Deny</a></div></div></td></tr>';
    }).join('');
    return '<div class="swimlane"><div class="swimlane-header" onclick="toggleSwimlane(this)">' +
        '<i class="bi bi-chevron-down"></i><span>' + _esc(swimlane.name) + '</span><span class="count">' + rows.length + '</span></div>' +
        '<div class="swimlane-content"><table class="data-table" style="min-width:1200px;"><thead><tr><th style="width:40px;"><input type="checkbox" onchange="dashboard.toggleAllBulk(this)"></th>' +
        colHeaders + '<th>Actions</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>';
};

DashboardViewModel.prototype.updateSelection = function() {
    this.selectedIds = Array.from(document.querySelectorAll('.bulk-cb:checked')).map(function(c) { return c.dataset.id; });
    // Update action bar counts without full re-render
    var btns = document.querySelectorAll('.action-bar .btn');
    btns.forEach(function(b) { if (b.textContent.match(/\\(\\d+\\)/)) b.disabled = (dashboard.selectedIds.length === 0); });
};
DashboardViewModel.prototype.toggleAllBulk = function(cb) {
    cb.closest('table').querySelectorAll('.bulk-cb').forEach(function(c) { c.checked = cb.checked; });
    this.updateSelection();
};
DashboardViewModel.prototype.bulkAction = function(action) {
    if (this.selectedIds.length === 0) return;
    var self = this; var count = this.selectedIds.length;
    if (typeof integration !== 'undefined' && bulkDecisionIntegration) {
        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'block');
        integration.all(bulkDecisionIntegration, { FormIDs: this.selectedIds.join(','), Decision: action, DecidedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {
            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');
            showToast('Bulk ' + action + ' applied to ' + count + ' item(s)', 'success');
            self.selectedIds = []; _refreshDashboard(1500);
        }).catch(function(err) {
            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');
            showToast('Bulk action failed: ' + (err.message || 'Error'), 'error');
        });
    } else { alert('Bulk ' + action + ' applied to ' + count + ' item(s).'); self.selectedIds = []; self.render(); }
};
DashboardViewModel.prototype.bulkReassign = function(target) {
    if (this.selectedIds.length === 0) return;
    var self = this; var count = this.selectedIds.length;
    document.getElementById('reassignMenu').style.display = 'none';
    if (typeof integration !== 'undefined' && bulkDecisionIntegration) {
        document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'block');
        integration.all(bulkDecisionIntegration, { FormIDs: this.selectedIds.join(','), Decision: 'Reassign', ReassignTarget: target, DecidedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {
            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');
            showToast('Reassigned ' + count + ' item(s) to ' + target, 'success');
            self.selectedIds = []; _refreshDashboard(1500);
        }).catch(function(err) {
            document.querySelector('.loading') && (document.querySelector('.loading').style.display = 'none');
            showToast('Reassign failed: ' + (err.message || 'Error'), 'error');
        });
    } else { alert('Reassigned ' + count + ' item(s) to ' + target); self.selectedIds = []; self.render(); }
};
DashboardViewModel.prototype.quickAction = function(id, action) {
    if (typeof integration !== 'undefined' && recordDecisionIntegration) {
        integration.all(recordDecisionIntegration, { FormID: id, Decision: action, DecidedBy: (DashboardConfig.currentUser || 'Unknown') }).then(function() {
            showToast(action + ' recorded', 'success'); _refreshDashboard(1500);
        }).catch(function(err) { showToast('Action failed: ' + (err.message || 'Error'), 'error'); });
    } else { alert(action + ' applied to ' + id); }
};
DashboardViewModel.prototype.exportSelected = function() {
    if (this.selectedIds.length === 0) { alert('Select items first.'); return; }
    var self = this;
    var selected = this.data.filter(function(row) {
        var id = row.DocumentID || row.FormID || row.RequestID || '';
        return self.selectedIds.indexOf(String(id)) !== -1;
    });
    if (selected.length === 0) { alert('No matching rows found.'); return; }
    var headers = self.config.columns.map(function(c) { return c.label; });
    var csvRows = [headers.join(',')];
    selected.forEach(function(row) {
        var cells = self.config.columns.map(function(c) { return '"' + String(row[c.field] || '').replace(/"/g, '""') + '"'; });
        csvRows.push(cells.join(','));
    });
    var blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'selected_export.csv'; a.click();
    showToast('Exported ' + selected.length + ' item(s)', 'success');
};

function toggleReassignMenu() { var m = document.getElementById('reassignMenu'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; }
function toggleRowMenu(btn) { document.querySelectorAll('.row-action-menu.show').forEach(function(m) { m.classList.remove('show'); }); btn.nextElementSibling.classList.toggle('show'); }
document.addEventListener('click', function(e) { if (!e.target.closest('.row-action-dropdown')) { document.querySelectorAll('.row-action-menu.show').forEach(function(m) { m.classList.remove('show'); }); } });
` + vmInit();
}

// ============================================================================
// PREVIEW OVERRIDE (Style-Aware)
// ============================================================================

function renderPreview() {
    const container = document.getElementById('previewContent');
    if (!container) return;

    const title = State.dashboardTitle || 'My Dashboard';
    const style = State.selectedStyle || 'simple-status';
    const styleDef = DashboardStyles.find(s => s.id === style);
    const swimlanes = State.swimlanes.length > 0 ? State.swimlanes : [{ name: 'In Progress' }, { name: 'Completed' }];

    // Get columns
    let columns = [];
    if (State.mode === 'content') {
        const fields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        columns = fields.filter(f => State.selectedFields.includes(f.id)).map(f => f.name);
    } else if (State.mode === 'forms') {
        const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        columns = inputs.filter(i => State.selectedInputIds.includes(i.id)).map(i => i.label);
    } else if (State.mode === 'combined') {
        const docFields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        const formInputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        columns = docFields.filter(f => State.selectedFields.includes(f.id)).map(f => f.name)
                   .concat(formInputs.filter(i => State.selectedInputIds.includes(i.id)).map(i => i.label));
    }
    if (columns.length === 0) columns = ['Name', 'Date', 'Status'];
    columns = columns.slice(0, 3);

    const fakeData = generateFakePreviewData(columns);

    // Style-specific preview additions
    let styleIndicator = '';
    let extraPreview = '';

    if (styleDef) {
        styleIndicator = `<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:#f0f7f4;border-radius:6px;margin-bottom:8px;font-size:0.7rem;color:var(--primary);">
            <i class="bi ${styleDef.icon}"></i> ${styleDef.name}
        </div>`;
    }

    if (style === 'claims') {
        extraPreview = `<div style="background:#f8f9fa;border-left:3px solid var(--primary);padding:6px 8px;margin-bottom:6px;border-radius:4px;font-size:0.65rem;">
            <strong style="color:var(--primary);">Your Stats</strong>: 2 Claimed | 47 Total
            <div style="margin-top:3px;display:flex;gap:4px;">
                ${(State.styleConfig.filterChips || ['All']).slice(0, 3).map((c, i) => `<span style="padding:2px 6px;background:${i === 0 ? 'var(--primary)' : '#e9ecef'};color:${i === 0 ? '#fff' : '#333'};border-radius:10px;font-size:0.6rem;">${c}</span>`).join('')}
            </div>
        </div>`;
    } else if (style === 'committee-voting') {
        const members = (State.styleConfig.committeeMembers || []).slice(0, 4);
        const memberCols = members.map(m => `<th style="background:${m.color};font-size:0.55rem;padding:2px 4px;text-align:center;">${m.name.split(' ').pop()}</th>`).join('');
        extraPreview = `<div style="font-size:0.6rem;background:var(--primary);color:#fff;padding:4px 8px;border-radius:4px;margin-bottom:6px;">Committee Voting | ${members.length} Members</div>`;
    } else if (style === 'expandable' || style === 'pdf-signatures' || style === 'award-nominations') {
        extraPreview = `<div style="font-size:0.6rem;color:#888;margin-bottom:4px;"><i class="bi bi-arrows-expand"></i> Rows expandable with +/- toggle</div>`;
    } else if (style === 'alpha-split') {
        extraPreview = `<div style="font-size:0.6rem;color:#888;margin-bottom:4px;"><i class="bi bi-sort-alpha-down"></i> Auto-split: ${(State.styleConfig.alphaRanges || []).map(r => r[0] + '-' + r[1]).join(', ')}</div>`;
    } else if (style === 'workflow-actions') {
        extraPreview = `<div style="font-size:0.6rem;color:#888;margin-bottom:4px;"><i class="bi bi-lightning"></i> Action buttons per swimlane</div>`;
    } else if (style === 'survey-analytics') {
        extraPreview = `<div style="display:flex;gap:6px;margin-bottom:6px;">
            <div style="background:#fff;border-left:2px solid var(--primary);padding:4px 8px;border-radius:4px;font-size:0.6rem;text-align:center;"><strong style="color:var(--primary);">47</strong><br>Responses</div>
            <div style="background:#fff;border-left:2px solid var(--primary);padding:4px 8px;border-radius:4px;font-size:0.6rem;text-align:center;"><strong style="color:var(--primary);">4.2</strong><br>Avg Rating</div>
        </div>`;
    } else if (style === 'cards-dashboard') {
        extraPreview = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
            <div style="background:#fff;border:1px solid #e9ecef;border-radius:4px;padding:6px;font-size:0.6rem;">
                <div style="font-weight:600;">Item A</div>
                <span style="background:#05966915;color:#059669;padding:1px 4px;border-radius:2px;font-size:0.5rem;">On Track</span>
            </div>
            <div style="background:#fff;border:1px solid #e9ecef;border-radius:4px;padding:6px;font-size:0.6rem;">
                <div style="font-weight:600;">Item B</div>
                <span style="background:#D9770615;color:#D97706;padding:1px 4px;border-radius:2px;font-size:0.5rem;">At Risk</span>
            </div>
        </div>`;
    } else if (style === 'bulk-actions') {
        extraPreview = `<div style="background:#f8f9fa;padding:4px 8px;border-radius:4px;margin-bottom:6px;font-size:0.6rem;display:flex;gap:4px;">
            <span style="background:#28a745;color:#fff;padding:2px 6px;border-radius:3px;">Approve (0)</span>
            <span style="background:#dc3545;color:#fff;padding:2px 6px;border-radius:3px;">Deny (0)</span>
            <span style="background:#17a2b8;color:#fff;padding:2px 6px;border-radius:3px;">Reassign</span>
        </div>`;
    }

    // Build swimlane previews
    const swimlanesHtml = swimlanes.map((sl, idx) => {
        const rowCount = idx === 0 ? 3 : 2;
        const rows = fakeData.slice(0, rowCount).map(row => `
            <tr>${columns.map(col => `<td>${row[col] || '—'}</td>`).join('')}</tr>
        `).join('');

        const filterSummary = sl.filters && sl.filters.length > 0
            ? sl.filters.map(f => `${f.fieldName}: ${f.values.slice(0,2).join(', ')}${f.values.length > 2 ? '...' : ''}`).join(' | ')
            : '';

        return `
            <div class="preview-swimlane">
                <div class="preview-swimlane-header">
                    <i class="bi bi-chevron-down" style="font-size:0.7rem;"></i>
                    ${sl.name}
                    <span class="count">${rowCount}</span>
                </div>
                ${filterSummary ? `<div class="preview-filter-hint"><i class="bi bi-funnel"></i> ${filterSummary}</div>` : ''}
                <table class="preview-table">
                    <thead><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="preview-label"><i class="bi bi-eye"></i> Preview</div>
        <div class="preview-dashboard">
            <div class="preview-dashboard-header">
                <h4>${title}</h4>
                <small>${State.mode === 'content' ? 'Document' : State.mode === 'forms' ? 'Forms' : 'Combined'} Dashboard</small>
            </div>
            ${styleIndicator}
            ${extraPreview}
            ${style === 'cards-dashboard' ? '' : swimlanesHtml}
        </div>
    `;
}

// ============================================================================
// WRITE-BACK SQL SCHEMA GENERATORS
// ============================================================================

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
    return s === 'claims' || s === 'workflow-actions' || s === 'committee-voting' || s === 'bulk-actions';
}

function generateSchemaSQL() {
    var s = State.selectedStyle;
    if (s === 'claims') return generateSchema_claims();
    if (s === 'committee-voting') return generateSchema_voting();
    if (s === 'workflow-actions') return generateSchema_workflowActions();
    if (s === 'bulk-actions') return generateSchema_bulkActions();
    return '';
}

// --- Claims System Schema ---
function generateSchema_claims() {
    var n = safeName(State.dashboardTitle);
    var sql = '';
    sql += '-- ============================================\n';
    sql += '-- ' + (State.dashboardTitle || 'Dashboard') + ' - Claims System Schema\n';
    sql += '-- Generated by Dashboard Builder Wizard\n';
    sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
    sql += '-- ============================================\n\n';

    // Claims table
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

    // Audit table
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

    // sp_ClaimItem
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

    // sp_UnclaimItem
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

    // sp_GetClaimsStatus
    sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetClaimsStatus]\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
    sql += '    SELECT [ClaimID], [FormID], [ClaimedBy], [ClaimedDate], [Status]\n';
    sql += '    FROM [dbo].[' + n + '_Claims] WHERE [Status] = \'Active\'\n';
    sql += 'END\nGO\n\n';

    return sql;
}

// --- Committee Voting Schema ---
function generateSchema_voting() {
    var n = safeName(State.dashboardTitle);
    var members = State.styleConfig.committeeMembers || [];
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var sql = '';

    sql += '-- ============================================\n';
    sql += '-- ' + (State.dashboardTitle || 'Dashboard') + ' - Committee Voting Schema\n';
    sql += '-- Generated by Dashboard Builder Wizard\n';
    sql += '-- Committee Members: ' + members.length + '\n';
    sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
    sql += '-- ============================================\n\n';

    // Votes table
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
    // ApproveCount computed
    var appParts = []; var denyParts = []; var completeParts = [];
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

    // Members table
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

    // Vote History table
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

    // sp_CastVote
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

    // sp_FinalDecision
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

    // sp_GetDashboard
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

    // sp_GetUserInfo
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

// --- Workflow Actions Schema ---
function generateSchema_workflowActions() {
    var n = safeName(State.dashboardTitle);
    var sql = '';

    sql += '-- ============================================\n';
    sql += '-- ' + (State.dashboardTitle || 'Dashboard') + ' - Workflow Actions Schema\n';
    sql += '-- Generated by Dashboard Builder Wizard\n';
    sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
    sql += '-- ============================================\n\n';

    // ActionQueue table
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

    // ActionLog table
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

    // sp_QueueAction
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

    // sp_GetPendingActions (for PowerShell agent)
    sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetPendingActions]\n    @MaxItems INT = 10\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
    sql += '    UPDATE TOP (@MaxItems) [dbo].[' + n + '_ActionQueue]\n';
    sql += '    SET [Status] = \'Processing\', [ProcessedDate] = GETDATE()\n';
    sql += '    OUTPUT inserted.[QueueID], inserted.[FormID], inserted.[ActionType], inserted.[ActionParams]\n';
    sql += '    WHERE [Status] = \'Pending\' ORDER BY [CreatedDate] ASC\n';
    sql += 'END\nGO\n\n';

    // sp_CompleteAction
    sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_CompleteAction]\n    @QueueID INT, @Success BIT, @Result NVARCHAR(MAX) = NULL\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
    sql += '    UPDATE [dbo].[' + n + '_ActionQueue] SET [Status] = CASE WHEN @Success = 1 THEN \'Completed\' ELSE \'Failed\' END,\n';
    sql += '        [Result] = @Result, [ProcessedDate] = GETDATE() WHERE [QueueID] = @QueueID\n\n';
    sql += '    SELECT \'{"success": true}\' AS response\n';
    sql += 'END\nGO\n\n';

    return sql;
}

// --- Bulk Actions Schema ---
function generateSchema_bulkActions() {
    var n = safeName(State.dashboardTitle);
    var sql = '';

    sql += '-- ============================================\n';
    sql += '-- ' + (State.dashboardTitle || 'Dashboard') + ' - Bulk Actions Schema\n';
    sql += '-- Generated by Dashboard Builder Wizard\n';
    sql += '-- Requires: On-prem SQL Server via Hybrid Connection\n';
    sql += '-- ============================================\n\n';

    // Decisions table
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

    // DecisionLog table
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

    // sp_RecordDecision
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

    // sp_BulkDecision
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

    // sp_GetDecisionStatus
    sql += 'CREATE OR ALTER PROCEDURE [dbo].[sp_' + n + '_GetDecisionStatus]\nAS\nBEGIN\n    SET NOCOUNT ON;\n\n';
    sql += '    SELECT [DecisionID],[FormID],[Decision],[ReassignTarget],[DecidedBy],[DecidedDate],[Comment]\n';
    sql += '    FROM [dbo].[' + n + '_Decisions] ORDER BY [DecidedDate] DESC\n';
    sql += 'END\nGO\n\n';

    return sql;
}

// ============================================================================
// INTEGRATION INSTRUCTIONS GENERATOR
// ============================================================================

function generateIntegrationInstructions() {
    var n = safeName(State.dashboardTitle);
    var s = State.selectedStyle;
    var instructions = [];

    if (s === 'claims') {
        instructions.push({ name: n + '_ClaimItem', method: 'POST', sql: 'EXEC sp_' + n + '_ClaimItem @FormID, @ClaimedBy', desc: 'Claim an item (called by Claim button)' });
        instructions.push({ name: n + '_UnclaimItem', method: 'POST', sql: 'EXEC sp_' + n + '_UnclaimItem @FormID, @ClaimedBy', desc: 'Release a claim (called by Unclaim button)' });
        instructions.push({ name: n + '_GetClaims', method: 'GET', sql: 'EXEC sp_' + n + '_GetClaimsStatus', desc: 'Read active claims (join with form data)' });
    } else if (s === 'committee-voting') {
        instructions.push({ name: n + '_CastVote', method: 'POST', sql: 'EXEC sp_' + n + '_CastVote @DocumentID, @MemberSlot, @Vote, @VotedBy, @Comment', desc: 'Cast or change a vote' });
        instructions.push({ name: n + '_FinalDecision', method: 'POST', sql: 'EXEC sp_' + n + '_FinalDecision @DocumentID, @Decision, @DecisionBy, @Comment', desc: 'Submit final decision (Chair only)' });
        instructions.push({ name: n + '_GetDashboard', method: 'GET', sql: 'EXEC sp_' + n + '_GetDashboard', desc: 'Read dashboard data with vote status' });
        instructions.push({ name: n + '_GetUserInfo', method: 'GET', sql: 'EXEC sp_' + n + '_GetUserInfo @Username, @DocumentID', desc: 'Check if user can vote and their current vote' });
    } else if (s === 'workflow-actions') {
        instructions.push({ name: n + '_QueueAction', method: 'POST', sql: 'EXEC sp_' + n + '_QueueAction @FormID, @ActionType, @ActionParams', desc: 'Queue a workflow action' });
        instructions.push({ name: n + '_GetPending', method: 'GET', sql: 'EXEC sp_' + n + '_GetPendingActions', desc: 'Get pending queue items (for PowerShell agent)' });
        instructions.push({ name: n + '_CompleteAction', method: 'POST', sql: 'EXEC sp_' + n + '_CompleteAction @QueueID, @Success, @Result', desc: 'Mark queue item complete (called by agent)' });
    } else if (s === 'bulk-actions') {
        instructions.push({ name: n + '_RecordDecision', method: 'POST', sql: 'EXEC sp_' + n + '_RecordDecision @FormID, @Decision, @DecidedBy, @ReassignTarget, @Comment', desc: 'Record a single decision' });
        instructions.push({ name: n + '_BulkDecision', method: 'POST', sql: 'EXEC sp_' + n + '_BulkDecision @FormIDs, @Decision, @DecidedBy, @ReassignTarget, @Comment', desc: 'Record bulk decisions (comma-separated FormIDs)' });
        instructions.push({ name: n + '_GetDecisions', method: 'GET', sql: 'EXEC sp_' + n + '_GetDecisionStatus', desc: 'Read all decisions (join with form data)' });
    }

    return instructions;
}

// ============================================================================
// STYLE STEP OVERRIDE — Add SQL Required badges to write-back style cards
// ============================================================================

function renderStyleStep() {
    const categories = ['Basic', 'Advanced', 'Specialized'];
    let html = `
        <div class="step-description">
            <p><i class="bi bi-lightbulb" style="color:var(--accent);margin-right:8px;"></i>
            Each style includes different features and layouts. Pick the one that best matches your workflow.</p>
        </div>
    `;

    categories.forEach(cat => {
        const styles = DashboardStyles.filter(s => s.category === cat);
        html += `<div class="style-category-label">${cat}</div>
                 <div class="style-grid">`;
        styles.forEach(s => {
            const selected = State.selectedStyle === s.id;
            const sqlBadge = getStyleBadgeHTML(s.id);
            html += `
                <div class="style-select-card ${selected ? 'selected' : ''}" onclick="selectStyle('${s.id}')">
                    <div class="style-select-icon"><i class="bi ${s.icon}"></i></div>
                    <div class="style-select-info">
                        <div class="style-select-name">${s.name}${sqlBadge ? ' ' + sqlBadge : ''}</div>
                        <div class="style-select-desc">${s.description}</div>
                        <div class="style-select-best"><strong>Best for:</strong> ${s.bestFor}</div>
                    </div>
                    ${selected ? '<div class="style-select-check"><i class="bi bi-check-circle-fill"></i></div>' : ''}
                </div>
            `;
        });
        html += '</div>';
    });

    return html;
}

// ============================================================================
// GENERATE STEP OVERRIDE — Write-back warning, schema, integration instructions
// ============================================================================

// Save the original from wizard-demo.js before we override it
// Must use var + reassign pattern because function declarations hoist
var _baseRenderGenerateStep = null;
(function() {
    // At script load time, wizard-demo.js's version is available on the global scope
    // We save it via an IIFE that runs immediately
    // But since our function declaration also hoists, we inline the base logic instead
})();

// Instead of calling the original (which gets hoisted away), we inline the base generate step
function _buildBaseGenerateStep() {
    var sql = State.customSQL || generateSQL();

    var summary = [];
    summary.push('<strong>Dashboard Name:</strong> ' + (State.dashboardTitle || 'Untitled Dashboard'));
    if (State.advancedMode) {
        summary.push('<strong>Source Name:</strong> <code>' + State.sourceName + '</code>');
    }
    if (State.mode === 'content' && State.selectedArea) {
        summary.push('<strong>Folder:</strong> ' + State.selectedArea.name);
        summary.push('<strong>Document Types:</strong> ' + State.selectedDocTypes.length + ' selected');
        summary.push('<strong>Columns:</strong> ' + State.selectedFields.length + ' fields');
    } else if (State.mode === 'forms' && State.selectedTemplate) {
        summary.push('<strong>Form:</strong> ' + State.selectedTemplate.name);
        summary.push('<strong>Fields:</strong> ' + State.selectedInputIds.length + ' selected');
        summary.push('<strong>Workflow Steps:</strong> ' + State.selectedWorkflowSteps.length + ' tracked');
    } else if (State.mode === 'combined') {
        if (State.selectedArea) {
            summary.push('<strong>Document Folder:</strong> ' + State.selectedArea.name);
            summary.push('<strong>Document Types:</strong> ' + State.selectedDocTypes.length + ' selected');
            summary.push('<strong>Document Fields:</strong> ' + State.selectedFields.length + ' fields');
        }
        if (State.selectedTemplate) {
            summary.push('<strong>Form:</strong> ' + State.selectedTemplate.name);
            summary.push('<strong>Form Fields:</strong> ' + State.selectedInputIds.length + ' selected');
        }
        if (State.selectedWorkflowSteps.length > 0) {
            summary.push('<strong>Workflow Steps:</strong> ' + State.selectedWorkflowSteps.length + ' tracked');
        }
    }
    summary.push('<strong>Groups:</strong> ' + State.swimlanes.map(function(s) { return s.name; }).join(', '));

    if (State.advancedMode) {
        return '\
            <div class="step-description" style="background:rgba(40,167,69,0.1);border-color:var(--success);">\
                <p><i class="bi bi-check-circle-fill" style="color:var(--success);margin-right:8px;"></i>\
                Your dashboard is ready! Review and customize the SQL below.</p>\
            </div>\
            <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">\
                <h4 style="margin-bottom:15px;color:var(--primary);"><i class="bi bi-clipboard-check"></i> Summary</h4>\
                <div style="line-height:2;">' + summary.map(function(s) { return '<div>' + s + '</div>'; }).join('') + '</div>\
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
                    <li>Create Source in Etrieve Central: <code>' + State.sourceName + '</code></li>\
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
            <div style="line-height:2;">' + summary.map(function(s) { return '<div>' + s + '</div>'; }).join('') + '</div>\
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
    // Get the base generate step HTML
    var baseHtml = _buildBaseGenerateStep();

    // If not a write-back style, return as-is
    if (!needsWriteBack()) {
        return baseHtml;
    }

    // Build write-back sections
    const style = State.selectedStyle;
    const schemaSQL = generateSchemaSQL();
    const instructions = generateIntegrationInstructions();
    const styleName = {
        'claims': 'Claims System',
        'committee-voting': 'Committee Voting',
        'workflow-actions': 'Workflow Actions',
        'bulk-actions': 'Bulk Actions'
    }[style] || style;

    // Warning banner
    const warningBanner = `
        <div class="writeback-warning-banner">
            <div style="display:flex;align-items:flex-start;gap:12px;">
                <i class="bi bi-exclamation-triangle-fill" style="font-size:1.4rem;color:#856404;flex-shrink:0;margin-top:2px;"></i>
                <div>
                    <strong>On-Prem SQL Server Required</strong>
                    <p style="margin:6px 0 0;font-size:0.9rem;">
                        The <strong>${styleName}</strong> style requires an on-prem SQL Server connected via Hybrid Server
                        to track state (votes, claims, decisions, etc.). The generated SQL schema must be deployed
                        to your SQL Server <strong>before</strong> the dashboard will work.
                    </p>
                </div>
            </div>
        </div>`;

    // Schema SQL section (collapsible)
    const schemaSection = `
        <div class="writeback-schema-section">
            <div class="schema-header" onclick="toggleSchemaSection(this)">
                <h4 style="margin:0;display:flex;align-items:center;gap:8px;">
                    <i class="bi bi-database-fill-gear" style="color:var(--primary);"></i>
                    Database Schema (Run First)
                    <span class="badge-sql-required">SQL</span>
                </h4>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button class="btn btn-sm" onclick="event.stopPropagation();copySchemaSQL(event)" title="Copy schema SQL">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <i class="bi bi-chevron-down schema-chevron"></i>
                </div>
            </div>
            <div class="schema-body" style="display:none;">
                <p style="margin:0 0 12px;font-size:0.85rem;color:#666;">
                    <i class="bi bi-info-circle"></i> Run this SQL on your on-prem SQL Server before setting up integrations.
                    Creates all required tables, indexes, and stored procedures.
                </p>
                <div class="sql-preview schema-sql-preview">
                    <pre id="schemaPreview">${escapeHtml(schemaSQL)}</pre>
                </div>
            </div>
        </div>`;

    // Integration instructions section (collapsible)
    let instructionRows = instructions.map(inst => `
        <tr>
            <td><code>${escapeHtml(inst.name)}</code></td>
            <td><span class="badge ${inst.method === 'POST' ? 'bg-warning' : 'bg-info'}" style="font-size:0.75rem;">${inst.method}</span></td>
            <td><code style="font-size:0.8rem;">${escapeHtml(inst.sql)}</code></td>
            <td style="font-size:0.85rem;">${escapeHtml(inst.desc)}</td>
        </tr>`).join('');

    const instructionsSection = `
        <div class="writeback-schema-section" style="margin-top:15px;">
            <div class="schema-header" onclick="toggleSchemaSection(this)">
                <h4 style="margin:0;display:flex;align-items:center;gap:8px;">
                    <i class="bi bi-plug-fill" style="color:var(--accent);"></i>
                    Integration Setup Instructions
                </h4>
                <i class="bi bi-chevron-down schema-chevron"></i>
            </div>
            <div class="schema-body" style="display:none;">
                <p style="margin:0 0 12px;font-size:0.85rem;color:#666;">
                    <i class="bi bi-info-circle"></i> Create these integration sources in
                    <strong>Etrieve Central → Admin Settings → Sources</strong>.
                    Point each to your Hybrid Server connection.
                </p>
                <div style="overflow-x:auto;">
                    <table class="integration-table">
                        <thead>
                            <tr>
                                <th>Integration Name</th>
                                <th>Method</th>
                                <th>SQL Command</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>${instructionRows}</tbody>
                    </table>
                </div>
                <div style="margin-top:12px;padding:10px 14px;background:rgba(23,162,184,0.08);border-radius:8px;font-size:0.85rem;">
                    <strong>Important:</strong> After creating each source, go to your dashboard form under
                    <strong>Connect → Available Sources</strong> and add it. Check <strong>"Get"</strong> for
                    read sources and <strong>"Post"</strong> for write sources.
                </div>
            </div>
        </div>`;

    // Insert write-back sections after the summary div but before SQL/download sections
    // Find the summary div closing point
    const summaryEndMarker = '<!-- writeback-insert-point -->';
    if (baseHtml.indexOf(summaryEndMarker) !== -1) {
        return baseHtml.replace(summaryEndMarker, warningBanner + schemaSection + instructionsSection);
    }

    // Fallback: insert after the first step-description div
    const stepDescEnd = baseHtml.indexOf('</div>', baseHtml.indexOf('step-description'));
    if (stepDescEnd !== -1) {
        const insertPoint = baseHtml.indexOf('</div>', stepDescEnd + 6); // after summary div
        if (insertPoint !== -1) {
            // Find the end of the summary block (second closing div after step-description)
            let searchFrom = baseHtml.indexOf('clipboard-check');
            if (searchFrom !== -1) {
                // Find the closing </div> of the summary container
                let depth = 0;
                let idx = baseHtml.indexOf('<div', searchFrom - 50);
                for (let i = idx; i < baseHtml.length; i++) {
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

    // Last fallback: prepend warning banner and append schema sections to end
    return warningBanner + baseHtml + schemaSection + instructionsSection;
}

function toggleSchemaSection(header) {
    const body = header.nextElementSibling;
    const chevron = header.querySelector('.schema-chevron');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        chevron.classList.add('rotated');
    } else {
        body.style.display = 'none';
        chevron.classList.remove('rotated');
    }
}

function copySchemaSQL(e) {
    const schemaSQL = generateSchemaSQL();
    navigator.clipboard.writeText(schemaSQL).then(function() {
        var btn = e.target.closest('button');
        if (btn) {
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(function() { btn.innerHTML = orig; }, 2000);
        }
    });
}

// ============================================================================
// DOWNLOAD OVERRIDE — Include schema.sql for write-back styles
// ============================================================================

function generateDashboardFiles() {
    // Build base file set (inlined to avoid recursive hoisting bug)
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

    // Add schema.sql for write-back styles
    if (needsWriteBack()) {
        var schemaSQL = generateSchemaSQL();
        if (schemaSQL) {
            files['schema.sql'] = schemaSQL;
        }
    }

    return files;
}

// ============================================================================
// STYLE CARD BADGE HELPER — Called from renderStyleStep to add SQL badges
// ============================================================================

function getStyleBadgeHTML(styleId) {
    var writeBackStyles = ['claims', 'workflow-actions', 'committee-voting', 'bulk-actions'];
    if (writeBackStyles.indexOf(styleId) !== -1) {
        return '<span class="badge-sql-required" title="Requires on-prem SQL Server via Hybrid Server">SQL Required</span>';
    }
    return '';
}

console.log('Dashboard Builder Wizard 3.0 - Style generators + write-back SQL loaded');
