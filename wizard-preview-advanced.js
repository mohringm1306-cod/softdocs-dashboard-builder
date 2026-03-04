/**
 * Dashboard Builder Wizard - Advanced Style Previews
 * Renders: expandable, claims, workflow-actions, pdf-signatures, bulk-actions
 */

// ============================================================================
// EXPANDABLE DETAIL PREVIEW
// ============================================================================
// Rows have a +/- toggle that reveals detail fields below the row.
// Shows the detail fields the user picked in the config.

function previewExpandable(columns, swimlanes) {
    var displayCols = columns.slice(0, 4);
    var detailFields = State.styleConfig.detailFields || [];
    var allFields = (typeof getAllFields === 'function') ? getAllFields() : [];
    var detailNames = detailFields.map(function(id) {
        var f = allFields.find(function(x) { return x.id === id || x.id === String(id); });
        return f ? f.name : 'Detail ' + id;
    }).slice(0, 3);
    if (detailNames.length === 0) detailNames = ['Budget Amount', 'Department', 'Notes'];

    var html = previewToolbar();

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        var expanded = (idx === 0); // Show first swimlane with one row expanded

        var thHtml = '<th style="width:30px;"></th>' +
            displayCols.map(function(col) {
                return '<th class="preview-sortable-th">' + escapeHtml(col) +
                       ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
            }).join('') + '<th>Actions</th>';

        var tbHtml = data.map(function(row, rIdx) {
            var showDetail = expanded && rIdx === 0;
            var rowHtml = '<tr' + (showDetail ? ' style="background:#f0f7f4;"' : '') + '>' +
                '<td><span style="cursor:pointer;color:var(--primary);font-weight:bold;">' +
                (showDetail ? '−' : '+') + '</span></td>' +
                displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
                '<td><span class="preview-view-btn"><i class="bi bi-eye"></i> View</span></td></tr>';
            if (showDetail) {
                rowHtml += '<tr class="detail-row"><td colspan="' + (displayCols.length + 2) + '" style="background:#f8fdf9;padding:6px 10px 6px 30px;border-left:3px solid var(--primary);">' +
                    '<div style="display:grid;grid-template-columns:repeat(' + Math.min(detailNames.length, 3) + ',1fr);gap:6px;font-size:0.6rem;">' +
                    detailNames.map(function(name) {
                        return '<div><strong style="color:#666;">' + escapeHtml(name) + ':</strong> <span style="color:#333;">Sample data</span></div>';
                    }).join('') +
                    '</div></td></tr>';
            }
            return rowHtml;
        }).join('');

        var tableHtml = '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';
        html += previewSwimlane(sl.name, idx, tableHtml, rowCount, previewFilterSummary(sl));
    });

    return html;
}

// ============================================================================
// CLAIMS SYSTEM PREVIEW
// ============================================================================
// Personal stats bar, filter chips, age badges on rows, Claim/Release buttons.

