/**
 * Dashboard Builder Wizard - Specialized Style Previews
 * Renders: survey-analytics, committee-voting, cards-dashboard, award-nominations
 */

// ============================================================================
// SURVEY ANALYTICS PREVIEW
// ============================================================================
// Stats row (responses, departments, avg rating), view toggle (Table/Cards),
// rating badges, and comment previews.

function previewSurveyAnalytics(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var ratingField = State.styleConfig.ratingField || 'Rating';
    var commentField = State.styleConfig.commentField || 'Comments';
    var deptField = State.styleConfig.departmentField || 'Department';

    // Stats bar
    var html = '<div style="display:flex;gap:6px;margin-bottom:8px;">' +
        '<div style="flex:1;background:#fff;border:1px solid #e9ecef;border-left:3px solid var(--primary);padding:8px 10px;border-radius:4px;text-align:center;">' +
            '<div style="font-size:1.2rem;font-weight:700;color:var(--primary);">47</div>' +
            '<div style="font-size:0.55rem;color:#888;">Total Responses</div></div>' +
        '<div style="flex:1;background:#fff;border:1px solid #e9ecef;border-left:3px solid #059669;padding:8px 10px;border-radius:4px;text-align:center;">' +
            '<div style="font-size:1.2rem;font-weight:700;color:#059669;">6</div>' +
            '<div style="font-size:0.55rem;color:#888;">Departments</div></div>' +
        '<div style="flex:1;background:#fff;border:1px solid #e9ecef;border-left:3px solid #D97706;padding:8px 10px;border-radius:4px;text-align:center;">' +
            '<div style="font-size:1.2rem;font-weight:700;color:#D97706;">4.2</div>' +
            '<div style="font-size:0.55rem;color:#888;">Avg Rating</div></div>' +
    '</div>';

    // View toggle
    html += '<div style="display:flex;gap:4px;margin-bottom:8px;align-items:center;">' +
        '<span style="font-size:0.6rem;font-weight:600;color:#555;">View:</span>' +
        '<span style="padding:2px 8px;background:var(--primary);color:#fff;border-radius:4px;font-size:0.6rem;cursor:pointer;">Table</span>' +
        '<span style="padding:2px 8px;background:#e9ecef;color:#333;border-radius:4px;font-size:0.6rem;cursor:pointer;">Cards</span>' +
    '</div>';

    // Table view with rating badges
    var data = generateFakePreviewData(displayCols, 5);
    var ratings = [4.5, 3.8, 2.1, 4.9, 3.2];
    var comments = ['Excellent program support', 'Room for improvement in communication', 'Below expectations', 'Outstanding service', 'Average overall'];

    var thHtml = displayCols.map(function(col) {
        return '<th class="preview-sortable-th">' + escapeHtml(col) +
               ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
    }).join('') + '<th>Rating</th><th>Actions</th>';

    var tbHtml = data.map(function(row, i) {
        var r = ratings[i];
        var color = r >= 4 ? '#28a745' : r >= 3 ? '#ffc107' : '#dc3545';
        return '<tr>' +
            displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
            '<td><span style="padding:1px 6px;background:' + color + '20;color:' + color + ';border-radius:8px;font-size:0.6rem;font-weight:600;">' + r.toFixed(1) + '/5</span></td>' +
            '<td><span class="preview-view-btn"><i class="bi bi-eye"></i> View</span></td></tr>';
    }).join('');

    html += '<table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table>';

    // Mini card preview below table
    html += '<div style="margin-top:8px;font-size:0.55rem;color:#888;"><i class="bi bi-info-circle"></i> Cards view shows rating badges and comment excerpts</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px;">';
    ratings.slice(0, 2).forEach(function(r, i) {
        var color = r >= 4 ? '#28a745' : r >= 3 ? '#ffc107' : '#dc3545';
        html += '<div style="border:1px solid #e9ecef;border-left:3px solid ' + color + ';border-radius:4px;padding:6px;font-size:0.55rem;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">' +
                '<span style="background:' + color + '20;color:' + color + ';padding:1px 4px;border-radius:4px;font-weight:600;">' + r.toFixed(1) + '/5</span>' +
                '<small style="color:#888;">' + escapeHtml(data[i][displayCols[displayCols.length - 1]] || 'Dept') + '</small>' +
            '</div>' +
            '<div style="color:#555;">' + comments[i] + '</div>' +
        '</div>';
    });
    html += '</div>';

    return html;
}

// ============================================================================
// COMMITTEE VOTING PREVIEW
// ============================================================================
// Named voter columns with colored headers, vote buttons, member slot highlight.

