/**
 * Dashboard Builder Wizard - SQL Generators
 * SQL generation, formatting, highlighting, column definitions, and download.
 * Split from wizard-demo.js to avoid Cloudflare WAF false-positive on upload
 * (the SQL keywords SELECT/FROM/JOIN/WHERE trigger injection detection).
 * All functions run in global scope - loaded via RequireJS after wizard-demo.js.
 */

console.log('Dashboard Builder Wizard v' + (typeof WIZARD_VERSION !== 'undefined' ? WIZARD_VERSION : '?') + ' - SQL generators loaded');

function resetSQL() {
    State.customSQL = null;
    renderStep();
}

function copySQL(e) {
    var sql = State.customSQL || generateSQL();
    var btn = e ? e.target.closest('button') : document.querySelector('.editor-toolbar button[onclick*="copySQL"]');

    function onCopySuccess() {
        if (!btn) return;
        var originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        btn.classList.add('active');
        setTimeout(function() {
            btn.innerHTML = originalHtml;
            btn.classList.remove('active');
        }, 2000);
    }

    function onCopyFail() {
        // Select all text in the SQL editor so user can Ctrl+C
        var editor = document.getElementById('sqlEditor');
        if (editor) {
            editor.focus();
            editor.select();
            showToast('Text selected -- press Ctrl+C to copy.', 'info');
        } else {
            showToast('Copy failed. Please select the SQL text manually and press Ctrl+C.', 'error');
        }
    }

    // Try modern Clipboard API first, then fallback for iframes
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sql).then(onCopySuccess).catch(function() {
            (typeof fallbackCopy === 'function' && fallbackCopy(sql)) ? onCopySuccess() : onCopyFail();
        });
    } else {
        (typeof fallbackCopy === 'function' && fallbackCopy(sql)) ? onCopySuccess() : onCopyFail();
    }
}

function formatSQL() {
    const editor = document.getElementById('sqlEditor');
    if (!editor) return;

    // Basic SQL formatting
    let sql = editor.value;

    // Add newlines before major keywords
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN',
                      'ORDER BY', 'GROUP BY', 'HAVING', 'UNION', 'LIMIT'];

    keywords.forEach(kw => {
        const regex = new RegExp(`\\s+${kw}\\s+`, 'gi');
        sql = sql.replace(regex, `\n${kw} `);
    });

    // Clean up multiple newlines
    sql = sql.replace(/\n{3,}/g, '\n\n');

    editor.value = sql.trim();
    State.customSQL = editor.value;
}

// ============================================================================
// SQL GENERATION
// ============================================================================

function generateSQL() {
    if (State.mode === 'content') {
        return generateContentSQL();
    } else if (State.mode === 'forms') {
        return generateFormsSQL();
    } else if (State.mode === 'combined') {
        return generateCombinedSQL();
    }
    return generateContentSQL();
}