function previewClaims(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var chips = State.styleConfig.filterChips || ['All', 'High Priority', '30+ Days', '60+ Days'];
    var warnDays = State.styleConfig.ageBadgeWarning || 30;
    var critDays = State.styleConfig.ageBadgeCritical || 60;

    // Personal stats bar
    var html = '<div style="background:#f8f9fa;border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;border-radius:4px;font-size:0.65rem;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div><strong style="color:var(--primary);font-size:0.75rem;">Your Stats</strong></div>' +
            '<div style="display:flex;gap:12px;">' +
                '<span><strong>2</strong> Claimed</span>' +
                '<span><strong>47</strong> Total</span>' +
                '<span><strong>12</strong> Unclaimed</span>' +
            '</div>' +
        '</div>' +
    '</div>';

    // Filter chips
    html += '<div style="margin-bottom:8px;display:flex;gap:4px;flex-wrap:wrap;">';
    chips.slice(0, 5).forEach(function(c, i) {
        html += '<span style="padding:2px 8px;background:' + (i === 0 ? 'var(--primary)' : '#e9ecef') +
                ';color:' + (i === 0 ? '#fff' : '#333') +
                ';border-radius:12px;font-size:0.6rem;cursor:pointer;">' + escapeHtml(c) + '</span>';
    });
    html += '</div>';

    html += previewToolbar();

    // Age badge helper
    function ageBadge(days) {
        var color = days >= critDays ? '#dc3545' : days >= warnDays ? '#ffc107' : '#28a745';
        var bg = days >= critDays ? '#dc354520' : days >= warnDays ? '#ffc10720' : '#28a74520';
        return '<span style="padding:1px 6px;background:' + bg + ';color:' + color +
               ';border-radius:8px;font-size:0.55rem;font-weight:600;">' + days + 'd</span>';
    }

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        var ages = [5, 18, 42, 67, 3];

        var thHtml = displayCols.map(function(col) {
            return '<th class="preview-sortable-th">' + escapeHtml(col) +
                   ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
        }).join('') + '<th>Age</th><th>Actions</th>';

        var tbHtml = data.map(function(row, rIdx) {
            var days = ages[rIdx % ages.length];
            var claimed = rIdx === 0;
            return '<tr' + (claimed ? ' style="background:#e8f5e9;"' : '') + '>' +
                displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
                '<td>' + ageBadge(days) + '</td>' +
                '<td>' +
                    (claimed
                        ? '<span style="padding:2px 6px;background:#dc354520;color:#dc3545;border-radius:4px;font-size:0.55rem;cursor:pointer;"><i class="bi bi-box-arrow-right"></i> Release</span>'
                        : '<span style="padding:2px 6px;background:var(--primary);color:#fff;border-radius:4px;font-size:0.55rem;cursor:pointer;"><i class="bi bi-hand-index"></i> Claim</span>') +
                    ' <span class="preview-view-btn"><i class="bi bi-eye"></i></span>' +
                '</td></tr>';
        }).join('');

        var tableHtml = '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';
        html += previewSwimlane(sl.name, idx, tableHtml, rowCount, previewFilterSummary(sl));
    });

    return html;
}

// ============================================================================
// WORKFLOW ACTIONS PREVIEW
// ============================================================================
// Each swimlane has its own action buttons (Approve, Deny, etc.).
// Color-coded step badges.

function previewWorkflowActions(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var stepColors = ['#059669', '#6366f1', '#D97706', '#DC2626', '#0891B2', '#8B5CF6'];

    var html = previewToolbar();

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        var color = stepColors[idx % stepColors.length];
        var actions = (State.styleConfig.workflowActions || {})[sl.name] || ['Approve', 'Deny'];

        var thHtml = displayCols.map(function(col) {
            return '<th class="preview-sortable-th">' + escapeHtml(col) +
                   ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
        }).join('') + '<th>Actions</th>';

        var tbHtml = data.map(function(row) {
            var actionBtns = actions.slice(0, 3).map(function(a) {
                var isApprove = a.toLowerCase().includes('approve');
                var isDeny = a.toLowerCase().includes('deny');
                var btnColor = isApprove ? '#28a745' : isDeny ? '#dc3545' : '#6c757d';
                return '<span style="padding:1px 5px;background:' + btnColor + ';color:#fff;border-radius:3px;font-size:0.5rem;cursor:pointer;margin-right:2px;">' +
                       escapeHtml(a) + '</span>';
            }).join('');
            return '<tr>' +
                displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
                '<td>' + actionBtns + ' <span class="preview-view-btn"><i class="bi bi-eye"></i></span></td></tr>';
        }).join('');

        var tableHtml = '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';

        // Custom swimlane header with step color
        var slId = 'preview-sl-' + idx;
        html += '<div class="preview-swimlane">' +
            '<div class="preview-swimlane-header" onclick="var c=document.getElementById(\'' + slId + '\');var ic=this.querySelector(\'i\');if(c.style.display===\'none\'){c.style.display=\'\';ic.className=\'bi bi-chevron-down\';}else{c.style.display=\'none\';ic.className=\'bi bi-chevron-right\';}" style="cursor:pointer;border-left:3px solid ' + color + ';">' +
                '<i class="bi bi-chevron-down" style="font-size:0.7rem;"></i> ' +
                '<span style="color:' + color + ';font-weight:600;">' + escapeHtml(sl.name) + '</span>' +
                '<span class="count">' + rowCount + '</span>' +
                '<span class="preview-export-btn" style="margin-left:auto;"><i class="bi bi-download"></i> Export</span>' +
            '</div>' +
            (previewFilterSummary(sl) ? '<div class="preview-filter-hint"><i class="bi bi-funnel"></i> ' + previewFilterSummary(sl) + '</div>' : '') +
            '<div id="' + slId + '" class="preview-swimlane-body">' + tableHtml + '</div>' +
        '</div>';
    });

    return html;
}