function previewCommitteeVoting(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var members = (State.styleConfig.committeeMembers || [
        { name: 'Member A', color: '#e8f5e9' },
        { name: 'Member B', color: '#e3f2fd' },
        { name: 'Member C', color: '#fff3e0' }
    ]).slice(0, 5);

    // Logged-in-as bar
    var html = '<div style="background:var(--primary);color:#fff;padding:6px 10px;border-radius:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;font-size:0.65rem;">' +
        '<div><i class="bi bi-person-circle"></i> <strong>Logged in as:</strong> Committee Member</div>' +
        '<div><span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:10px;"><i class="bi bi-inbox"></i> Pending: <strong>12</strong></span></div>' +
    '</div>';

    html += previewToolbar();

    var data = generateFakePreviewData(displayCols, 4);
    var votePatterns = [
        { votes: ['approved', 'approved', 'pending', '', ''], result: '2/3 approved' },
        { votes: ['approved', 'denied', 'approved', '', ''], result: '2/3 approved' },
        { votes: ['pending', 'pending', 'pending', '', ''], result: 'No votes yet' },
        { votes: ['denied', 'approved', 'more-info', '', ''], result: 'Split decision' }
    ];

    // Member headers
    var memberTh = members.map(function(m) {
        return '<th style="background:' + escapeHtml(m.color) + ';font-size:0.55rem;padding:2px 4px;text-align:center;min-width:40px;">' +
               escapeHtml(m.name.split(' ').pop()) + '</th>';
    }).join('');

    var thHtml = '<th style="width:40px;">Doc</th>' +
        displayCols.map(function(col) {
            return '<th class="preview-sortable-th">' + escapeHtml(col) +
                   ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
        }).join('') + memberTh + '<th>Your Vote</th>';

    var tbHtml = data.map(function(row, rIdx) {
        var pattern = votePatterns[rIdx % votePatterns.length];
        var memberCells = members.map(function(m, mIdx) {
            var vote = pattern.votes[mIdx] || '';
            var icon = vote === 'approved' ? '<i class="bi bi-check-circle-fill" style="color:#28a745;"></i>'
                     : vote === 'denied' ? '<i class="bi bi-x-circle-fill" style="color:#dc3545;"></i>'
                     : vote === 'more-info' ? '<i class="bi bi-question-circle-fill" style="color:#ffc107;"></i>'
                     : vote === 'pending' ? '<i class="bi bi-clock" style="color:#aaa;"></i>'
                     : '<span style="color:#ddd;">-</span>';
            return '<td style="background:' + escapeHtml(m.color) + ';text-align:center;">' + icon + '</td>';
        }).join('');

        return '<tr>' +
            '<td><span class="preview-view-btn" style="padding:1px 4px;"><i class="bi bi-eye"></i></span></td>' +
            displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
            memberCells +
            '<td style="white-space:nowrap;">' +
                '<span style="padding:1px 4px;background:#28a74520;color:#28a745;border-radius:3px;font-size:0.5rem;cursor:pointer;"><i class="bi bi-check-circle"></i></span> ' +
                '<span style="padding:1px 4px;background:#dc354520;color:#dc3545;border-radius:3px;font-size:0.5rem;cursor:pointer;"><i class="bi bi-x-circle"></i></span> ' +
                '<span style="padding:1px 4px;background:#ffc10720;color:#D97706;border-radius:3px;font-size:0.5rem;cursor:pointer;"><i class="bi bi-question-circle"></i></span>' +
            '</td></tr>';
    }).join('');

    html += '<div style="overflow-x:auto;"><table class="preview-table"><thead><tr>' + thHtml + '</tr></thead><tbody>' + tbHtml + '</tbody></table></div>';

    return html;
}

// ============================================================================
// EXECUTIVE CARDS DASHBOARD PREVIEW
// ============================================================================
// Metrics row (donut-like status overview + total), responsive card grid.

function previewCardsDashboard(columns, swimlanes) {
    var sc = State.styleConfig;
    var titleField = sc.cardTitleField || 'Name';
    var statusField = sc.cardStatusField || 'Status';
    var leadField = sc.cardLeadField || 'Lead';
    var budgetField = sc.cardBudgetField || '';

    var statusColors = {
        'On Track': '#059669', 'At Risk': '#D97706', 'Delayed': '#DC2626',
        'Complete': '#006747', 'Pending': '#6366f1', 'Approved': '#059669', 'Denied': '#DC2626'
    };
    var statuses = ['On Track', 'On Track', 'At Risk', 'Complete', 'Delayed', 'Pending'];
    var titles = ['Strategic Initiative Alpha', 'Digital Transformation', 'Campus Renovation', 'Student Success Platform', 'Budget Optimization', 'Faculty Development'];
    var leads = ['Dr. Johnson', 'VP Martinez', 'Dir. Thompson', 'Dean Williams', 'CFO Adams', 'Provost Chen'];
    var budgets = ['$250,000', '$180,000', '$425,000', '$95,000', '$320,000', '$75,000'];

    // Status counts
    var counts = {};
    statuses.forEach(function(s) { counts[s] = (counts[s] || 0) + 1; });

    // Metrics row
    var html = '<div style="display:flex;gap:8px;margin-bottom:10px;">';
    // Status overview card
    html += '<div style="flex:2;background:#fff;border:1px solid #e9ecef;border-radius:6px;padding:10px;">' +
        '<div style="font-size:0.65rem;font-weight:600;color:#555;margin-bottom:6px;">Status Overview</div>';
    Object.keys(counts).forEach(function(status) {
        var color = statusColors[status] || '#888';
        html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;font-size:0.6rem;">' +
            '<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';"></div>' +
            '<span>' + escapeHtml(status) + ': <strong>' + counts[status] + '</strong></span></div>';
    });
    html += '</div>';
    // Total card
    html += '<div style="flex:1;background:#fff;border:1px solid #e9ecef;border-radius:6px;padding:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
        '<div style="font-size:0.65rem;font-weight:600;color:#555;">Total Items</div>' +
        '<div style="font-size:2rem;font-weight:700;color:var(--primary);">' + statuses.length + '</div>' +
    '</div></div>';

    // Cards grid
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';
    statuses.forEach(function(status, i) {
        var color = statusColors[status] || '#888';
        html += '<div style="background:#fff;border:1px solid #e9ecef;border-radius:6px;padding:8px;font-size:0.6rem;">' +
            '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">' +
                '<div><div style="font-weight:600;color:#333;font-size:0.65rem;">' + escapeHtml(titles[i]) + '</div>' +
                '<div style="color:#888;font-size:0.55rem;">Lead: ' + escapeHtml(leads[i]) + '</div></div>' +
                '<span style="padding:1px 6px;background:' + color + '15;color:' + color + ';border:1px solid ' + color + '30;border-radius:8px;font-size:0.5rem;font-weight:600;white-space:nowrap;">' + escapeHtml(status) + '</span>' +
            '</div>' +
            (budgetField ? '<div style="color:#888;font-size:0.55rem;">Budget: ' + budgets[i] + '</div>' : '') +
            '<div style="margin-top:4px;"><span class="preview-view-btn" style="font-size:0.5rem;"><i class="bi bi-eye"></i> View</span></div>' +
        '</div>';
    });
    html += '</div>';

    return html;
}