function generateContentSQL() {
    const area = State.selectedArea;
    const docTypes = SimulatedData.documentTypes[(area && area.id)] || [];
    const selectedDocs = docTypes.filter(d => State.selectedDocTypes.includes(d.id));
    const fields = SimulatedData.keyFields[(area && area.id)] || [];
    const selectedFields = fields.filter(f => State.selectedFields.includes(f.id));

    const docTypeList = selectedDocs.map(d => `'${escapeSQL(d.name)}'`).join(',\n      ');

    let fieldSelects = selectedFields.map(f => {
        const a = escapeBracket(f.alias);
        if (f.type === 'party') {
            // Party fields: display name comes from PartyVersion.name
            return `   [${a}_pv].name AS [${a}]`;
        }
        if (f.type === 'date') {
            return `   CONVERT(VARCHAR(10), [${a}].DATE, 101) AS [${a}]`;
        }
        if (f.type === 'number') {
            return `   [${a}].[Number] AS [${a}]`;
        }
        if (f.type === 'decimal') {
            return `   [${a}].[Decimal] AS [${a}]`;
        }
        // text + lookup (simple dropdown) both use .Text
        return `   [${a}].text AS [${a}]`;
    }).join(',\n');

    let fieldJoins = selectedFields.map(f => {
        const a = escapeBracket(f.alias);
        if (f.type === 'party') {
            // Party fields link through DocumentFieldPartyVersion -> PartyVersion
            // PartyVersion.name gives the display name (e.g., "Student Info" -> "John Smith")
            return `LEFT JOIN dbo.DocumentFieldPartyVersion AS [${a}_dfpv]
   ON Document.DocumentID = [${a}_dfpv].DocumentID
   AND [${a}_dfpv].FieldID = ${safeInt(f.id)}  -- ${escapeSQL(f.name)}
LEFT JOIN dbo.PartyVersion AS [${a}_pv]
   ON [${a}_dfpv].PartyVersionID = [${a}_pv].PartyVersionID`;
        }
        const tableMap = {
            date: 'ivDocumentDateFieldValue',
            number: 'ivDocumentNumberFieldValue',
            decimal: 'ivDocumentDecimalFieldValue'
        };
        const table = tableMap[f.type] || 'ivDocumentTextFieldValue';
        return `LEFT JOIN dbo.${table} AS [${a}]
   ON Document.DocumentID = [${a}].DocumentID
   AND [${a}].FieldID = ${safeInt(f.id)}  -- ${escapeSQL(f.name)}`;
    }).join('\n');

    // Generate swimlane configuration comments
    const swimlaneConfig = generateSwimlaneConfig();

    return `-- ${escapeSQL(State.dashboardTitle || 'Content Dashboard')}
-- Source: ${escapeSQL(State.sourceName || 'ContentSource')}
-- Generated by Dashboard Builder v${WIZARD_VERSION}
${swimlaneConfig}
SELECT
   DocumentType.[Name] AS DocumentType,
   Document.DocumentID,
${fieldSelects ? fieldSelects + ',\n' : ''}   '/#areaId=' + CAST(Node.CatalogID AS VARCHAR) +
   '&NodeId=' + CAST(Node.NodeID AS VARCHAR) +
   '&DocumentId=' + CAST(Document.DocumentID AS VARCHAR) AS url
FROM dbo.DocumentType
INNER JOIN dbo.Document
   ON DocumentType.DocumentTypeID = Document.DocumentTypeID
   AND Document.DocumentID NOT IN (SELECT DocumentID FROM dbo.RecycleBin)
   AND DocumentType.[Name] IN (
      ${docTypeList || "'YourDocType'"}
   )
INNER JOIN dbo.Node
   ON Document.DocumentID = Node.DocumentID
   AND Node.CatalogID = ${(area && area.id) || 2}
${fieldJoins}
ORDER BY Document.DocumentID DESC`;
}

function generateSwimlaneConfig() {
    if (!State.swimlanes || State.swimlanes.length === 0) return '';

    let config = '\n-- ========== SWIMLANE CONFIGURATION ==========\n';

    State.swimlanes.forEach((sl, idx) => {
        config += `-- Swimlane ${idx + 1}: "${escapeSQL(sl.name)}"\n`;
        if (sl.filters && sl.filters.length > 0) {
            sl.filters.forEach(f => {
                var vals = (f.values || []).map(v => `'${escapeSQL(v)}'`).join(', ');
                config += `--   Filter: ${escapeSQL(f.fieldName).replace(/[\r\n]/g, '')} IN (${vals})\n`;
            });
        } else {
            config += `--   Filter: (none - shows all remaining items)\n`;
        }
    });

    config += '-- =============================================\n';
    return config;
}

