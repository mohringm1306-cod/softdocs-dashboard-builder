/**
 * Dashboard Builder Wizard - Basic Style Previews
 * Renders: simple-status, request-type, alpha-split
 */

// ============================================================================
// SIMPLE STATUS PREVIEW
// ============================================================================
// Standard swimlane layout with status-based grouping.
// Shows collapsible swimlanes, sortable columns, View buttons, Export per lane.

function previewSimpleStatus(columns, swimlanes) {
    var displayCols = columns.slice(0, 4);
    var html = previewToolbar();

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        // Assign the swimlane status to the status-like column
        data.forEach(function(row) {
            displayCols.forEach(function(col) {
                var cl = col.toLowerCase();
                if (cl.includes('status') || cl.includes('step') || cl.includes('workflow')) {
                    row[col] = sl.name;
                }
            });
        });
        var tableHtml = previewTable(displayCols, data);
        html += previewSwimlane(sl.name, idx, tableHtml, rowCount, previewFilterSummary(sl));
    });

    return html;
}

// ============================================================================
// REQUEST TYPE PREVIEW
// ============================================================================
// Same layout as simple-status but swimlanes represent categories/types
// instead of workflow progression. Color-coded type badges.

function previewRequestType(columns, swimlanes) {
    var displayCols = columns.slice(0, 4);
    var typeColors = ['#6366f1', '#059669', '#D97706', '#DC2626', '#8B5CF6', '#0891B2'];
    var html = previewToolbar();

    // Type summary badges above swimlanes
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">';
    swimlanes.forEach(function(sl, idx) {
        var color = typeColors[idx % typeColors.length];
        var count = idx === 0 ? 5 : 3;
        html += '<span style="padding:2px 8px;background:' + color + '15;color:' + color +
                ';border:1px solid ' + color + '30;border-radius:12px;font-size:0.6rem;font-weight:600;">' +
                escapeHtml(sl.name) + ' (' + count + ')</span>';
    });
    html += '</div>';

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        var tableHtml = previewTable(displayCols, data);
        html += previewSwimlane(sl.name, idx, tableHtml, rowCount, previewFilterSummary(sl));
    });

    return html;
}

// ============================================================================
// ALPHA SPLIT PREVIEW
// ============================================================================
// Swimlanes auto-split by last name ranges (A-H, I-P, Q-Z).
// Shows the configured alpha ranges with name distribution.

function previewAlphaSplit(columns, swimlanes) {
    var displayCols = columns.slice(0, 4);
    var ranges = State.styleConfig.alphaRanges || [['A','H'],['I','P'],['Q','Z']];
    var namesByRange = {
        'A-H': ['Adams, Carol', 'Chen, David', 'Garcia, Maria', 'Hall, Robert'],
        'I-P': ['Jackson, Emily', 'Kim, Susan', 'Lopez, Ana', 'Martinez, Carlos', 'Nguyen, Thi'],
        'Q-Z': ['Rodriguez, Sofia', 'Smith, John', 'Williams, James']
    };

    // Range summary bar
    var html = '<div style="display:flex;gap:4px;margin-bottom:8px;align-items:center;">' +
        '<i class="bi bi-sort-alpha-down" style="font-size:0.7rem;color:var(--primary);"></i>';
    ranges.forEach(function(r) {
        var label = r[0] + '-' + r[1];
        html += '<span style="padding:2px 8px;background:var(--primary);color:#fff;border-radius:12px;font-size:0.6rem;font-weight:600;">' +
                escapeHtml(label) + '</span>';
    });
    html += '</div>';

    html += previewToolbar();

    // Use alpha ranges as swimlanes instead of configured swimlanes
    ranges.forEach(function(r, idx) {
        var label = r[0] + '-' + r[1];
        var names = namesByRange[label] || ['Student ' + (idx+1) + 'A', 'Student ' + (idx+1) + 'B'];
        var data = generateFakePreviewData(displayCols, Math.min(names.length, 3));
        // Override the name column with alphabetically appropriate names
        data.forEach(function(row, i) {
            displayCols.forEach(function(col) {
                var cl = col.toLowerCase();
                if (cl.includes('name') || cl.includes('student') || cl.includes('requester')) {
                    row[col] = names[i] || names[0];
                }
            });
        });
        var tableHtml = previewTable(displayCols, data);
        html += previewSwimlane(label, idx, tableHtml, data.length);
    });

    return html;
}

// ============================================================================
// AMD MODULE REGISTRATION
// ============================================================================
if (typeof define === 'function' && define.amd) {
    define('template/wizard-preview-basic', ['template/wizard-generators'], function() { return { loaded: true }; });
}