// ============================================================================
// AWARD NOMINATIONS PREVIEW
// ============================================================================
// Expandable nomination details with category badges, voting.
// Similar to expandable but with award/nomination-specific decorations.

function previewAwardNominations(columns, swimlanes) {
    var displayCols = columns.slice(0, 3);
    var categories = ['Outstanding Service', 'Innovation', 'Leadership', 'Community Impact', 'Mentorship'];
    var catColors = ['#059669', '#6366f1', '#D97706', '#DC2626', '#0891B2'];
    var nominees = ['Dr. Sarah Chen', 'Prof. James Rodriguez', 'Maria Thompson', 'David Kim', 'Emily Washington'];
    var nominators = ['Dept. Chair Williams', 'VP Martinez', 'Dean Adams', 'Faculty Senate', 'Student Council'];

    var html = previewToolbar();

    swimlanes.forEach(function(sl, idx) {
        var rowCount = idx === 0 ? 3 : 2;
        var data = generateFakePreviewData(displayCols, rowCount);
        var expanded = (idx === 0);

        var thHtml = '<th style="width:30px;"></th>' +
            displayCols.map(function(col) {
                return '<th class="preview-sortable-th">' + escapeHtml(col) +
                       ' <i class="bi bi-arrow-down-up" style="font-size:0.5rem;opacity:0.3;"></i></th>';
            }).join('') + '<th>Category</th><th>Actions</th>';

        var tbHtml = data.map(function(row, rIdx) {
            var showDetail = expanded && rIdx === 0;
            var cat = categories[rIdx % categories.length];
            var catColor = catColors[rIdx % catColors.length];
            var rowHtml = '<tr' + (showDetail ? ' style="background:#fffaf0;"' : '') + '>' +
                '<td><span style="cursor:pointer;color:var(--primary);font-weight:bold;">' + (showDetail ? '&#8722;' : '+') + '</span></td>' +
                displayCols.map(function(col) { return '<td>' + escapeHtml(row[col] || '-') + '</td>'; }).join('') +
                '<td><span style="padding:1px 6px;background:' + catColor + '15;color:' + catColor + ';border-radius:8px;font-size:0.55rem;font-weight:600;">' + escapeHtml(cat) + '</span></td>' +
                '<td><span class="preview-view-btn"><i class="bi bi-eye"></i> View</span></td></tr>';
            if (showDetail) {
                rowHtml += '<tr class="detail-row"><td colspan="' + (displayCols.length + 3) + '" style="background:#fffdf5;padding:8px 10px 8px 30px;border-left:3px solid ' + catColor + ';">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.6rem;">' +
                        '<div><strong style="color:#666;"><i class="bi bi-trophy" style="color:' + catColor + ';"></i> Nominee:</strong> ' + escapeHtml(nominees[rIdx]) + '</div>' +
                        '<div><strong style="color:#666;"><i class="bi bi-person"></i> Nominated by:</strong> ' + escapeHtml(nominators[rIdx]) + '</div>' +
                        '<div style="grid-column:1/-1;"><strong style="color:#666;">Justification:</strong> <em style="color:#555;">Exceptional contributions to student engagement and innovative program development over the past academic year.</em></div>' +
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
// AMD MODULE REGISTRATION
// ============================================================================
if (typeof define === 'function' && define.amd) {
    define('template/wizard-preview-specialized', ['template/wizard-generators'], function() { return { loaded: true }; });
}