function generateFormsSQL() {
    const template = State.selectedTemplate;
    const inputs = SimulatedData.formInputIds[(template && template.id)] || [];
    const selectedInputs = inputs.filter(i => State.selectedInputIds.includes(i.id));

    let fieldPivots = selectedInputs.map(inp => {
        return `   MAX(CASE WHEN iv.InputID = '${escapeSQL(inp.id)}' THEN iv.Value END) AS [${escapeBracket(inp.label)}]`;
    }).join(',\n');

    const hasWorkflow = State.selectedWorkflowSteps.length > 0 || State.selectedInputIds.includes('__currentStepName__');

    // Generate swimlane configuration comments
    const swimlaneConfig = generateSwimlaneConfig();

    let sql = `-- ${escapeSQL(State.dashboardTitle || 'Forms Dashboard')}
-- Source: ${escapeSQL(State.sourceName || 'FormsSource')}
-- Template: ${escapeSQL((template && template.name) || 'Form')} (ID: ${template ? safeInt(template.id) : '?'})
-- Generated by Dashboard Builder v${WIZARD_VERSION}
${swimlaneConfig}
SELECT
   f.FormID,
   CONVERT(VARCHAR(10), f.Created, 101) AS SubmittedDate`;

    if (fieldPivots) {
        sql += `,\n${fieldPivots}`;
    }

    if (hasWorkflow) {
        sql += `,
   REPLACE(ps.Name, '_', ' ') AS CurrentStepName`;
    }

    // URL: Etrieve Central uses /central/submissions?packageId=...&itemId=...&focusMode=true
    sql += `,
   '/central/submissions?packageId=' + CAST(pd.PackageID AS VARCHAR(50)) +
   '&itemId=' + CAST(f.FormID AS VARCHAR) +
   '&focusMode=true' AS url`;

    // Always join PackageDocument for the URL (packageId)
    sql += `
FROM reporting.central_forms_Form f
LEFT JOIN reporting.central_forms_InputValue iv
   ON f.FormID = iv.FormID
LEFT JOIN reporting.central_flow_PackageDocument pd
   ON pd.SourceID = CAST(f.FormID AS VARCHAR(50))`;

    if (hasWorkflow) {
        sql += `
LEFT JOIN reporting.central_flow_TaskQueue tq
   ON tq.PackageId = pd.PackageID
LEFT JOIN reporting.central_flow_ProcessStep ps
   ON tq.ProcessStepID = ps.ProcessStepId`;
    }

    sql += `
WHERE f.TemplateVersionID = ${template ? safeInt(template.id) : '/* SELECT A TEMPLATE */'}
   AND f.IsDraft = 0
GROUP BY f.FormID, f.Created, pd.PackageID${hasWorkflow ? ', ps.Name' : ''}
ORDER BY f.Created DESC`;

    return sql;
}

function generateCombinedSQL() {
    // Combined mode: two SEPARATE SQL queries (content + forms).
    // Content (dbo.*) and Central Forms (reporting.central_forms_*) use different
    // database connections in Etrieve, so they cannot be UNIONed in a single query.
    // The viewmodel loads both sources independently and merges them at runtime.
    //
    // This function concatenates both queries for the SQL editor preview;
    // the download generates two separate files (content-query.sql, forms-query.sql).
    var contentSQL = generateContentSQL();
    var formsSQL = generateFormsSQL();
    var sourceName = escapeSQL(State.sourceName || 'Dashboard');
    return contentSQL + '\n\n' +
        '-- ====================================================================\n' +
        '-- IMPORTANT: These are TWO SEPARATE integration sources.\n' +
        '-- Content and Central Forms use different database connections in\n' +
        '-- Etrieve, so they cannot be combined in a single SQL query.\n' +
        '--\n' +
        '-- Create two Sources in Etrieve Central:\n' +
        '--   1. Content source: ' + sourceName + '_Content\n' +
        '--      (paste the query ABOVE this banner)\n' +
        '--   2. Forms source:   ' + sourceName + '_Forms\n' +
        '--      (paste the query BELOW this banner)\n' +
        '--\n' +
        '-- The dashboard viewmodel loads both and merges them at runtime.\n' +
        '-- ====================================================================\n\n' +
        formsSQL;
}

function highlightSQL(sql) {
    // Simple SQL syntax highlighting
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT', 'INNER', 'OUTER', 'JOIN', 'ON',
                      'AS', 'IN', 'NOT', 'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'CASE', 'WHEN',
                      'THEN', 'END', 'MAX', 'MIN', 'COUNT', 'SUM', 'CAST', 'VARCHAR', 'INT', 'DESC', 'ASC'];

    let highlighted = sql;

    // Escape HTML
    highlighted = highlighted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Comments
    highlighted = highlighted.replace(/(--[^\n]*)/g, '<span class="comment">$1</span>');

    // Strings
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>');

    // Keywords
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
    });

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

    return highlighted;
}

