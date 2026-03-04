/**
 * Dashboard Builder Wizard - Preview Coordinator
 * Dispatches to style-specific preview renderers in sub-files.
 * Loaded via RequireJS after wizard-templates.js.
 */

// ============================================================================
// PREVIEW DATA GENERATION
// ============================================================================

function generateFakePreviewData(columns, rowCount) {
    var fakeNames = ['John Smith', 'Maria Garcia', 'James Wilson', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'Robert Lee', 'Ana Martinez'];
    var fakeDates = ['01/15/2026', '01/14/2026', '01/13/2026', '01/12/2026', '01/11/2026', '12/28/2025', '12/15/2025', '11/30/2025'];
    var fakeStatuses = ['Pending', 'Approved', 'In Review', 'Submitted', 'Complete', 'Denied', 'On Hold', 'Cancelled'];
    var fakeDepts = ['Financial Aid', 'Admissions', 'HR', 'IT', 'Marketing', 'Facilities', 'Registrar', 'Student Life'];
    var fakeEmails = ['jsmith', 'mgarcia', 'jwilson', 'sjohnson', 'mbrown', 'edavis', 'rlee', 'amartinez'];
    var count = rowCount || 5;

    return fakeNames.slice(0, count).map(function(name, i) {
        var row = {};
        columns.forEach(function(col) {
            var colLower = col.toLowerCase();
            if (colLower.includes('name') || colLower.includes('requester') || colLower.includes('student') || colLower.includes('employee')) {
                row[col] = name;
            } else if (colLower.includes('date') || colLower.includes('submitted') || colLower.includes('created')) {
                row[col] = fakeDates[i];
            } else if (colLower.includes('status') || colLower.includes('step') || colLower.includes('workflow')) {
                row[col] = fakeStatuses[i];
            } else if (colLower.includes('dept') || colLower.includes('department') || colLower.includes('office')) {
                row[col] = fakeDepts[i];
            } else if (colLower.includes('email')) {
                row[col] = fakeEmails[i] + '@cod.edu';
            } else if (colLower.includes('id') || colLower.includes('number')) {
                row[col] = 'A' + (100000 + i * 1234);
            } else if (colLower.includes('amount') || colLower.includes('budget') || colLower.includes('cost') || colLower.includes('money')) {
                row[col] = '$' + ((i + 1) * 1250).toLocaleString();
            } else if (colLower.includes('rating') || colLower.includes('score')) {
                row[col] = (3 + Math.round(Math.random() * 20) / 10).toFixed(1);
            } else if (colLower.includes('comment') || colLower.includes('note') || colLower.includes('description')) {
                var comments = ['Great experience overall', 'Needs improvement in response time', 'Very helpful staff', 'Average service', 'Outstanding support'];
                row[col] = comments[i % comments.length];
            } else if (colLower.includes('type') || colLower.includes('category')) {
                var types = ['Type A', 'Type B', 'Type C', 'Type D'];
                row[col] = types[i % types.length];
            } else if (col === '...') {
                row[col] = '...';
            } else {
                row[col] = 'Data ' + (i + 1);
            }
        });
        // Always add url and IDs for View buttons
        row.url = '#';
        row.FormID = 'F' + (10000 + i);
        row.DocumentID = 'D' + (20000 + i);
        return row;
    });
}

// ============================================================================
// COLUMN RESOLUTION
// ============================================================================

function getPreviewColumns() {
    var columns = [];
    if (State.mode === 'content') {
        var fields = SimulatedData.keyFields[(State.selectedArea || {}).id] || [];
        columns = fields.filter(function(f) { return State.selectedFields.includes(f.id); })
                        .map(function(f) { return f.name; });
    } else if (State.mode === 'forms') {
        var inputs = SimulatedData.formInputIds[(State.selectedTemplate || {}).id] || [];
        columns = inputs.filter(function(i) { return State.selectedInputIds.includes(i.id); })
                        .map(function(i) { return i.label; });
    } else if (State.mode === 'combined') {
        var docFields = SimulatedData.keyFields[(State.selectedArea || {}).id] || [];
        var formInputs = SimulatedData.formInputIds[(State.selectedTemplate || {}).id] || [];
        columns = docFields.filter(function(f) { return State.selectedFields.includes(f.id); })
                           .map(function(f) { return f.name; })
                   .concat(formInputs.filter(function(i) { return State.selectedInputIds.includes(i.id); })
                                     .map(function(i) { return i.label; }));
    }
    if (columns.length === 0) columns = ['Name', 'Date', 'Status'];
    return columns;
}

function getPreviewSwimlanes() {
    return State.swimlanes.length > 0
        ? State.swimlanes
        : [{ name: 'In Progress' }, { name: 'Completed' }];
}

// ============================================================================
// SHARED PREVIEW PRIMITIVES
// ============================================================================

function previewTable(columns, data, options) {
    var opts = options || {};
    var maxCols = opts.maxCols || 4;
    var showView = opts.showView !== false;
    var showCheckbox = opts.showCheckbox || false;
    var extraHeaders = opts.extraHeaders || '';
    var extraCellsFn = opts.extraCellsFn || null;

    var displayCols = columns.slice(0, maxCols);

    var thHtml = (showCheckbox ? '<th style="width:28px;"><input type="checkbox" disabled></th>' : '') +
        displayCols.map(function(col) {
            return '<th class="preview-sortable-th">' + escapeHtml(col) +
                   ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
        }).join('') + extraHeaders + (showView ? '<th>Actions</th>' : '');

    var tbHtml = data.map(function(row) {
        var cells = (showCheckbox ? '<td><input type="checkbox" disabled></td>' : '') +
            displayCols.map(function(col) {
                return '<td>' + escapeHtml(row[col] || '-') + '</td>';
            }).join('') +
            (extraCellsFn ? extraCellsFn(row) : '') +
            (showView ? '<td><span class="preview-view-btn"><i class="bi bi-eye"></i> View</span></td>' : '');
        return '<tr>' + cells + '</tr>';
    }).join('');

    return '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';
}