// ============================================================================
// PDF + SIGNATURES PREVIEW
// ============================================================================
// Expandable rows showing signature fields and PDF link.
// Similar to expandable but with signature status indicators.

function previewPdfSignatures(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var detailFields = State.styleConfig.detailFields || [];
    var allFields = (typeof getAllFields === 'function') ? getAllFields() : [];
    var detailNames = detailFields.map(function(id) {
        var f = allFields.find(function(x) { return x.id === id || x.id === String(id); });
        return f ? f.name : 'Field';
    }).slice(0, 3);
    if (detailNames.length === 0) detailNames = ['Signature 1', 'Signature 2', 'Completion Date'];

    var html = previewToolbar();

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        var expanded = (idx === 0);

        var thHtml = '<th style="width:30px;"></th>' +
            displayCols.map(function(col) {
                return '<th class="preview-sortable-th">' + escapeHtml(col) +
                       ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
            }).join('') + '<th>Actions</th>';

        var sigStatuses = [
            { name: 'Supervisor', status: 'signed', date: '01/12/2026' },
            { name: 'HR Director', status: 'pending', date: '' },
            { name: 'VP Approval', status: 'waiting', date: '' }
        ];

        var tbHtml = data.map(function(row, rIdx) {
            var showDetail = expanded && rIdx === 0;
            var rowHtml = '<tr' + (showDetail ? ' style="background:#f0f7f4;"' : '') + '>' +
                '<td><span style="cursor:pointer;color:var(--primary);font-weight:bold;">' + (showDetail ? '&#8722;' : '+') + '</span></td>' +
                displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
                '<td><span class="preview-view-btn"><i class="bi bi-file-pdf" style="color:#dc3545;"></i> PDF</span> ' +
                '<span class="preview-view-btn"><i class="bi bi-eye"></i></span></td></tr>';
            if (showDetail) {
                var sigHtml = sigStatuses.map(function(s) {
                    var icon = s.status === 'signed' ? '<i class="bi bi-check-circle-fill" style="color:#28a745;"></i>'
                             : s.status === 'pending' ? '<i class="bi bi-clock" style="color:#ffc107;"></i>'
                             : '<i class="bi bi-dash-circle" style="color:#ccc;"></i>';
                    return '<div style="display:flex;align-items:center;gap:4px;">' + icon +
                           ' <span>' + escapeHtml(s.name) + '</span>' +
                           (s.date ? '<small style="color:#888;">(' + s.date + ')</small>' : '') + '</div>';
                }).join('');
                rowHtml += '<tr class="detail-row"><td colspan="' + (displayCols.length + 2) + '" style="background:#f8fdf9;padding:6px 10px 6px 30px;border-left:3px solid var(--primary);">' +
                    '<div style="font-size:0.6rem;"><strong style="color:#666;">Signatures:</strong>' +
                    '<div style="display:flex;gap:12px;margin-top:4px;">' + sigHtml + '</div></div></td></tr>';
            }
            return rowHtml;
        }).join('');

        var tableHtml = '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';
        html += previewSwimlane(sl.name, idx, tableHtml, rowCount, previewFilterSummary(sl));
    });

    return html;
}