function downloadDashboard() {
    // Generate all files and create a ZIP download
    const files = generateDashboardFiles();

    // Create ZIP using JSZip (loaded from CDN)
    if (typeof JSZip === 'undefined') {
        // Fallback: download files individually or show code
        showDownloadModal(files);
        return;
    }

    const zip = new JSZip();
    Object.keys(files).forEach(filename => {
        zip.file(filename, files[filename]);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${State.sourceName || 'Dashboard'}_Package.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
    }).catch(err => {
        showToast('Failed to generate ZIP file. Please try again.', 'error');
    });
}

function generateColumnDefinitions() {
    const columns = [];

    if (State.mode === 'content') {
        // DocumentType is always available from the content SQL query
        columns.push(`        { field: 'DocumentType', label: 'Document Type', type: 'text' }`);
        const fields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        fields.filter(f => State.selectedFields.includes(f.id)).forEach(f => {
            columns.push(`        { field: '${escapeJS(f.alias)}', label: '${escapeJS(f.name)}', type: '${escapeJS(f.type)}' }`);
        });
    } else if (State.mode === 'forms') {
        const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        inputs.filter(i => State.selectedInputIds.includes(i.id)).forEach(i => {
            // field key must match the SQL column alias (which uses inp.label)
            columns.push(`        { field: '${escapeJS(i.label)}', label: '${escapeJS(i.label)}', type: 'text' }`);
        });
        // Virtual field: Current Workflow Step (auto-joined from ProcessStep table)
        if (State.selectedInputIds.includes('__currentStepName__')) {
            columns.push(`        { field: 'CurrentStepName', label: 'Current Step', type: 'text' }`);
        }
    } else if (State.mode === 'combined') {
        // Combined mode: merge columns from both data sources (actual field names)
        columns.push(`        { field: 'RecordType', label: 'Type', type: 'text' }`);
        // DocumentType is available from the content SQL query
        columns.push(`        { field: 'DocumentType', label: 'Document Type', type: 'text' }`);

        // Document fields (actual aliases, not normalized Field1/2/3)
        const docFields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        docFields.filter(f => State.selectedFields.includes(f.id)).forEach(f => {
            columns.push(`        { field: '${escapeJS(f.alias)}', label: '${escapeJS(f.name)}', type: '${escapeJS(f.type)}' }`);
        });

        // Form fields
        const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        inputs.filter(i => State.selectedInputIds.includes(i.id) && i.id !== '__currentStepName__').forEach(i => {
            columns.push(`        { field: '${escapeJS(i.label)}', label: '${escapeJS(i.label)}', type: 'text' }`);
        });

        // Virtual field: Current Workflow Step
        if (State.selectedInputIds.includes('__currentStepName__')) {
            columns.push(`        { field: 'CurrentStepName', label: 'Current Step', type: 'text' }`);
        }
    }

    return columns.join(',\n');
}

// Generate separate column sets for combined mode (content vs forms)
function generateSplitColumnDefinitions() {
    var contentCols = [];
    var formsCols = [];

    // Content columns: DocumentType + selected key fields
    contentCols.push(`        { field: 'DocumentType', label: 'Document Type', type: 'text' }`);
    const docFields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
    docFields.filter(f => State.selectedFields.includes(f.id)).forEach(f => {
        contentCols.push(`        { field: '${escapeJS(f.alias)}', label: '${escapeJS(f.name)}', type: '${escapeJS(f.type)}' }`);
    });

    // Forms columns: SubmittedDate + selected input fields + CurrentStepName
    formsCols.push(`        { field: 'SubmittedDate', label: 'Submitted', type: 'date' }`);
    const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
    inputs.filter(i => State.selectedInputIds.includes(i.id) && i.id !== '__currentStepName__').forEach(i => {
        formsCols.push(`        { field: '${escapeJS(i.label)}', label: '${escapeJS(i.label)}', type: 'text' }`);
    });
    if (State.selectedInputIds.includes('__currentStepName__')) {
        formsCols.push(`        { field: 'CurrentStepName', label: 'Current Step', type: 'text' }`);
    }

    return {
        contentColumns: contentCols.join(',\n'),
        formsColumns: formsCols.join(',\n')
    };
}

// AMD module registration for Etrieve RequireJS
if (typeof define === 'function' && define.amd) {
    define('template/wizard-sql', [], function() {
        return { loaded: true };
    });
}