function previewSwimlane(name, idx, contentHtml, count, filterSummary) {
    var slId = 'preview-sl-' + idx;
    return '<div class="preview-swimlane">' +
        '<div class="preview-swimlane-header" onclick="var c=document.getElementById(\'' + slId + '\');var ic=this.querySelector(\'i\');if(c.style.display===\'none\'){c.style.display=\'\';ic.className=\'bi bi-chevron-down\';}else{c.style.display=\'none\';ic.className=\'bi bi-chevron-right\';}" style="cursor:pointer;">' +
            '<i class="bi bi-chevron-down" style="font-size:0.7rem;"></i> ' +
            escapeHtml(name) +
            '<span class="count">' + (count || 0) + '</span>' +
            '<span class="preview-export-btn" style="margin-left:auto;"><i class="bi bi-download"></i> Export</span>' +
        '</div>' +
        (filterSummary ? '<div class="preview-filter-hint"><i class="bi bi-funnel"></i> ' + filterSummary + '</div>' : '') +
        '<div id="' + slId + '" class="preview-swimlane-body">' + contentHtml + '</div>' +
    '</div>';
}

function previewToolbar() {
    return '<div class="preview-toolbar">' +
        '<div class="preview-search"><i class="bi bi-search"></i><span>Search...</span></div>' +
        '<span class="preview-refresh-btn"><i class="bi bi-arrow-clockwise"></i> Refresh</span>' +
    '</div>';
}

function previewFilterSummary(sl) {
    if (!sl.filters || sl.filters.length === 0) return '';
    return sl.filters.map(function(f) {
        return escapeHtml(f.fieldName || f.field) + ': ' +
               f.values.slice(0, 2).map(function(v) { return escapeHtml(v); }).join(', ') +
               (f.values.length > 2 ? '...' : '');
    }).join(' | ');
}

function previewHeader(title, subtitle, styleDef) {
    var styleTag = styleDef
        ? '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:#f0f7f4;border-radius:6px;margin-bottom:8px;font-size:0.7rem;color:var(--primary);">' +
          '<i class="bi ' + escapeHtml(styleDef.icon) + '"></i> ' + escapeHtml(styleDef.name) + '</div>'
        : '';
    return '<div class="preview-label"><i class="bi bi-eye"></i> Live Preview</div>' +
        '<div class="preview-dashboard">' +
            '<div class="preview-dashboard-header">' +
                '<h4><i class="bi bi-grid-3x3-gap"></i> ' + escapeHtml(title) + '</h4>' +
                '<small>' + escapeHtml(subtitle) + '</small>' +
            '</div>' + styleTag;
}

// ============================================================================
// MAIN PREVIEW RENDERER (COORDINATOR)
// ============================================================================

function renderPreview() {
    var container = document.getElementById('previewContent');
    if (!container) return;

    var title = State.dashboardTitle || 'My Dashboard';
    var style = State.selectedStyle || 'simple-status';
    var styleDef = DashboardStyles.find(function(s) { return s.id === style; });
    var columns = getPreviewColumns();
    var swimlanes = getPreviewSwimlanes();
    var subtitle = (State.mode === 'content' ? 'Document' : State.mode === 'forms' ? 'Forms' : 'Combined') + ' Dashboard';

    // Dispatch to style-specific renderer
    var bodyHtml = '';
    switch (style) {
        // Basic styles (wizard-preview-basic.js)
        case 'simple-status':
            bodyHtml = previewSimpleStatus(columns, swimlanes); break;
        case 'request-type':
            bodyHtml = previewRequestType(columns, swimlanes); break;
        case 'alpha-split':
            bodyHtml = previewAlphaSplit(columns, swimlanes); break;
        // Advanced styles (wizard-preview-advanced.js)
        case 'expandable':
            bodyHtml = previewExpandable(columns, swimlanes); break;
        case 'claims':
            bodyHtml = previewClaims(columns, swimlanes); break;
        case 'workflow-actions':
            bodyHtml = previewWorkflowActions(columns, swimlanes); break;
        case 'pdf-signatures':
            bodyHtml = previewPdfSignatures(columns, swimlanes); break;
        case 'bulk-actions':
            bodyHtml = previewBulkActions(columns, swimlanes); break;
        // Specialized styles (wizard-preview-specialized.js)
        case 'survey-analytics':
            bodyHtml = previewSurveyAnalytics(columns, swimlanes); break;
        case 'committee-voting':
            bodyHtml = previewCommitteeVoting(columns, swimlanes); break;
        case 'cards-dashboard':
            bodyHtml = previewCardsDashboard(columns, swimlanes); break;
        case 'award-nominations':
            bodyHtml = previewAwardNominations(columns, swimlanes); break;
        default:
            bodyHtml = previewSimpleStatus(columns, swimlanes);
    }

    container.innerHTML = previewHeader(title, subtitle, styleDef) + bodyHtml + '</div>';
}

// ============================================================================
// AMD MODULE REGISTRATION
// ============================================================================
if (typeof define === 'function' && define.amd) {
    define('template/wizard-preview', [
        'template/wizard-generators',
        'template/wizard-preview-basic',
        'template/wizard-preview-advanced',
        'template/wizard-preview-specialized'
    ], function() { return { loaded: true }; });
}