// ============================================================================
// BULK ACTIONS PREVIEW
// ============================================================================
// Checkboxes, action bar (Approve/Deny/Reassign), row action menus.

function previewBulkActions(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var targets = State.styleConfig.reassignTargets || ['Supervisor Approval', 'Budget Review', 'Procurement'];

    // Action bar
    var html = '<div style="background:#f8f9fa;padding:6px 10px;border-radius:6px;margin-bottom:8px;display:flex;gap:4px;align-items:center;flex-wrap:wrap;">' +
        '<span style="padding:3px 8px;background:#28a745;color:#fff;border-radius:4px;font-size:0.6rem;font-weight:600;cursor:pointer;"><i class="bi bi-check-circle"></i> Bulk Approve (0)</span>' +
        '<span style="padding:3px 8px;background:#dc3545;color:#fff;border-radius:4px;font-size:0.6rem;font-weight:600;cursor:pointer;"><i class="bi bi-x-circle"></i> Bulk Deny (0)</span>' +
        '<span style="padding:3px 8px;background:#17a2b8;color:#fff;border-radius:4px;font-size:0.6rem;font-weight:600;cursor:pointer;"><i class="bi bi-arrow-repeat"></i> Reassign</span>' +
        '<span style="margin-left:auto;padding:3px 8px;background:#ffc107;color:#333;border-radius:4px;font-size:0.6rem;font-weight:600;cursor:pointer;"><i class="bi bi-download"></i> Export Selected</span>' +
    '</div>';

    html += previewToolbar();

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);

        var tableHtml = previewTable(displayCols, data, {
            showCheckbox: true,
            extraHeaders: '',
            extraCellsFn: function(row) {
                return '<td><span style="padding:1px 5px;background:#6c757d;color:#fff;border-radius:3px;font-size:0.5rem;cursor:pointer;"><i class="bi bi-three-dots-vertical"></i></span></td>';
            }
        });
        // The table already has Actions from showView, and we need to replace with the menu.
        // Actually, let's build it custom.
        var thHtml = '<th style="width:28px;"><input type="checkbox" disabled></th>' +
            displayCols.map(function(col) {
                return '<th class="preview-sortable-th">' + escapeHtml(col) +
                       ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
            }).join('') + '<th>Actions</th>';

        var tbHtml = data.map(function(row, rIdx) {
            var checked = rIdx < 1; // First row pre-checked for visual effect
            return '<tr' + (checked ? ' style="background:#e3f2fd;"' : '') + '>' +
                '<td><input type="checkbox" disabled' + (checked ? ' checked' : '') + '></td>' +
                displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
                '<td style="white-space:nowrap;">' +
                    '<span style="padding:1px 4px;background:#28a745;color:#fff;border-radius:2px;font-size:0.5rem;cursor:pointer;margin-right:1px;">Approve</span>' +
                    '<span style="padding:1px 4px;background:#dc3545;color:#fff;border-radius:2px;font-size:0.5rem;cursor:pointer;margin-right:1px;">Deny</span>' +
                    '<span style="padding:1px 4px;background:#6c757d;color:#fff;border-radius:2px;font-size:0.5rem;cursor:pointer;"><i class="bi bi-three-dots-vertical"></i></span>' +
                '</td></tr>';
        }).join('');

        var customTable = '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';
        html += previewSwimlane(sl.name, idx, customTable, rowCount, previewFilterSummary(sl));
    });

    return html;
}

// ============================================================================
// AMD MODULE REGISTRATION
// ============================================================================
if (typeof define === 'function' && define.amd) {
    define('template/wizard-preview-advanced', ['template/wizard-generators'], function() { return { loaded: true }; });
}
