/**
 * Dashboard Builder Wizard 3.0 - Template Renderers
 * Step rendering, live preview, download modal, and UI template functions.
 * Split from wizard-demo.js to avoid Cloudflare WAF false-positive on upload.
 * All functions run in global scope - loaded via RequireJS after wizard-demo.js.
 */

console.log('Dashboard Builder Wizard 3.0 - Template renderers loaded');

// Initialize draft check on DOM ready
document.addEventListener('DOMContentLoaded', checkForDraft);

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

// Base step arrays -- getSteps() inserts style + conditional steps dynamically
var ContentStepsBase = [
    { id: 'setup', title: 'Setup', icon: 'bi-gear' },
    // style step inserted here by getSteps()
    { id: 'area', title: 'Area', icon: 'bi-folder' },
    { id: 'docTypes', title: 'Documents', icon: 'bi-file-earmark' },
    { id: 'fields', title: 'Fields', icon: 'bi-list-ul' },
    // style-specific steps inserted here by getSteps()
    { id: 'swimlanes', title: 'Groups', icon: 'bi-layout-three-columns' },
    { id: 'generate', title: 'Finish', icon: 'bi-download' }
];

var FormsStepsBase = [
    { id: 'setup', title: 'Setup', icon: 'bi-gear' },
    // style step inserted here
    { id: 'template', title: 'Template', icon: 'bi-ui-checks' },
    { id: 'fields', title: 'Fields', icon: 'bi-input-cursor-text' },
    { id: 'workflow', title: 'Workflow', icon: 'bi-diagram-3' },
    // style-specific steps inserted here
    { id: 'swimlanes', title: 'Groups', icon: 'bi-layout-three-columns' },
    { id: 'generate', title: 'Finish', icon: 'bi-download' }
];

var CombinedStepsBase = [
    { id: 'setup', title: 'Setup', icon: 'bi-gear' },
    // style step inserted here
    { id: 'area', title: 'Documents', icon: 'bi-folder' },
    { id: 'docTypes', title: 'Doc Types', icon: 'bi-file-earmark' },
    { id: 'docFields', title: 'Doc Fields', icon: 'bi-list-ul' },
    { id: 'template', title: 'Forms', icon: 'bi-ui-checks' },
    { id: 'formFields', title: 'Form Fields', icon: 'bi-input-cursor-text' },
    { id: 'workflow', title: 'Workflow', icon: 'bi-diagram-3' },
    // style-specific steps inserted here
    { id: 'swimlanes', title: 'Groups', icon: 'bi-layout-three-columns' },
    { id: 'generate', title: 'Finish', icon: 'bi-download' }
];

// Map of style IDs to extra steps they inject before swimlanes
var StyleExtraSteps = {
    'expandable':        [{ id: 'detailFields', title: 'Detail Fields', icon: 'bi-arrows-expand' }],
    'alpha-split':       [{ id: 'alphaConfig', title: 'Alpha Config', icon: 'bi-sort-alpha-down' }],
    'claims':            [{ id: 'claimsConfig', title: 'Claims Setup', icon: 'bi-clipboard-check' }],
    'workflow-actions':  [{ id: 'actionsConfig', title: 'Actions', icon: 'bi-lightning' }],
    'pdf-signatures':    [{ id: 'detailFields', title: 'Detail Fields', icon: 'bi-arrows-expand' }],
    'survey-analytics':  [{ id: 'surveyConfig', title: 'Survey Setup', icon: 'bi-graph-up' }],
    'award-nominations': [{ id: 'detailFields', title: 'Detail Fields', icon: 'bi-arrows-expand' }],
    'committee-voting':  [{ id: 'committeeConfig', title: 'Committee', icon: 'bi-people-fill' }],
    'cards-dashboard':   [{ id: 'cardsConfig', title: 'Card Layout', icon: 'bi-grid-1x2' }],
    'bulk-actions':      [{ id: 'bulkConfig', title: 'Bulk Actions', icon: 'bi-ui-checks-grid' }]
};

// ============================================================================
// MODE SELECTION
// ============================================================================


function renderProgress() {
    const steps = getSteps();
    const percent = ((State.currentStep + 1) / steps.length) * 100;

    document.getElementById('progressTitle').textContent =
        State.mode === 'content' ? 'Building Document Dashboard' :
        State.mode === 'forms' ? 'Building Forms Dashboard' :
        'Building Combined Dashboard';
    document.getElementById('stepCounter').textContent =
        `Step ${State.currentStep + 1} of ${steps.length}`;
    document.getElementById('progressFill').style.width = percent + '%';

    // Render step dots
    let dotsHtml = steps.map((s, i) => `
        <div class="progress-step ${i === State.currentStep ? 'active' : ''} ${i < State.currentStep ? 'completed' : ''}">
            <div class="step-dot">
                ${i < State.currentStep ? '<i class="bi bi-check"></i>' : (i + 1)}
            </div>
            <span class="step-label">${escapeHtml(s.title)}</span>
        </div>
    `).join('');
    document.getElementById('progressSteps').innerHTML = dotsHtml;
}

// ============================================================================
// STEP RENDERING
// ============================================================================

function renderStep() {
    const steps = getSteps();
    const step = steps[State.currentStep];

    // Update header - simplified for non-technical users
    // Combined mode has different headers for document vs form sections
    const isCombined = State.mode === 'combined';
    const headers = {
        'setup': { title: 'Name Your Dashboard', desc: 'Give your dashboard a name so you can find it later' },
        'style': { title: 'Choose a Style', desc: 'Pick the dashboard layout and features that best fit your workflow' },
        'area': { title: isCombined ? 'Documents: Choose Folder' : 'Choose a Folder', desc: isCombined ? 'First, select where your documents are stored' : 'Where are the documents you want to see?' },
        'docTypes': { title: isCombined ? 'Documents: Pick Types' : 'Pick Document Types', desc: 'What kinds of documents should appear?' },
        'docFields': { title: 'Documents: Choose Fields', desc: 'Pick the document information you want to see' },
        'template': { title: isCombined ? 'Forms: Choose Template' : 'Choose a Form', desc: isCombined ? 'Now, select which form to track' : 'Which form submissions do you want to track?' },
        'formFields': { title: 'Forms: Choose Fields', desc: 'Pick the form fields you want to see' },
        'fields': { title: 'Choose What to Show', desc: 'Pick the information you want to see in your dashboard' },
        'workflow': { title: isCombined ? 'Forms: Track Approvals' : 'Track Approvals', desc: 'See where items are in the approval process' },
        'detailFields': { title: 'Expandable Detail Fields', desc: 'Pick extra fields to show when a row is expanded' },
        'alphaConfig': { title: 'Alphabetical Split', desc: 'Configure how items are split by last name' },
        'claimsConfig': { title: 'Claims Setup', desc: 'Configure filter chips and age badge thresholds' },
        'actionsConfig': { title: 'Workflow Actions', desc: 'Configure action buttons for each workflow step' },
        'surveyConfig': { title: 'Survey Setup', desc: 'Map the rating, comment, and department fields' },
        'committeeConfig': { title: 'Committee Members', desc: 'Define the voting committee members and their column colors' },
        'cardsConfig': { title: 'Card Layout', desc: 'Map fields to the card title, status, lead, and budget' },
        'bulkConfig': { title: 'Bulk Actions', desc: 'Configure reassignment targets and bulk operations' },
        'swimlanes': { title: 'Organize Your View', desc: 'Group items into sections like "In Progress" and "Completed"' },
        'securityConfig': { title: 'Access Control', desc: 'Optionally restrict data loading to authorized groups (security-first model)' },
        'generate': { title: 'All Done!', desc: 'Your dashboard is ready to download' }
    };

    const header = headers[step.id] || { title: step.title, desc: '' };
    document.getElementById('cardHeader').innerHTML = `
        <h2><i class="${escapeHtml(step.icon)}"></i> ${escapeHtml(header.title)}</h2>
        <p>${escapeHtml(header.desc)}</p>
    `;

    // Render step content
    let html = '';
    switch (step.id) {
        case 'setup': html = renderSetupStep(); break;
        case 'style': html = renderStyleStep(); break;
        case 'area': html = renderAreaStep(); break;
        case 'docTypes': html = renderDocTypesStep(); break;
        case 'docFields': html = renderContentFieldsStep(); break;
        case 'template': html = renderTemplateStep(); break;
        case 'formFields': html = renderFormFieldsStep(); break;
        case 'fields': html = renderFieldsStep(); break;
        case 'workflow': html = renderWorkflowStep(); break;
        case 'detailFields': html = renderDetailFieldsStep(); break;
        case 'alphaConfig': html = renderAlphaConfigStep(); break;
        case 'claimsConfig': html = renderClaimsConfigStep(); break;
        case 'actionsConfig': html = renderActionsConfigStep(); break;
        case 'surveyConfig': html = renderSurveyConfigStep(); break;
        case 'committeeConfig': html = renderCommitteeConfigStep(); break;
        case 'cardsConfig': html = renderCardsConfigStep(); break;
        case 'bulkConfig': html = renderBulkConfigStep(); break;
        case 'swimlanes': html = renderSwimlanesStep(); break;
        case 'securityConfig': html = renderSecurityConfigStep(); break;
        case 'generate': html = renderGenerateStep(); break;
    }

    document.getElementById('wizardMain').innerHTML = html;

    // Update preview
    renderPreview();

    // Update footer buttons
    const isFirst = State.currentStep === 0;
    const isLast = State.currentStep === steps.length - 1;

    document.getElementById('cardFooter').innerHTML = `
        <button class="btn btn-secondary" onclick="prevStep()" ${isFirst ? 'disabled' : ''}>
            <i class="bi bi-arrow-left"></i> Back
        </button>
        ${isLast ? `
            <button class="btn btn-success" onclick="downloadDashboard()">
                <i class="bi bi-files"></i> Get Dashboard Files
            </button>
        ` : `
            <button class="btn btn-primary" onclick="nextStep()">
                Next <i class="bi bi-arrow-right"></i>
            </button>
        `}
    `;
}

// ============================================================================
// STEP RENDERERS
// ============================================================================

function renderSetupStep() {
    // Auto-generate technical name from dashboard title
    const autoTechnicalName = generateTechnicalName(State.dashboardTitle);

    return `
        <div class="step-description">
            <p><i class="bi bi-lightbulb" style="color:var(--accent);margin-right:8px;"></i>
            This name will appear at the top of your dashboard. Pick something descriptive!</p>
        </div>

        <div class="form-group">
            <label><i class="bi bi-card-heading" style="margin-right:8px;color:var(--primary);"></i>Dashboard Name</label>
            <input type="text" class="form-control" id="dashboardTitle"
                   placeholder="Example: Financial Aid Documents"
                   value="${escapeHtml(State.dashboardTitle)}"
                   oninput="updateDashboardTitle(this.value)">
        </div>

        <div id="techNameDisplay" style="background:#f0f7f4;border-radius:10px;padding:15px 20px;border:1px solid #c3e6cb;display:${State.dashboardTitle && !State.advancedMode ? 'block' : 'none'};">
            <div style="display:flex;align-items:center;gap:10px;">
                <i class="bi bi-check-circle-fill" style="color:var(--success);"></i>
                <span style="color:#155724;">Technical name auto-generated: <code style="background:#d4edda;padding:3px 8px;border-radius:4px;">${escapeHtml(State.sourceName || autoTechnicalName)}</code></span>
            </div>
        </div>

        ${State.advancedMode ? `
            <div class="advanced-section active">
                <h5><i class="bi bi-gear"></i> Technical Settings</h5>
                <div class="form-group" style="margin-bottom:0;">
                    <label style="font-size:0.9rem;">Integration Source Name</label>
                    <input type="text" class="advanced-input" id="sourceName"
                           placeholder="e.g., FinAid_Dashboard"
                           value="${escapeHtml(State.sourceName)}"
                           oninput="State.sourceName = this.value.replace(/[^a-zA-Z0-9_]/g, '_')">
                    <small style="color:#666;">Technical name for Etrieve Central. Letters, numbers, and underscores only. This must match the source name you create in Admin &gt; Sources.</small>
                </div>
            </div>
        ` : ''}

        <div class="advanced-toggle" title="Shows the SQL query editor and technical source name so you can customize the dashboard setup yourself.">
            <label>
                <input type="checkbox" ${State.advancedMode ? 'checked' : ''} onchange="toggleAdvancedMode(this.checked)">
                <span>Advanced Mode</span>
            </label>
            <span class="badge-advanced">Power User</span>
            <small style="display:block;color:#888;font-size:0.8rem;margin-top:4px;">Shows the SQL editor and technical setup details. Leave unchecked if you plan to send files to an admin.</small>
        </div>
    `;
}

function toggleAdvancedMode(enabled) {
    State.advancedMode = enabled;
    renderStep();
    saveDraft();
}

function generateTechnicalName(title) {
    if (!title) return '';
    // Remove special chars, replace spaces with underscores, limit length
    return title
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30)
        + '_Dashboard';
}

function updateDashboardTitle(value) {
    State.dashboardTitle = value;
    State.sourceName = generateTechnicalName(value);

    // Update just the technical name display without re-rendering (to keep focus)
    const techNameDisplay = document.getElementById('techNameDisplay');
    if (techNameDisplay) {
        if (value && !State.advancedMode) {
            techNameDisplay.style.display = 'block';
            techNameDisplay.querySelector('code').textContent = State.sourceName;
        } else {
            techNameDisplay.style.display = 'none';
        }
    }

    // Update preview
    renderPreview();
    saveDraft();
}

// ============================================================================
// STYLE SELECTION STEP
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
            html += `
                <div class="style-select-card ${selected ? 'selected' : ''}" onclick="selectStyle('${escapeJS(s.id)}')">
                    <div class="style-select-icon"><i class="bi ${escapeHtml(s.icon)}"></i></div>
                    <div class="style-select-info">
                        <div class="style-select-name">${escapeHtml(s.name)}</div>
                        <div class="style-select-desc">${escapeHtml(s.description)}</div>
                        <div class="style-select-best"><strong>Best for:</strong> ${escapeHtml(s.bestFor)}</div>
                    </div>
                    ${selected ? '<div class="style-select-check"><i class="bi bi-check-circle-fill"></i></div>' : ''}
                </div>
            `;
        });
        html += '</div>';
    });

    return html;
}

function selectStyle(styleId) {
    State.selectedStyle = styleId;
    renderProgress();
    renderStep();
    renderPreview();
    saveDraft();
}

// ============================================================================
// STYLE-SPECIFIC STEP RENDERERS
// ============================================================================

function getAvailableFields() {
    // Returns fields available for style-specific configuration
    if (State.mode === 'content' || State.mode === 'combined') {
        return (SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [])
            .filter(f => State.selectedFields.includes(f.id));
    } else if (State.mode === 'forms') {
        const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        return inputs.filter(i => State.selectedInputIds.includes(i.id))
            .map(i => ({ id: i.id, name: i.label, alias: i.id, type: 'text' }));
    }
    return [];
}

function getAllFields() {
    // Returns ALL fields for current selection (not just selected ones)
    if (State.mode === 'content' || State.mode === 'combined') {
        return SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
    } else if (State.mode === 'forms') {
        return (SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [])
            .map(i => ({ id: i.id, name: i.label, alias: i.id, type: 'text' }));
    }
    return [];
}

// --- Detail Fields (Styles 3, 7, 9) ---
function renderDetailFieldsStep() {
    const fields = getAllFields();
    const mainFields = getAvailableFields();
    // Detail fields = all fields minus the ones already selected as main columns
    const detailCandidates = fields.filter(f => !mainFields.find(m => m.id === f.id));
    // Also include main fields so user can pick those too
    const allCandidates = detailCandidates.concat(mainFields);

    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            When users click the <strong>+</strong> button on a row, these fields will be shown in the expanded detail area.</p>
        </div>
        <div class="field-selection-grid">
            ${allCandidates.map(f => `
                <div class="field-item ${State.styleConfig.detailFields.includes(f.id) ? 'selected' : ''}"
                     onclick="toggleDetailField('${escapeJS(f.id)}')">
                    <input type="checkbox" ${State.styleConfig.detailFields.includes(f.id) ? 'checked' : ''}>
                    <span>${escapeHtml(f.name)}</span>
                </div>
            `).join('')}
        </div>
        ${allCandidates.length === 0 ? '<div class="empty-state"><i class="bi bi-info-circle"></i> Select fields in the previous step first.</div>' : ''}
    `;
}

function toggleDetailField(fieldId) {
    fieldId = isNaN(fieldId) ? fieldId : Number(fieldId);
    const idx = State.styleConfig.detailFields.indexOf(fieldId);
    if (idx >= 0) State.styleConfig.detailFields.splice(idx, 1);
    else State.styleConfig.detailFields.push(fieldId);
    renderStep();
    saveDraft();
}

// --- Alpha Config (Style 4) ---
function renderAlphaConfigStep() {
    const fields = getAvailableFields();
    const ranges = State.styleConfig.alphaRanges;

    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Choose which field contains the last name, then configure the alphabetical ranges for workload distribution.</p>
        </div>

        <div class="form-group">
            <label><i class="bi bi-person" style="margin-right:8px;color:var(--primary);"></i>Last Name Field</label>
            <div class="field-selection-grid">
                ${fields.map(f => `
                    <div class="field-item ${State.styleConfig.nameField === f.id ? 'selected' : ''}"
                         onclick="selectAlphaNameField('${escapeJS(f.id)}')">
                        <input type="radio" name="nameField" ${State.styleConfig.nameField === f.id ? 'checked' : ''}>
                        <span>${escapeHtml(f.name)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="form-group" style="margin-top:20px;">
            <label><i class="bi bi-sort-alpha-down" style="margin-right:8px;color:var(--primary);"></i>Letter Ranges</label>
            <div class="alpha-ranges-config">
                ${ranges.map((r, i) => `
                    <div class="alpha-range-row">
                        <input type="text" class="alpha-range-input" value="${escapeHtml(r[0])}" maxlength="1"
                               oninput="updateAlphaRange(${i}, 0, this.value.toUpperCase())">
                        <span>--</span>
                        <input type="text" class="alpha-range-input" value="${escapeHtml(r[1])}" maxlength="1"
                               oninput="updateAlphaRange(${i}, 1, this.value.toUpperCase())">
                        ${ranges.length > 1 ? `<button class="btn-remove-range" onclick="removeAlphaRange(${i})"><i class="bi bi-x"></i></button>` : ''}
                    </div>
                `).join('')}
                <button class="btn btn-sm btn-outline-primary" onclick="addAlphaRange()" style="margin-top:8px;">
                    <i class="bi bi-plus"></i> Add Range
                </button>
            </div>
        </div>
    `;
}

function selectAlphaNameField(fieldId) {
    State.styleConfig.nameField = Number(fieldId);
    renderStep();
    saveDraft();
}

function updateAlphaRange(idx, pos, val) {
    State.styleConfig.alphaRanges[idx][pos] = val;
    saveDraft();
}

function addAlphaRange() {
    const last = State.styleConfig.alphaRanges[State.styleConfig.alphaRanges.length - 1];
    const nextChar = String.fromCharCode(last[1].charCodeAt(0) + 1);
    State.styleConfig.alphaRanges.push([nextChar, 'Z']);
    renderStep();
    saveDraft();
}

function removeAlphaRange(idx) {
    State.styleConfig.alphaRanges.splice(idx, 1);
    renderStep();
    saveDraft();
}

// --- Claims Config (Style 5) ---
function renderClaimsConfigStep() {
    const chips = State.styleConfig.filterChips;
    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Configure the quick-filter chips and age badge thresholds for your claims dashboard.</p>
        </div>

        <div class="form-group">
            <label><i class="bi bi-funnel" style="margin-right:8px;color:var(--primary);"></i>Quick Filter Chips</label>
            <div class="chips-config">
                ${chips.map((c, i) => `
                    <div class="chip-config-row">
                        <input type="text" class="form-control" value="${escapeHtml(c)}"
                               oninput="updateFilterChip(${i}, this.value)" style="flex:1;">
                        ${i > 0 ? `<button class="btn-remove-range" onclick="removeFilterChip(${i})"><i class="bi bi-x"></i></button>` : ''}
                    </div>
                `).join('')}
                <button class="btn btn-sm btn-outline-primary" onclick="addFilterChip()" style="margin-top:8px;">
                    <i class="bi bi-plus"></i> Add Filter
                </button>
            </div>
        </div>

        <div class="form-group" style="margin-top:20px;">
            <label><i class="bi bi-clock" style="margin-right:8px;color:var(--primary);"></i>Age Badge Thresholds (days)</label>
            <div style="display:flex;gap:20px;align-items:center;">
                <div>
                    <small style="color:#666;">Warning (yellow)</small>
                    <input type="number" class="form-control" value="${escapeHtml(String(State.styleConfig.ageBadgeWarning))}"
                           oninput="State.styleConfig.ageBadgeWarning = parseInt(this.value) || 30; saveDraft();" style="width:80px;">
                </div>
                <div>
                    <small style="color:#666;">Critical (red)</small>
                    <input type="number" class="form-control" value="${escapeHtml(String(State.styleConfig.ageBadgeCritical))}"
                           oninput="State.styleConfig.ageBadgeCritical = parseInt(this.value) || 60; saveDraft();" style="width:80px;">
                </div>
            </div>
        </div>
    `;
}

function updateFilterChip(idx, value) { State.styleConfig.filterChips[idx] = value; saveDraft(); }
function addFilterChip() { State.styleConfig.filterChips.push('New Filter'); renderStep(); saveDraft(); }
function removeFilterChip(idx) { State.styleConfig.filterChips.splice(idx, 1); renderStep(); saveDraft(); }

// --- Workflow Actions Config (Style 6) ---
function renderActionsConfigStep() {
    const swimlanes = State.swimlanes.length > 0 ? State.swimlanes : [{ name: 'Pending' }, { name: 'In Progress' }, { name: 'Complete' }];
    const actions = State.styleConfig.workflowActions;
    const actionPresets = [
        { label: 'Check AD', icon: 'bi-person-check', btnStyle: 'info' },
        { label: 'Approve', icon: 'bi-check-circle', btnStyle: 'success' },
        { label: 'Deny', icon: 'bi-x-circle', btnStyle: 'danger' },
        { label: 'Execute', icon: 'bi-play-fill', btnStyle: 'primary' },
        { label: 'Generate PDF', icon: 'bi-file-pdf', btnStyle: 'success' },
        { label: 'Send Email', icon: 'bi-envelope', btnStyle: 'info' },
        { label: 'Escalate', icon: 'bi-arrow-up-circle', btnStyle: 'warning' },
        { label: 'Mark Complete', icon: 'bi-check2-all', btnStyle: 'success' }
    ];

    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Choose which action buttons appear in each swimlane. Users will see these buttons next to each row.</p>
        </div>

        ${swimlanes.map(sl => {
            const slActions = actions[sl.name] || [];
            return `
            <div class="action-config-section">
                <h6 style="margin-bottom:10px;color:var(--primary);"><i class="bi bi-layout-three-columns me-1"></i>${escapeHtml(sl.name)}</h6>
                <div class="action-presets-grid">
                    ${actionPresets.map(ap => {
                        const isActive = slActions.some(a => a.label === ap.label);
                        return `
                            <div class="action-preset ${isActive ? 'active' : ''}"
                                 onclick="toggleWorkflowAction('${escapeJS(sl.name)}', '${escapeJS(ap.label)}', '${escapeJS(ap.icon)}', '${escapeJS(ap.btnStyle)}')">
                                <i class="bi ${escapeHtml(ap.icon)}"></i> ${escapeHtml(ap.label)}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;
        }).join('')}
    `;
}

function toggleWorkflowAction(swimlaneName, label, icon, btnStyle) {
    if (!State.styleConfig.workflowActions[swimlaneName]) {
        State.styleConfig.workflowActions[swimlaneName] = [];
    }
    const arr = State.styleConfig.workflowActions[swimlaneName];
    const idx = arr.findIndex(a => a.label === label);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push({ label, icon, btnStyle });
    renderStep();
    saveDraft();
}

// --- Survey Config (Style 8) ---
function renderSurveyConfigStep() {
    const fields = getAllFields();

    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Map your survey fields so the dashboard can generate analytics, word clouds, and theme analysis.</p>
        </div>

        <div class="form-group">
            <label><i class="bi bi-star" style="margin-right:8px;color:var(--primary);"></i>Rating Field (numeric 1-5)</label>
            <div class="field-selection-grid">
                ${fields.map(f => `
                    <div class="field-item ${State.styleConfig.ratingField === f.id ? 'selected' : ''}"
                         onclick="State.styleConfig.ratingField = Number('${escapeJS(f.id)}'); renderStep(); saveDraft();">
                        <input type="radio" name="ratingField" ${State.styleConfig.ratingField === f.id ? 'checked' : ''}>
                        <span>${escapeHtml(f.name)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="form-group" style="margin-top:15px;">
            <label><i class="bi bi-chat-text" style="margin-right:8px;color:var(--primary);"></i>Comment / Response Field (text)</label>
            <div class="field-selection-grid">
                ${fields.map(f => `
                    <div class="field-item ${State.styleConfig.commentField === f.id ? 'selected' : ''}"
                         onclick="State.styleConfig.commentField = Number('${escapeJS(f.id)}'); renderStep(); saveDraft();">
                        <input type="radio" name="commentField" ${State.styleConfig.commentField === f.id ? 'checked' : ''}>
                        <span>${escapeHtml(f.name)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="form-group" style="margin-top:15px;">
            <label><i class="bi bi-building" style="margin-right:8px;color:var(--primary);"></i>Department / Group Field</label>
            <div class="field-selection-grid">
                ${fields.map(f => `
                    <div class="field-item ${State.styleConfig.departmentField === f.id ? 'selected' : ''}"
                         onclick="State.styleConfig.departmentField = Number('${escapeJS(f.id)}'); renderStep(); saveDraft();">
                        <input type="radio" name="deptField" ${State.styleConfig.departmentField === f.id ? 'checked' : ''}>
                        <span>${escapeHtml(f.name)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// --- Committee Config (Style 10) ---
function renderCommitteeConfigStep() {
    const members = State.styleConfig.committeeMembers;
    const colorOptions = ['#e8f5e9', '#e3f2fd', '#fff3e0', '#fce4ec', '#f3e5f5', '#e0f7fa', '#fff9c4', '#f1f8e9'];

    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Define your committee members. Each member gets their own vote column in the dashboard.</p>
        </div>

        <div class="committee-members-list">
            ${members.map((m, i) => `
                <div class="committee-member-row">
                    <span class="member-number">${i + 1}</span>
                    <input type="text" class="form-control" value="${escapeHtml(m.name)}" placeholder="Member name"
                           oninput="updateCommitteeMember(${i}, 'name', this.value)" style="flex:1;">
                    <div class="color-picker-row">
                        ${colorOptions.map(c => `
                            <div class="color-swatch ${m.color === c ? 'selected' : ''}"
                                 style="background:${escapeHtml(c)};"
                                 onclick="updateCommitteeMember(${i}, 'color', '${escapeJS(c)}')"></div>
                        `).join('')}
                    </div>
                    ${members.length > 2 ? `<button class="btn-remove-range" onclick="removeCommitteeMember(${i})"><i class="bi bi-x"></i></button>` : ''}
                </div>
            `).join('')}
        </div>
        <button class="btn btn-sm btn-outline-primary" onclick="addCommitteeMember()" style="margin-top:12px;">
            <i class="bi bi-plus"></i> Add Member
        </button>
    `;
}

function updateCommitteeMember(idx, prop, value) {
    State.styleConfig.committeeMembers[idx][prop] = value;
    // Only re-render for color changes (clicks). Name changes via oninput
    // should NOT re-render because it rebuilds the DOM and loses focus/cursor.
    if (prop !== 'name') {
        renderStep();
    }
    saveDraft();
}

function addCommitteeMember() {
    const colors = ['#e8f5e9', '#e3f2fd', '#fff3e0', '#fce4ec', '#f3e5f5', '#e0f7fa', '#fff9c4', '#f1f8e9'];
    const nextColor = colors[State.styleConfig.committeeMembers.length % colors.length];
    State.styleConfig.committeeMembers.push({ name: `Member ${String.fromCharCode(65 + State.styleConfig.committeeMembers.length)}`, color: nextColor });
    renderStep();
    saveDraft();
}

function removeCommitteeMember(idx) {
    State.styleConfig.committeeMembers.splice(idx, 1);
    renderStep();
    saveDraft();
}

// --- Cards Config (Style 11) ---
function renderCardsConfigStep() {
    const fields = getAllFields();

    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Map your data fields to the card layout. Each item will be displayed as a card with these fields.</p>
        </div>

        ${['cardTitleField', 'cardStatusField', 'cardLeadField', 'cardBudgetField'].map(configKey => {
            const labels = {
                cardTitleField: { label: 'Card Title', icon: 'bi-card-heading', desc: 'The main name/title on each card' },
                cardStatusField: { label: 'Status Field', icon: 'bi-circle-fill', desc: 'Shown as a colored badge (On Track, At Risk, etc.)' },
                cardLeadField: { label: 'Lead / Owner', icon: 'bi-person', desc: 'Person responsible for this item' },
                cardBudgetField: { label: 'Budget / Value', icon: 'bi-currency-dollar', desc: 'Numeric value shown on the card (optional)' }
            };
            const info = labels[configKey];
            return `
                <div class="form-group" style="margin-top:15px;">
                    <label><i class="bi ${escapeHtml(info.icon)}" style="margin-right:8px;color:var(--primary);"></i>${escapeHtml(info.label)}
                        <small style="color:#888;margin-left:8px;">${escapeHtml(info.desc)}</small></label>
                    <div class="field-selection-grid">
                        <div class="field-item ${!State.styleConfig[configKey] ? 'selected' : ''}"
                             onclick="State.styleConfig['${escapeJS(configKey)}'] = null; renderStep(); saveDraft();">
                            <input type="radio" name="${escapeHtml(configKey)}" ${!State.styleConfig[configKey] ? 'checked' : ''}>
                            <span style="color:#999;">None</span>
                        </div>
                        ${fields.map(f => `
                            <div class="field-item ${State.styleConfig[configKey] === f.id ? 'selected' : ''}"
                                 onclick="State.styleConfig['${escapeJS(configKey)}'] = Number('${escapeJS(f.id)}'); renderStep(); saveDraft();">
                                <input type="radio" name="${escapeHtml(configKey)}" ${State.styleConfig[configKey] === f.id ? 'checked' : ''}>
                                <span>${escapeHtml(f.name)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

// --- Bulk Actions Config (Style 12) ---
function renderBulkConfigStep() {
    const targets = State.styleConfig.reassignTargets;
    return `
        <div class="step-description">
            <p><i class="bi bi-info-circle" style="color:var(--primary);margin-right:8px;"></i>
            Configure the reassignment targets for the bulk reassign dropdown menu.</p>
        </div>

        <div class="form-group">
            <label><i class="bi bi-arrow-repeat" style="margin-right:8px;color:var(--primary);"></i>Reassign Targets</label>
            <div class="chips-config">
                ${targets.map((t, i) => `
                    <div class="chip-config-row">
                        <input type="text" class="form-control" value="${escapeHtml(t)}"
                               oninput="updateReassignTarget(${i}, this.value)" style="flex:1;">
                        ${targets.length > 1 ? `<button class="btn-remove-range" onclick="removeReassignTarget(${i})"><i class="bi bi-x"></i></button>` : ''}
                    </div>
                `).join('')}
                <button class="btn btn-sm btn-outline-primary" onclick="addReassignTarget()" style="margin-top:8px;">
                    <i class="bi bi-plus"></i> Add Target
                </button>
            </div>
        </div>

        <div class="step-description" style="margin-top:20px;">
            <p><i class="bi bi-check-circle" style="color:var(--success);margin-right:8px;"></i>
            The dashboard will also include <strong>Bulk Approve</strong>, <strong>Bulk Deny</strong>, row-level action menus, and <strong>Export Selected</strong> automatically.</p>
        </div>
    `;
}

function updateReassignTarget(idx, value) { State.styleConfig.reassignTargets[idx] = value; saveDraft(); }
function addReassignTarget() { State.styleConfig.reassignTargets.push('New Target'); renderStep(); saveDraft(); }
function removeReassignTarget(idx) { State.styleConfig.reassignTargets.splice(idx, 1); renderStep(); saveDraft(); }

function renderAreaStep() {
    const areasHtml = SimulatedData.areas.map(area => `
        <div class="field-item ${(State.selectedArea && State.selectedArea.id) === area.id ? 'selected' : ''}"
             onclick="selectArea(${area.id})">
            <input type="radio" name="area" ${(State.selectedArea && State.selectedArea.id) === area.id ? 'checked' : ''}>
            <span class="field-name">${escapeHtml(area.name)}</span>
        </div>
    `).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-folder" style="color:var(--accent);margin-right:8px;"></i>
            Documents in Etrieve are organized into folders. Select the folder that contains what you need.</p>
        </div>

        <div class="field-grid" style="grid-template-columns: repeat(2, 1fr);">
            ${areasHtml || '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#666;"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>No document folders found. Contact your Etrieve administrator to set up areas.</div>'}
        </div>

        ${State.selectedArea ? `
            <div style="margin-top:20px;padding:15px 20px;background:rgba(var(--primary-rgb),0.08);border-radius:10px;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-check-circle-fill" style="color:var(--success);font-size:1.2rem;"></i>
                <span>You selected: <strong>${escapeHtml(State.selectedArea.name)}</strong></span>
            </div>
        ` : ''}
    `;
}

function selectArea(areaId, keepSelections) {
    State.selectedArea = SimulatedData.areas.find(a => a.id === areaId);
    if (!keepSelections) {
        State.selectedDocTypes = []; // Reset doc types when area changes
        State.selectedFields = [];
    }
    renderStep();
    saveDraft();
}

function renderDocTypesStep() {
    if (!State.selectedArea) {
        return '<p style="color:#dc3545;"><i class="bi bi-exclamation-circle"></i> Please go back and select a folder first.</p>';
    }

    const docTypes = SimulatedData.documentTypes[State.selectedArea.id] || [];
    const selectedCount = State.selectedDocTypes.length;

    const docTypesHtml = docTypes.map(dt => `
        <div class="field-item ${State.selectedDocTypes.includes(dt.id) ? 'selected' : ''}"
             onclick="toggleDocType(${dt.id})">
            <input type="checkbox" ${State.selectedDocTypes.includes(dt.id) ? 'checked' : ''}>
            <span class="field-name">${escapeHtml(dt.name)}</span>
        </div>
    `).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-files" style="color:var(--accent);margin-right:8px;"></i>
            Check all the document types you want to appear in your dashboard.</p>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <span class="selection-counter">
                <i class="bi bi-check2-square"></i> ${selectedCount} selected
            </span>
            <button class="btn btn-secondary" onclick="selectAllDocTypes()" style="padding:10px 18px;">
                ${selectedCount === docTypes.length ? '<i class="bi bi-x-square"></i> Clear All' : '<i class="bi bi-check2-all"></i> Select All'}
            </button>
        </div>

        <div class="field-grid">
            ${docTypesHtml || '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#666;"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>No document types found in this folder. Try selecting a different folder.</div>'}
        </div>
    `;
}

function toggleDocType(id) {
    const idx = State.selectedDocTypes.indexOf(id);
    if (idx === -1) {
        State.selectedDocTypes.push(id);
    } else {
        State.selectedDocTypes.splice(idx, 1);
    }
    renderStep();
    saveDraft();
}

function selectAllDocTypes() {
    const docTypes = SimulatedData.documentTypes[State.selectedArea.id] || [];
    if (State.selectedDocTypes.length === docTypes.length) {
        State.selectedDocTypes = [];
    } else {
        State.selectedDocTypes = docTypes.map(dt => dt.id);
    }
    renderStep();
    saveDraft();
}

function renderTemplateStep() {
    const templatesHtml = SimulatedData.formTemplates.map(t => `
        <div class="field-item ${(State.selectedTemplate && State.selectedTemplate.id) === t.id ? 'selected' : ''}"
             onclick="selectTemplate(${t.id})">
            <input type="radio" name="template" ${(State.selectedTemplate && State.selectedTemplate.id) === t.id ? 'checked' : ''}>
            <span class="field-name">${escapeHtml(t.name)}</span>
        </div>
    `).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-ui-checks" style="color:var(--accent);margin-right:8px;"></i>
            Choose the form you want to track. You'll see all submissions in your dashboard.</p>
        </div>

        <div class="field-grid" style="grid-template-columns: 1fr;">
            ${templatesHtml || '<div style="text-align:center;padding:40px 20px;color:#666;"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>No form templates available. Make sure forms are published in Etrieve Central.</div>'}
        </div>

        ${State.selectedTemplate ? `
            <div style="margin-top:20px;padding:15px 20px;background:rgba(var(--primary-rgb),0.08);border-radius:10px;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-check-circle-fill" style="color:var(--success);font-size:1.2rem;"></i>
                <span>You selected: <strong>${escapeHtml(State.selectedTemplate.name)}</strong></span>
            </div>
        ` : ''}
    `;
}

function selectTemplate(id, keepSelections) {
    State.selectedTemplate = SimulatedData.formTemplates.find(t => t.id === id);
    if (!keepSelections) {
        State.selectedInputIds = [];
    }
    renderStep();
    saveDraft();
}

function renderFieldsStep() {
    if (State.mode === 'content') {
        return renderContentFieldsStep();
    } else {
        return renderFormFieldsStep();
    }
}

function renderContentFieldsStep() {
    if (!State.selectedArea) {
        return '<p style="color:#dc3545;"><i class="bi bi-exclamation-circle"></i> Please go back and select a folder first.</p>';
    }

    const fields = SimulatedData.keyFields[State.selectedArea.id] || [];
    const selectedCount = State.selectedFields.length;

    const fieldsHtml = fields.map(f => `
        <div class="field-item ${State.selectedFields.includes(f.id) ? 'selected' : ''}"
             onclick="toggleField(${f.id})">
            <input type="checkbox" ${State.selectedFields.includes(f.id) ? 'checked' : ''}>
            <span class="field-name">${escapeHtml(f.name)}</span>
        </div>
    `).join('');

    // Show selected fields as tags
    const selectedTags = State.selectedFields.map(id => {
        const field = fields.find(f => f.id === id);
        return field ? `
            <span class="selected-tag">
                ${escapeHtml(field.name)}
                <span class="remove" onclick="event.stopPropagation(); toggleField(${id})">
                    <i class="bi bi-x"></i>
                </span>
            </span>
        ` : '';
    }).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-columns-gap" style="color:var(--accent);margin-right:8px;"></i>
            These become columns in your dashboard. Select the information you want to see.</p>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <span class="selection-counter">
                <i class="bi bi-check2-square"></i> ${selectedCount} columns selected
            </span>
        </div>

        <div class="field-grid">
            ${fieldsHtml || '<div style="grid-column:1/-1;text-align:center;padding:30px;color:#666;background:#f8f9fa;border-radius:8px;"><i class="bi bi-exclamation-circle" style="font-size:1.5rem;display:block;margin-bottom:10px;color:#ffc107;"></i>No fields found for this folder. Try going back and selecting a different folder.</div>'}
        </div>

        ${selectedCount > 0 ? `
            <h4 style="margin-top:25px;margin-bottom:10px;color:#555;">Your Columns:</h4>
            <div class="selected-fields">
                ${selectedTags}
            </div>
        ` : ''}
    `;
}

function renderFormFieldsStep() {
    if (!State.selectedTemplate) {
        return '<p style="color:#dc3545;"><i class="bi bi-exclamation-circle"></i> Please go back and select a form first.</p>';
    }

    const inputs = SimulatedData.formInputIds[State.selectedTemplate.id] || [];
    const selectedCount = State.selectedInputIds.length;

    // If we have saved selections but no field data yet, show loading state
    // (data is being fetched asynchronously from Etrieve)
    if (inputs.length === 0 && selectedCount > 0) {
        return '<div style="text-align:center;padding:40px;"><i class="bi bi-hourglass-split" style="font-size:2rem;color:var(--accent);"></i><p style="margin-top:15px;color:#aaa;">Loading form fields...</p></div>';
    }

    const inputsHtml = inputs.map(inp => `
        <div class="field-item ${State.selectedInputIds.includes(inp.id) ? 'selected' : ''}"
             onclick="toggleInputId('${escapeJS(inp.id)}')">
            <input type="checkbox" ${State.selectedInputIds.includes(inp.id) ? 'checked' : ''}>
            <span class="field-name">${escapeHtml(inp.label)}</span>
        </div>
    `).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-input-cursor-text" style="color:var(--accent);margin-right:8px;"></i>
            These are the fields from the form. Pick which ones you want to see in your dashboard.</p>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <span class="selection-counter">
                <i class="bi bi-check2-square"></i> ${selectedCount} fields selected
            </span>
            <button class="btn btn-secondary" onclick="selectAllFormFields()" style="padding:10px 18px;">
                ${selectedCount === inputs.length ? '<i class="bi bi-x-square"></i> Clear All' : '<i class="bi bi-check2-all"></i> Select All'}
            </button>
        </div>

        <div class="field-grid">
            ${inputsHtml || '<div style="grid-column:1/-1;text-align:center;padding:30px;color:#666;background:#f8f9fa;border-radius:8px;"><i class="bi bi-exclamation-circle" style="font-size:1.5rem;display:block;margin-bottom:10px;color:#ffc107;"></i>No form fields found for this template. This form may not have any submitted data yet, or the template has no input fields.</div>'}
        </div>
    `;
}

function toggleField(id) {
    const idx = State.selectedFields.indexOf(id);
    if (idx === -1) {
        State.selectedFields.push(id);
    } else {
        State.selectedFields.splice(idx, 1);
    }
    renderStep();
    saveDraft();
}

function toggleInputId(id) {
    const idx = State.selectedInputIds.indexOf(id);
    if (idx === -1) {
        State.selectedInputIds.push(id);
    } else {
        State.selectedInputIds.splice(idx, 1);
    }
    renderStep();
    saveDraft();
}

function selectAllFormFields() {
    const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
    if (State.selectedInputIds.length === inputs.length) {
        State.selectedInputIds = [];
    } else {
        State.selectedInputIds = inputs.map(i => i.id);
    }
    renderStep();
    saveDraft();
}

// Resolve workflow steps from SimulatedData -- works in both standalone (string keys) and Etrieve (numeric keys) mode
function getWorkflowSteps() {
    let workflowKey = 'service';
    if ((State.selectedTemplate && State.selectedTemplate.id) === 692) workflowKey = 'incident';
    if ((State.selectedTemplate && State.selectedTemplate.id) === 665) workflowKey = 'budget';
    let steps = SimulatedData.workflowSteps[workflowKey] || [];
    if (steps.length === 0 && (State.selectedTemplate && State.selectedTemplate.templateId)) {
        steps = SimulatedData.workflowSteps[State.selectedTemplate.templateId] || [];
    }
    if (steps.length === 0 && (State.selectedTemplate && State.selectedTemplate.id)) {
        steps = SimulatedData.workflowSteps[State.selectedTemplate.id] || [];
    }
    return steps;
}

function renderWorkflowStep() {
    const steps = getWorkflowSteps();
    const selectedCount = State.selectedWorkflowSteps.length;

    const stepsHtml = steps.map((s, idx) => `
        <div class="field-item ${State.selectedWorkflowSteps.includes(s.id) ? 'selected' : ''}"
             onclick="toggleWorkflowStep('${escapeJS(s.id)}')" style="position:relative;">
            <input type="checkbox" ${State.selectedWorkflowSteps.includes(s.id) ? 'checked' : ''}>
            <span style="background:var(--primary);color:white;padding:2px 8px;border-radius:12px;font-size:0.75rem;margin-right:10px;">${idx + 1}</span>
            <span class="field-name">${escapeHtml(s.displayName)}</span>
        </div>
    `).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-arrow-right-circle" style="color:var(--accent);margin-right:8px;"></i>
            Track where each submission is in the approval process. Select the steps you want to see.</p>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <span class="selection-counter">
                <i class="bi bi-check2-square"></i> ${selectedCount} steps tracked
            </span>
        </div>

        <div class="field-grid" style="grid-template-columns: 1fr;">
            ${stepsHtml}
        </div>

        <div class="info-box" style="margin-top:25px;">
            <h4><i class="bi bi-lightbulb"></i> How it works</h4>
            <p>Your dashboard will show which approval step each submission is currently at.
            This helps you see bottlenecks and track progress at a glance.</p>
        </div>
    `;
}

function toggleWorkflowStep(id) {
    const idx = State.selectedWorkflowSteps.indexOf(id);
    if (idx === -1) {
        State.selectedWorkflowSteps.push(id);
    } else {
        State.selectedWorkflowSteps.splice(idx, 1);
    }
    renderStep();
    saveDraft();
}

function renderSwimlanesStep() {
    // Get filterable fields based on mode
    const filterableFields = getFilterableFields();

    // Initialize swimlanes with filter structure if empty
    if (State.swimlanes.length === 0) {
        State.swimlanes = [
            { id: 1, name: 'In Progress', filters: [] },
            { id: 2, name: 'Completed', filters: [] }
        ];
    }

    // Ensure all swimlanes have filters array
    State.swimlanes.forEach(sl => {
        if (!sl.filters) sl.filters = [];
    });

    // Count how many swimlanes are missing filters
    const unfilteredCount = State.swimlanes.filter(sl => sl.filters.length === 0).length;
    const allUnfiltered = unfilteredCount === State.swimlanes.length;

    const swimlanesHtml = State.swimlanes.map((sl, idx) => {
        // Build filter tags display
        const filterTags = sl.filters.map((f, fIdx) => `
            <span class="filter-tag">
                <strong>${escapeHtml(f.fieldName)}:</strong> ${f.values.map(v => escapeHtml(v)).join(', ')}
                <span class="remove-filter" onclick="event.stopPropagation(); removeFilter(${idx}, ${fIdx})" title="Remove this filter">
                    <i class="bi bi-x"></i>
                </span>
            </span>
        `).join('');

        const hasFilters = sl.filters.length > 0;

        return `
            <div class="swimlane-config ${hasFilters ? '' : 'swimlane-needs-filter'}" data-index="${idx}">
                <div class="swimlane-header" draggable="true"
                     ondragstart="dragStart(event)" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="drop(event)" ondragend="dragEnd(event)">
                    <span class="drag-handle" title="Drag to reorder"><i class="bi bi-grip-vertical"></i></span>
                    <input type="text" class="swimlane-name" value="${escapeHtml(sl.name)}"
                           onchange="updateSwimlaneName(${idx}, this.value)" onclick="event.stopPropagation()"
                           title="Click to rename this group" placeholder="Enter group name...">
                    ${hasFilters ? `
                        <span class="swimlane-status-badge swimlane-status-ok" title="Filters configured">
                            <i class="bi bi-check-circle-fill"></i>
                        </span>
                    ` : `
                        <span class="swimlane-status-badge swimlane-status-warn" title="No filters set - will show ALL data">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                        </span>
                    `}
                    <span class="delete-btn" onclick="deleteSwimlane(${idx})" title="Delete this group">
                        <i class="bi bi-trash"></i>
                    </span>
                </div>
                <div class="swimlane-filters">
                    <div class="filter-label">
                        <i class="bi bi-funnel"></i> Show items where:
                        <span class="filter-help-icon" title="Filters control which rows appear in this group. Without a filter, every row from your data source will show up here.">
                            <i class="bi bi-question-circle"></i>
                        </span>
                    </div>
                    ${hasFilters ? `
                        <div class="filter-tags">
                            ${filterTags}
                        </div>
                    ` : `
                        <div class="no-filters-warning">
                            <i class="bi bi-exclamation-triangle"></i>
                            <div>
                                <strong>No filters set</strong>
                                <span>Every row will appear in this group. Click "Add Filter" below to choose which items belong here.</span>
                            </div>
                        </div>
                    `}
                    <button class="add-filter-btn ${hasFilters ? '' : 'add-filter-btn-emphasized'}" onclick="openFilterModal(${idx})"
                            title="Choose a field and values to control which rows appear in this group">
                        <i class="bi bi-plus-circle"></i> ${hasFilters ? 'Add Another Filter' : 'Add Filter (Recommended)'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Build the top-of-page guidance/warning area
    let topGuidance = '';
    if (filterableFields.length === 0) {
        topGuidance = `
            <div class="filter-guidance filter-guidance-error">
                <div class="filter-guidance-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
                <div class="filter-guidance-text">
                    <strong>No filterable fields available</strong>
                    <p>Go back to a previous step and make sure you selected fields that have predefined values (like Status, Workflow Step, Term, etc.). Without filterable fields, you can't control which rows appear in each group.</p>
                </div>
            </div>`;
    } else if (allUnfiltered && State.swimlanes.length > 1) {
        topGuidance = `
            <div class="filter-guidance filter-guidance-warn">
                <div class="filter-guidance-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
                <div class="filter-guidance-text">
                    <strong>All groups are showing the same data</strong>
                    <p>None of your groups have filters, so every group will display the exact same rows. Use the "Add Filter" button on each group to pick which items belong in each section.</p>
                </div>
            </div>`;
    } else if (unfilteredCount > 0) {
        topGuidance = `
            <div class="filter-guidance filter-guidance-info">
                <div class="filter-guidance-icon"><i class="bi bi-info-circle-fill"></i></div>
                <div class="filter-guidance-text">
                    <strong>${unfilteredCount} group${unfilteredCount > 1 ? 's have' : ' has'} no filters</strong>
                    <p>Groups without filters will show every row. If that's intentional (e.g., an "All Items" section), that's fine. Otherwise, add a filter so each group shows different data.</p>
                </div>
            </div>`;
    }

    return `
        <div class="step-description">
            <p><i class="bi bi-layout-three-columns" style="color:var(--accent);margin-right:8px;"></i>
            Groups are the sections of your dashboard. <strong>Each group needs a filter</strong> so it shows the right data.
            For example, an "In Progress" group should filter to only show in-progress items.</p>
        </div>

        ${topGuidance}

        <div class="filter-quick-guide">
            <div class="filter-quick-guide-header" onclick="toggleFilterGuide()">
                <i class="bi bi-lightbulb"></i>
                <span>How do filters work?</span>
                <i class="bi bi-chevron-down filter-guide-chevron" id="filterGuideChevron"></i>
            </div>
            <div class="filter-quick-guide-body" id="filterGuideBody" style="display:none;">
                <div class="filter-guide-steps">
                    <div class="filter-guide-step">
                        <div class="filter-guide-step-num">1</div>
                        <div>
                            <strong>Create groups</strong> for each section you want (e.g., "In Progress", "Completed", "Denied").
                        </div>
                    </div>
                    <div class="filter-guide-step">
                        <div class="filter-guide-step-num">2</div>
                        <div>
                            <strong>Add a filter</strong> to each group. Pick a field (like "Workflow Step") and then check which values belong in that group.
                        </div>
                    </div>
                    <div class="filter-guide-step">
                        <div class="filter-guide-step-num">3</div>
                        <div>
                            <strong>Each row goes to the first matching group.</strong> If a row's data matches a group's filter, it shows up there. If it matches no filters, it won't appear.
                        </div>
                    </div>
                </div>
                <div class="filter-guide-example">
                    <div class="filter-guide-example-title"><i class="bi bi-arrow-right-circle"></i> Example</div>
                    <div class="filter-guide-example-body">
                        <strong>"In Progress"</strong> group &rarr; filter: Workflow Step = "NICC Employees" or "Manager Review"<br>
                        <strong>"Completed"</strong> group &rarr; filter: Workflow Step = "Approved" or "Completed"<br>
                        <em>Result: each form goes to the right section based on where it is in the workflow.</em>
                    </div>
                </div>
            </div>
        </div>

        <div class="swimlane-list" id="swimlaneList">
            ${swimlanesHtml}
        </div>

        <button class="btn btn-secondary" onclick="addSwimlane()" style="margin-top:15px;" title="Add a new group section to your dashboard">
            <i class="bi bi-plus-lg"></i> Add Another Group
        </button>

        <!-- Filter Modal -->
        <div id="filterModal" class="filter-modal" style="display:none;">
            <div class="filter-modal-content">
                <div class="filter-modal-header">
                    <h4><i class="bi bi-funnel"></i> Add Filter</h4>
                    <button class="close-modal" onclick="closeFilterModal()" title="Close">&times;</button>
                </div>
                <div class="filter-modal-body">
                    <div class="filter-modal-hint">
                        <i class="bi bi-info-circle"></i>
                        Pick a field below, then check off which values should appear in this group.
                        Only rows that match will show up in this section of your dashboard.
                    </div>
                    <div class="form-group">
                        <label>Filter by Field:
                            <span class="field-label-hint">This is the column from your data source</span>
                        </label>
                        <select id="filterFieldSelect" onchange="updateFilterValues()">
                            <option value="">-- Choose a field to filter on --</option>
                            ${filterableFields.map(f => `
                                <option value="${escapeHtml(f.id)}" data-values="${escapeHtml(JSON.stringify(f.values))}">${escapeHtml(f.name)} (${f.values.length} option${f.values.length !== 1 ? 's' : ''})</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="filterValuesGroup" style="display:none;">
                        <label>Include items where the field matches ANY of these:
                            <span class="field-label-hint">Check one or more values that belong in this group</span>
                        </label>
                        <div id="filterValuesContainer" class="filter-values-grid"></div>
                        <div class="filter-values-hint" id="filterValuesHint" style="display:none;">
                            <i class="bi bi-arrow-up"></i> Check at least one value, then click "Apply Filter"
                        </div>
                    </div>
                </div>
                <div class="filter-modal-footer">
                    <button class="btn btn-secondary" onclick="closeFilterModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="applyFilter()" id="applyFilterBtn" disabled
                            title="Select at least one value above to enable this button">
                        <i class="bi bi-check"></i> Apply Filter
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleFilterGuide() {
    var body = document.getElementById('filterGuideBody');
    var chevron = document.getElementById('filterGuideChevron');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        chevron.classList.remove('bi-chevron-down');
        chevron.classList.add('bi-chevron-up');
    } else {
        body.style.display = 'none';
        chevron.classList.remove('bi-chevron-up');
        chevron.classList.add('bi-chevron-down');
    }
}

// Get fields that have predefined values for filtering
function getFilterableFields() {
    if (State.mode === 'content') {
        const fields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        return fields.filter(f => f.values && f.values.length > 0 && State.selectedFields.includes(f.id));
    } else if (State.mode === 'forms') {
        // For forms, use workflow steps as filterable
        const steps = getWorkflowSteps();
        if (State.selectedWorkflowSteps.length > 0) {
            return [{
                id: 'workflow_step',
                name: 'Current Workflow Step',
                values: steps.filter(s => State.selectedWorkflowSteps.includes(s.id)).map(s => s.displayName)
            }];
        }
        return [];
    } else if (State.mode === 'combined') {
        // Combined mode: merge document fields and workflow steps
        const filterableFields = [];

        // Add document fields with predefined values
        const docFields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        const docFilterable = docFields.filter(f => f.values && f.values.length > 0 && State.selectedFields.includes(f.id));
        filterableFields.push.apply(filterableFields, docFilterable);

        // Add workflow steps if selected
        const steps = getWorkflowSteps();
        if (State.selectedWorkflowSteps.length > 0) {
            filterableFields.push({
                id: 'workflow_step',
                name: 'Current Workflow Step',
                values: steps.filter(s => State.selectedWorkflowSteps.includes(s.id)).map(s => s.displayName)
            });
        }

        return filterableFields;
    }
    return [];
}

let currentFilterSwimlaneIdx = null;
let selectedFilterValues = [];

function openFilterModal(swimlaneIdx) {
    currentFilterSwimlaneIdx = swimlaneIdx;
    selectedFilterValues = [];
    document.getElementById('filterModal').style.display = 'flex';
    document.getElementById('filterFieldSelect').value = '';
    document.getElementById('filterValuesGroup').style.display = 'none';
    document.getElementById('applyFilterBtn').disabled = true;
    // Update modal title to show which swimlane we're filtering
    var modalTitle = document.querySelector('.filter-modal-header h4');
    var swimlaneName = State.swimlanes[swimlaneIdx] ? State.swimlanes[swimlaneIdx].name : 'Group';
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="bi bi-funnel"></i> Add Filter to "' + escapeHtml(swimlaneName) + '"';
    }
    // Hide the values hint
    var hint = document.getElementById('filterValuesHint');
    if (hint) hint.style.display = 'none';
}

function closeFilterModal() {
    var el = document.getElementById('filterModal');
    if (el) el.style.display = 'none';
    currentFilterSwimlaneIdx = null;
    selectedFilterValues = [];
}

// Global Escape key handler -- closes any open modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var filterModal = document.getElementById('filterModal');
        if (filterModal && filterModal.style.display !== 'none') {
            closeFilterModal();
            return;
        }
        var downloadModal = document.getElementById('downloadModal');
        if (downloadModal) {
            closeDownloadModal();
            return;
        }
    }
});

function updateFilterValues() {
    const select = document.getElementById('filterFieldSelect');
    const option = select.options[select.selectedIndex];
    const valuesContainer = document.getElementById('filterValuesContainer');
    const valuesGroup = document.getElementById('filterValuesGroup');
    const valuesHint = document.getElementById('filterValuesHint');

    if (!option.value) {
        valuesGroup.style.display = 'none';
        if (valuesHint) valuesHint.style.display = 'none';
        return;
    }

    const values = JSON.parse(option.dataset.values || '[]');
    selectedFilterValues = [];

    valuesContainer.innerHTML = values.map(v => `
        <label class="filter-value-item" title="Check this box to include rows where ${escapeHtml(option.text.split(' (')[0])} = &quot;${escapeHtml(v)}&quot;">
            <input type="checkbox" value="${escapeHtml(v)}" onchange="toggleFilterValue('${escapeJS(v)}')">
            <span>${escapeHtml(v)}</span>
        </label>
    `).join('');

    valuesGroup.style.display = 'block';
    if (valuesHint) valuesHint.style.display = 'block';
    document.getElementById('applyFilterBtn').disabled = true;
}

function toggleFilterValue(value) {
    const idx = selectedFilterValues.indexOf(value);
    if (idx === -1) {
        selectedFilterValues.push(value);
    } else {
        selectedFilterValues.splice(idx, 1);
    }
    var btn = document.getElementById('applyFilterBtn');
    btn.disabled = selectedFilterValues.length === 0;
    // Hide the hint once they've selected at least one value
    var hint = document.getElementById('filterValuesHint');
    if (hint) hint.style.display = selectedFilterValues.length > 0 ? 'none' : 'block';
}

function applyFilter() {
    if (currentFilterSwimlaneIdx === null || selectedFilterValues.length === 0) return;

    const select = document.getElementById('filterFieldSelect');
    const option = select.options[select.selectedIndex];
    const fieldId = option.value;
    // Strip the " (N options)" suffix we added for display
    const fieldName = option.text.replace(/\s*\(\d+ options?\)$/, '');

    // Add filter to swimlane
    State.swimlanes[currentFilterSwimlaneIdx].filters.push({
        fieldId: fieldId,
        fieldName: fieldName,
        values: selectedFilterValues.slice(0)
    });

    closeFilterModal();
    renderStep();
    saveDraft();
}

function removeFilter(swimlaneIdx, filterIdx) {
    State.swimlanes[swimlaneIdx].filters.splice(filterIdx, 1);
    renderStep();
    saveDraft();
}

function addSwimlane() {
    State.swimlanes.push({ id: Date.now(), name: 'New Group', filters: [] });
    renderStep();
    saveDraft();
}

function updateSwimlaneName(idx, value) {
    State.swimlanes[idx].name = value;
    saveDraft();
}

function deleteSwimlane(idx) {
    if (State.swimlanes.length <= 1) {
        showToast('You need at least one group.', 'warning');
        return;
    }
    State.swimlanes.splice(idx, 1);
    renderStep();
    saveDraft();
}

// Drag and Drop for Swimlanes
let draggedIndex = null;

function dragStart(e) {
    // Find the parent swimlane-config element which has the data-index
    const swimlaneConfig = e.target.closest('.swimlane-config');
    if (!swimlaneConfig) return;

    draggedIndex = parseInt(swimlaneConfig.dataset.index);
    swimlaneConfig.style.opacity = '0.5';
    swimlaneConfig.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.target.closest('.swimlane-config');
    if (item && !item.classList.contains('dragging')) {
        item.style.borderTop = '3px solid var(--primary)';
    }
}

function dragLeave(e) {
    const item = e.target.closest('.swimlane-config');
    if (item) {
        item.style.borderTop = '';
    }
}

function drop(e) {
    e.preventDefault();
    const targetItem = e.target.closest('.swimlane-config');
    if (!targetItem) return;

    const targetIndex = parseInt(targetItem.dataset.index);
    targetItem.style.borderTop = '';

    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        // Reorder the array -- adjust target index after removal
        const draggedItem = State.swimlanes[draggedIndex];
        State.swimlanes.splice(draggedIndex, 1);
        const insertAt = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        State.swimlanes.splice(insertAt, 0, draggedItem);
        renderStep();
        saveDraft();
    }
}

function dragEnd(e) {
    const item = e.target.closest('.swimlane-config');
    if (item) {
        item.style.opacity = '1';
        item.classList.remove('dragging');
    }
    // Clear any remaining border styles
    document.querySelectorAll('.swimlane-config').forEach(config => {
        config.style.borderTop = '';
    });
    draggedIndex = null;
}

function renderSecurityConfigStep() {
    var sc = State.securityConfig;
    var swimlanes = State.swimlanes || [];

    // Build swimlane group rows
    var swimlaneGroupRows = swimlanes.map(function(sl, idx) {
        var existing = (sc.swimlaneGroups || []).find(function(sg) { return sg.swimlaneName === sl.name; });
        var groupId = existing ? existing.groupId : '';
        var groupName = existing ? existing.groupName : '';
        return '<tr>' +
            '<td style="font-weight:600;padding:10px 15px;">' + escapeHtml(sl.name) + '</td>' +
            '<td style="padding:10px 15px;"><input type="text" class="swimlane-group-id" data-idx="' + idx + '" ' +
                'value="' + escapeHtml(groupId) + '" placeholder="Azure AD Group ID (GUID)" ' +
                'style="width:100%;padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:0.85rem;font-family:Consolas,monospace;" ' +
                'oninput="updateSwimlaneGroupId(' + idx + ', this.value)"></td>' +
            '<td style="padding:10px 15px;"><input type="text" class="swimlane-group-name" data-idx="' + idx + '" ' +
                'value="' + escapeHtml(groupName) + '" placeholder="Group display name" ' +
                'style="width:100%;padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:0.85rem;" ' +
                'oninput="updateSwimlaneGroupName(' + idx + ', this.value)"></td>' +
        '</tr>';
    }).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-shield-lock" style="color:var(--primary);margin-right:8px;"></i>
            <strong>Security-first access control</strong> prevents unauthorized data from reaching the browser.
            When enabled, the dashboard checks the user's group membership <em>before</em> calling the integration.
            Non-authorized users never receive the data — it's not just hidden with CSS.</p>
        </div>

        <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">
            <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-size:1rem;">
                <input type="checkbox" ${sc.enabled ? 'checked' : ''}
                    onchange="toggleSecurityEnabled(this.checked)"
                    style="width:20px;height:20px;accent-color:var(--primary);">
                <span><strong>Enable access control</strong></span>
            </label>
            <p style="margin:8px 0 0 32px;color:#666;font-size:0.85rem;">
                When disabled, all users with dashboard access see all data (current default behavior).
            </p>
        </div>

        <div id="securityDetails" style="display:${sc.enabled ? 'block' : 'none'};">
            <div style="background:white;border:2px solid var(--primary);border-radius:12px;padding:20px;margin:20px 0;">
                <h5 style="color:var(--primary);margin-bottom:15px;"><i class="bi bi-person-badge"></i> Power User / Supervisor Group</h5>
                <p style="color:#666;font-size:0.85rem;margin-bottom:12px;">
                    Members of this group see <strong>all swimlanes</strong> and load the full unfiltered dataset.
                </p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label style="font-size:0.8rem;color:#888;font-weight:600;text-transform:uppercase;">Group ID (GUID)</label>
                        <input type="text" value="${escapeHtml(sc.powerGroupId || '')}"
                            placeholder="e.g. f8eab38d-e771-47dd-a112-13a09cd63e44"
                            oninput="State.securityConfig.powerGroupId = this.value"
                            style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-family:Consolas,monospace;font-size:0.85rem;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem;color:#888;font-weight:600;text-transform:uppercase;">Display Name</label>
                        <input type="text" value="${escapeHtml(sc.powerGroupName || '')}"
                            placeholder="e.g. FA Supervisors"
                            oninput="State.securityConfig.powerGroupName = this.value"
                            style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:0.85rem;">
                    </div>
                </div>
            </div>

            <div style="background:white;border:1px solid #e0e0e0;border-radius:12px;padding:20px;margin:20px 0;">
                <h5 style="color:var(--primary);margin-bottom:8px;"><i class="bi bi-diagram-3"></i> Per-Swimlane Group Assignments</h5>
                <p style="color:#666;font-size:0.85rem;margin-bottom:15px;">
                    Assign an Azure AD group to each swimlane. Users in that group will only load data for their swimlane.
                    Leave blank for swimlanes that don't need restriction (visible to all).
                </p>
                ${swimlanes.length > 0 ? `
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8f9fa;">
                                <th style="padding:10px 15px;text-align:left;font-size:0.8rem;text-transform:uppercase;color:#888;border-bottom:2px solid #e0e0e0;">Swimlane</th>
                                <th style="padding:10px 15px;text-align:left;font-size:0.8rem;text-transform:uppercase;color:#888;border-bottom:2px solid #e0e0e0;">Group ID</th>
                                <th style="padding:10px 15px;text-align:left;font-size:0.8rem;text-transform:uppercase;color:#888;border-bottom:2px solid #e0e0e0;">Group Name</th>
                            </tr>
                        </thead>
                        <tbody>${swimlaneGroupRows}</tbody>
                    </table>
                ` : '<p style="color:#999;text-align:center;padding:20px;">Define swimlanes in the previous step first.</p>'}
            </div>

            <div style="background:rgba(23,162,184,0.08);border-radius:10px;padding:16px 20px;margin:20px 0;font-size:0.85rem;line-height:1.7;">
                <strong><i class="bi bi-info-circle"></i> How it works at runtime:</strong>
                <ol style="margin:8px 0 0;padding-left:20px;">
                    <li>Dashboard checks if user belongs to the <strong>Power Group</strong></li>
                    <li>If yes &rarr; loads <em>all</em> data from the integration (full dataset)</li>
                    <li>If no &rarr; checks which swimlane group(s) the user belongs to</li>
                    <li>Only fires the integration for matched swimlanes (data never sent for others)</li>
                    <li>If user matches no groups &rarr; shows "Access Denied" message</li>
                </ol>
            </div>
        </div>
    `;
}

function toggleSecurityEnabled(checked) {
    State.securityConfig.enabled = checked;
    var details = document.getElementById('securityDetails');
    if (details) details.style.display = checked ? 'block' : 'none';
}

function updateSwimlaneGroupId(idx, value) {
    var sl = State.swimlanes[idx];
    if (!sl) return;
    var groups = State.securityConfig.swimlaneGroups || [];
    var existing = groups.find(function(g) { return g.swimlaneName === sl.name; });
    if (existing) {
        existing.groupId = value;
    } else {
        groups.push({ swimlaneName: sl.name, groupId: value, groupName: '' });
    }
    State.securityConfig.swimlaneGroups = groups;
}

function updateSwimlaneGroupName(idx, value) {
    var sl = State.swimlanes[idx];
    if (!sl) return;
    var groups = State.securityConfig.swimlaneGroups || [];
    var existing = groups.find(function(g) { return g.swimlaneName === sl.name; });
    if (existing) {
        existing.groupName = value;
    } else {
        groups.push({ swimlaneName: sl.name, groupId: '', groupName: value });
    }
    State.securityConfig.swimlaneGroups = groups;
}

function renderGenerateStep() {
    const sql = State.customSQL || generateSQL();

    // Summary of what was built
    const summary = [];
    summary.push(`<strong>Dashboard Name:</strong> ${escapeHtml(State.dashboardTitle || 'Untitled Dashboard')}`);
    if (State.advancedMode) {
        summary.push(`<strong>Source Name:</strong> <code>${escapeHtml(State.sourceName)}</code>`);
    }
    if (State.mode === 'content' && State.selectedArea) {
        summary.push(`<strong>Folder:</strong> ${escapeHtml(State.selectedArea.name)}`);
        summary.push(`<strong>Document Types:</strong> ${State.selectedDocTypes.length} selected`);
        summary.push(`<strong>Columns:</strong> ${State.selectedFields.length} fields`);
    } else if (State.mode === 'forms' && State.selectedTemplate) {
        summary.push(`<strong>Form:</strong> ${escapeHtml(State.selectedTemplate.name)}`);
        summary.push(`<strong>Fields:</strong> ${State.selectedInputIds.length} selected`);
        summary.push(`<strong>Workflow Steps:</strong> ${State.selectedWorkflowSteps.length} tracked`);
    } else if (State.mode === 'combined') {
        if (State.selectedArea) {
            summary.push(`<strong>Document Folder:</strong> ${escapeHtml(State.selectedArea.name)}`);
            summary.push(`<strong>Document Types:</strong> ${State.selectedDocTypes.length} selected`);
            summary.push(`<strong>Document Fields:</strong> ${State.selectedFields.length} fields`);
        }
        if (State.selectedTemplate) {
            summary.push(`<strong>Form:</strong> ${escapeHtml(State.selectedTemplate.name)}`);
            summary.push(`<strong>Form Fields:</strong> ${State.selectedInputIds.length} selected`);
        }
        if (State.selectedWorkflowSteps.length > 0) {
            summary.push(`<strong>Workflow Steps:</strong> ${State.selectedWorkflowSteps.length} tracked`);
        }
    }
    summary.push(`<strong>Groups:</strong> ${State.swimlanes.map(s => escapeHtml(s.name)).join(', ')}`);

    // Security summary
    if (State.securityConfig.enabled) {
        summary.push(`<strong>Access Control:</strong> <span style="color:#059669;">Enabled (security-first)</span>`);
        if (State.securityConfig.powerGroupName) {
            summary.push(`<strong>Power Group:</strong> ${escapeHtml(State.securityConfig.powerGroupName)}`);
        }
        var securedLanes = (State.securityConfig.swimlaneGroups || []).filter(function(g) { return g.groupId; }).length;
        if (securedLanes > 0) {
            summary.push(`<strong>Secured Swimlanes:</strong> ${securedLanes} of ${State.swimlanes.length}`);
        }
    } else {
        summary.push(`<strong>Access Control:</strong> <span style="color:#888;">Disabled (all users see all data)</span>`);
    }

    if (State.advancedMode) {
        // Advanced mode - editable SQL
        return `
            <div class="step-description" style="background:rgba(40,167,69,0.1);border-color:var(--success);">
                <p><i class="bi bi-check-circle-fill" style="color:var(--success);margin-right:8px;"></i>
                Your dashboard is ready! Review and customize the SQL below.</p>
            </div>

            <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">
                <h4 style="margin-bottom:15px;color:var(--primary);"><i class="bi bi-clipboard-check"></i> Summary</h4>
                <div style="line-height:2;">
                    ${summary.map(s => `<div>${s}</div>`).join('')}
                </div>
            </div>

            <div class="advanced-section active">
                <h5><i class="bi bi-code-slash"></i> SQL Query Editor</h5>
                <div class="editor-toolbar">
                    <button onclick="resetSQL()" title="Reset to generated SQL">
                        <i class="bi bi-arrow-counterclockwise"></i> Reset
                    </button>
                    <button onclick="copySQL(event)" title="Copy to clipboard">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <button onclick="formatSQL()" title="Format SQL">
                        <i class="bi bi-text-indent-left"></i> Format
                    </button>
                    ${State.customSQL ? `
                        <span style="margin-left:auto;color:var(--accent);font-size:0.8rem;">
                            <i class="bi bi-pencil"></i> Modified
                        </span>
                    ` : ''}
                </div>
                <textarea class="sql-editor" id="sqlEditor"
                          oninput="State.customSQL = this.value"
                          spellcheck="false">${escapeHtml(sql)}</textarea>
                <small style="color:#666;display:block;margin-top:10px;">
                    <i class="bi bi-info-circle"></i> Edit the SQL directly. Changes will be included in your download.
                </small>
            </div>

            <div class="info-box" style="background:rgba(23,162,184,0.08);margin-top:20px;">
                <h4><i class="bi bi-arrow-right-circle"></i> What happens next?</h4>
                <ol style="line-height:2;margin:10px 0 0 0;padding-left:20px;">
                    <li>Click <strong>Get Dashboard Files</strong> below</li>
                    <li>Save each file to your computer (copy and paste into Notepad, or use Save File)</li>
                    <li>Create a Source in Etrieve Central named: <code>${escapeHtml(State.sourceName || 'your dashboard name')}</code></li>
                    <li>Paste the SQL query into the Source, then upload the remaining files</li>
                </ol>
            </div>

            <div class="advanced-toggle" style="margin-top:20px;" title="Toggle the SQL editor and technical details">
                <label>
                    <input type="checkbox" ${State.advancedMode ? 'checked' : ''} onchange="toggleAdvancedMode(this.checked)">
                    <span>Advanced Mode</span>
                </label>
                <span class="badge-advanced">Power User</span>
            </div>
        `;
    }

    // Simple mode - read-only SQL in collapsible
    return `
        <div class="step-description" style="background:rgba(40,167,69,0.1);border-color:var(--success);">
            <p><i class="bi bi-check-circle-fill" style="color:var(--success);margin-right:8px;"></i>
            Your dashboard is ready! Review the summary below and download your files.</p>
        </div>

        <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">
            <h4 style="margin-bottom:15px;color:var(--primary);"><i class="bi bi-clipboard-check"></i> Summary</h4>
            <div style="line-height:2;">
                ${summary.map(s => `<div>${s}</div>`).join('')}
            </div>
        </div>

        <details style="margin:20px 0;">
            <summary style="cursor:pointer;font-weight:600;padding:10px 0;color:var(--primary);">
                <i class="bi bi-code-slash"></i> View Generated SQL (Technical)
            </summary>
            <div class="sql-preview" style="margin-top:15px;">
                <pre>${highlightSQL(sql)}</pre>
            </div>
        </details>

        <div class="info-box" style="background:rgba(23,162,184,0.08);">
            <h4><i class="bi bi-arrow-right-circle"></i> What happens next?</h4>
            <ol style="line-height:2;margin:10px 0 0 0;padding-left:20px;">
                <li>Click <strong>Get Dashboard Files</strong> below</li>
                <li>Save each file to your computer (copy and paste into Notepad, or use Save File)</li>
                <li>Email the saved files to your Etrieve administrator</li>
                <li>They'll create a source named <code>${escapeHtml(State.sourceName || 'your dashboard name')}</code> and set it up</li>
            </ol>
        </div>

        <div class="advanced-toggle" style="margin-top:20px;" title="Toggle the SQL editor and technical details">
            <label>
                <input type="checkbox" ${State.advancedMode ? 'checked' : ''} onchange="toggleAdvancedMode(this.checked)">
                <span>Advanced Mode</span>
            </label>
            <span class="badge-advanced">Power User</span>
        </div>
    `;
}


function showDownloadModal(files) {
    // Show a modal with file contents that users can copy-paste and save
    var modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.className = 'draft-modal';

    var fileKeys = Object.keys(files);
    var fileCount = fileKeys.length;
    var firstFile = fileKeys[0];

    // Track which files have been copied
    window._copiedFiles = {};

    // Build tab buttons without inline onclick (CSP-safe)
    var tabsHtml = fileKeys.map(function(filename, idx) {
        return '<button class="file-tab' + (idx === 0 ? ' active' : '') + '" data-file="' + escapeHtml(filename) + '">' +
               '<i class="bi bi-file-code"></i> ' + escapeHtml(filename) +
               '<span class="copy-check" style="display:none;margin-left:6px;color:#28a745;"><i class="bi bi-check-circle-fill"></i></span>' +
               '</button>';
    }).join('');

    // Build initial content
    var initialContent = '<pre style="margin:0;padding:20px;background:#1e1e1e;color:#d4d4d4;font-family:Consolas,monospace;font-size:0.85rem;overflow:auto;max-height:100%;">' + escapeHtml(files[firstFile]) + '</pre>';

    modal.innerHTML =
        '<div class="draft-modal-content" style="max-width:850px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;">' +
            // Header with instructions
            '<div style="padding:20px 30px 16px;border-bottom:1px solid #e9ecef;flex-shrink:0;">' +
                '<h3 style="margin:0 0 10px;display:flex;align-items:center;gap:10px;">' +
                    '<i class="bi bi-files" style="color:var(--primary);"></i>' +
                    'Your Dashboard Files' +
                '</h3>' +
                '<div style="background:#e8f4fd;border:1px solid #b6d4fe;border-radius:8px;padding:12px 16px;font-size:0.9rem;line-height:1.6;">' +
                    '<strong><i class="bi bi-info-circle"></i> How to save each file:</strong>' +
                    '<ol style="margin:6px 0 0;padding-left:22px;">' +
                        '<li>Click <strong>Copy</strong> to copy the file contents to your clipboard</li>' +
                        '<li>Open <strong>Notepad</strong> (Windows) or <strong>TextEdit</strong> (Mac)</li>' +
                        '<li>Paste with <strong>Ctrl+V</strong> (or Cmd+V on Mac)</li>' +
                        '<li>Save with <strong>File &gt; Save As</strong> using the filename shown above the code</li>' +
                    '</ol>' +
                    '<div style="margin-top:6px;color:#664d03;"><i class="bi bi-exclamation-triangle"></i> Repeat for each tab. You need all <strong>' + fileCount + ' files</strong>.</div>' +
                '</div>' +
            '</div>' +
            // File tabs
            '<div class="file-tabs-bar" style="display:flex;border-bottom:1px solid #e9ecef;overflow-x:auto;flex-shrink:0;flex-wrap:wrap;gap:0;">' +
                tabsHtml +
            '</div>' +
            // Filename banner + content
            '<div style="background:#f0f0f0;padding:8px 20px;border-bottom:1px solid #e0e0e0;flex-shrink:0;display:flex;align-items:center;gap:8px;">' +
                '<i class="bi bi-file-earmark-code" style="color:#6c757d;"></i>' +
                '<span style="font-weight:600;font-size:0.9rem;">Save as:</span>' +
                '<code id="currentFilename" style="background:#fff;padding:3px 10px;border-radius:4px;font-size:0.9rem;font-weight:700;color:var(--primary);border:1px solid #dee2e6;">' + escapeHtml(firstFile) + '</code>' +
            '</div>' +
            '<div style="flex:1;min-height:0;overflow:auto;padding:0;">' +
                '<div id="fileContentArea">' + initialContent + '</div>' +
            '</div>' +
            // Footer with copy + progress
            '<div style="padding:12px 25px;border-top:1px solid #e9ecef;display:flex;gap:12px;align-items:center;background:#f8f9fa;flex-shrink:0;flex-wrap:wrap;">' +
                '<span id="fileIndicator" style="font-size:0.85rem;color:#666;">File 1 of ' + fileCount + '</span>' +
                '<span id="copyProgress" style="font-size:0.85rem;color:#666;"> -- <strong>0 of ' + fileCount + '</strong> copied</span>' +
                '<span style="flex:1;"></span>' +
                '<button class="btn btn-secondary" id="saveFileBtn" title="Download this file directly">' +
                    '<i class="bi bi-download"></i> Save File' +
                '</button>' +
                '<button class="btn btn-primary" id="copyFileBtn">' +
                    '<i class="bi bi-clipboard"></i> Copy to Clipboard' +
                '</button>' +
            '</div>' +
            // Done bar (separate from action buttons for clarity)
            '<div style="padding:10px 25px;border-top:1px solid #e9ecef;display:flex;justify-content:flex-end;align-items:center;background:#f1f3f5;flex-shrink:0;">' +
                '<button class="btn btn-secondary" id="doneBtn" style="min-width:100px;">' +
                    '<i class="bi bi-x-lg"></i> Close' +
                '</button>' +
            '</div>' +
        '</div>';

    // Store files for copying
    window._downloadFiles = files;
    window._currentFile = firstFile;

    document.body.appendChild(modal);

    // Event delegation for tab clicks (CSP-safe, no inline onclick)
    modal.querySelector('.file-tabs-bar').addEventListener('click', function(e) {
        var tab = e.target.closest('.file-tab');
        if (tab && tab.dataset.file) {
            e.stopPropagation();
            showFileContent(tab.dataset.file);
        }
    });

    // Copy button handler
    modal.querySelector('#copyFileBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        copyCurrentFile(e);
    });

    // Save file button handler (individual file download via Blob)
    modal.querySelector('#saveFileBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        saveCurrentFile();
    });

    // Done button handler -- warn if not all files copied/saved
    modal.querySelector('#doneBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        var copied = Object.keys(window._copiedFiles || {}).length;
        if (copied < fileCount) {
            var remaining = fileCount - copied;
            if (!confirm('You have ' + remaining + ' file' + (remaining > 1 ? 's' : '') + ' remaining that you haven\'t copied or saved yet.\n\nClose anyway?')) {
                return;
            }
        }
        closeDownloadModal();
    });

    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            // Same close-with-warning logic
            var copied = Object.keys(window._copiedFiles || {}).length;
            if (copied < fileCount) {
                var remaining = fileCount - copied;
                if (!confirm('You have ' + remaining + ' file' + (remaining > 1 ? 's' : '') + ' remaining.\n\nClose anyway?')) {
                    return;
                }
            }
            closeDownloadModal();
        }
    });

    // Escape key handled by global keydown listener
}

function showFileContent(filename) {
    var files = window._downloadFiles;
    if (!files || !files[filename]) return;

    window._currentFile = filename;

    // Update tabs -- scope to download modal only
    var modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.querySelectorAll('.file-tab').forEach(function(tab) {
        tab.classList.toggle('active', tab.dataset.file === filename);
    });

    // Update content
    var contentArea = document.getElementById('fileContentArea');
    if (contentArea) {
        contentArea.innerHTML = '<pre style="margin:0;padding:20px;background:#1e1e1e;color:#d4d4d4;font-family:Consolas,monospace;font-size:0.85rem;overflow:auto;max-height:100%;">' + escapeHtml(files[filename]) + '</pre>';
    }

    // Update filename banner
    var filenameEl = document.getElementById('currentFilename');
    if (filenameEl) filenameEl.textContent = filename;

    // Update file position indicator
    var fileKeys = Object.keys(files);
    var fileIdx = fileKeys.indexOf(filename);
    var indicator = document.getElementById('fileIndicator');
    if (indicator && fileIdx !== -1) {
        indicator.textContent = 'File ' + (fileIdx + 1) + ' of ' + fileKeys.length;
    }
}

function copyCurrentFile(e) {
    var files = window._downloadFiles;
    var filename = window._currentFile;
    if (!files || !filename) return;

    var text = files[filename];
    var btn = e ? e.target.closest('button') : document.getElementById('copyFileBtn');

    function onSuccess() {
        // Mark this file as copied
        markFileCopied(filename);

        if (!btn) return;
        var originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        btn.style.background = '#28a745';
        btn.style.color = '#fff';
        setTimeout(function() {
            btn.innerHTML = originalHtml;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
        showToast('Copied! Now paste into Notepad and save as: ' + filename, 'success');
    }

    function onFail() {
        // Select all text in the pre element so user can Ctrl+C
        var pre = document.querySelector('#fileContentArea pre');
        if (pre) {
            var range = document.createRange();
            range.selectNodeContents(pre);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            showToast('Text selected -- press Ctrl+C to copy, then paste into Notepad and save as: ' + filename, 'info');
        } else {
            showToast('Copy failed. Please select all text manually (Ctrl+A), copy (Ctrl+C), and save as: ' + filename, 'error');
        }
    }

    // Try modern Clipboard API first, then fall back to execCommand for iframes
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(function() {
            fallbackCopy(text) ? onSuccess() : onFail();
        });
    } else {
        fallbackCopy(text) ? onSuccess() : onFail();
    }
}

function saveCurrentFile() {
    // Download the current file directly via Blob URL
    var files = window._downloadFiles;
    var filename = window._currentFile;
    if (!files || !filename) return;

    try {
        var blob = new Blob([files[filename]], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        markFileCopied(filename);
        showToast('Downloading ' + filename + '...', 'success');
    } catch (err) {
        showToast('Download not available in this browser. Use Copy instead.', 'warning');
    }
}

function markFileCopied(filename) {
    // Track this file as copied/saved
    if (!window._copiedFiles) window._copiedFiles = {};
    window._copiedFiles[filename] = true;

    // Update the tab checkmark
    var modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.querySelectorAll('.file-tab').forEach(function(tab) {
        if (tab.dataset.file === filename) {
            var check = tab.querySelector('.copy-check');
            if (check) check.style.display = 'inline';
        }
    });

    // Update progress counter
    var copied = Object.keys(window._copiedFiles).length;
    var total = Object.keys(window._downloadFiles || {}).length;
    var progress = document.getElementById('copyProgress');
    if (progress) {
        progress.innerHTML = ' -- <strong>' + copied + ' of ' + total + '</strong> copied';
        if (copied >= total) {
            progress.innerHTML = ' -- <strong style="color:#28a745;">All ' + total + ' files copied!</strong>';
        }
    }

    // Auto-advance to next uncopied tab after a short delay
    if (copied < total) {
        var fileKeys = Object.keys(window._downloadFiles);
        var nextFile = null;
        for (var i = 0; i < fileKeys.length; i++) {
            if (!window._copiedFiles[fileKeys[i]]) {
                nextFile = fileKeys[i];
                break;
            }
        }
        if (nextFile) {
            setTimeout(function() { showFileContent(nextFile); }, 1500);
        }
    }
}

function fallbackCopy(text) {
    try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch (err) {
        return false;
    }
}

function closeDownloadModal() {
    var modal = document.getElementById('downloadModal');
    if (modal) modal.remove();
    window._downloadFiles = null;
    window._currentFile = null;
    window._copiedFiles = null;
}

// generateDashboardFiles(), generateConfigJS() are defined in wizard-generators.js
// (which overrides these via function declaration hoisting when loaded second)


// ============================================================================
// LIVE PREVIEW
// ============================================================================

function renderPreview() {
    const container = document.getElementById('previewContent');
    if (!container) return;

    const title = State.dashboardTitle || 'My Dashboard';
    const swimlanes = State.swimlanes.length > 0 ? State.swimlanes : [{ name: 'In Progress' }, { name: 'Completed' }];

    // Get selected fields/columns for table headers
    let columns = [];
    if (State.mode === 'content') {
        const fields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        columns = fields.filter(f => State.selectedFields.includes(f.id)).map(f => f.name);
        if (columns.length === 0) columns = ['Name', 'Date', 'Status'];
    } else if (State.mode === 'forms') {
        const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        columns = inputs.filter(i => State.selectedInputIds.includes(i.id)).map(i => i.label);
        if (columns.length === 0) columns = ['Requester', 'Date', 'Status'];
    } else if (State.mode === 'combined') {
        // Combined mode: show a mix of document and form fields
        const docFields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        const formInputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        const docCols = docFields.filter(f => State.selectedFields.includes(f.id)).map(f => f.name);
        const formCols = formInputs.filter(i => State.selectedInputIds.includes(i.id)).map(i => i.label);
        // Merge columns, prioritizing doc fields then form fields
        columns = docCols.concat(formCols.filter(c => !docCols.includes(c)));
        if (columns.length === 0) columns = ['Name', 'Date', 'Type', 'Status'];
    }

    // Limit columns for preview
    columns = columns.slice(0, 4);
    if (columns.length > 3) {
        columns = columns.slice(0, 3);
        columns.push('...');
    }

    // Generate fake preview data
    const fakeData = generateFakePreviewData(columns);

    const swimlanesHtml = swimlanes.map((sl, idx) => {
        const rowCount = idx === 0 ? 3 : 2;
        const rows = fakeData.slice(0, rowCount).map(row => `
            <tr>
                ${columns.map(col => `<td>${escapeHtml(row[col] || '--')}</td>`).join('')}
            </tr>
        `).join('');

        // Build filter summary for preview
        const filterSummary = sl.filters && sl.filters.length > 0
            ? sl.filters.map(f => `${escapeHtml(f.fieldName)}: ${f.values.slice(0,2).map(v => escapeHtml(v)).join(', ')}${f.values.length > 2 ? '...' : ''}`).join(' | ')
            : '';

        return `
            <div class="preview-swimlane">
                <div class="preview-swimlane-header">
                    <i class="bi bi-chevron-down" style="font-size:0.7rem;"></i>
                    ${escapeHtml(sl.name)}
                    <span class="count">${rowCount}</span>
                </div>
                ${filterSummary ? `<div class="preview-filter-hint"><i class="bi bi-funnel"></i> ${filterSummary}</div>` : ''}
                <table class="preview-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="preview-label"><i class="bi bi-eye"></i> Preview</div>
        <div class="preview-dashboard">
            <div class="preview-dashboard-header">
                <h4>${escapeHtml(title)}</h4>
                <small>${State.mode === 'content' ? 'Document Dashboard' : State.mode === 'forms' ? 'Forms Dashboard' : 'Combined Dashboard'}</small>
            </div>
            ${swimlanesHtml}
        </div>
    `;
}

function generateFakePreviewData(columns) {
    const fakeNames = ['John Smith', 'Maria Garcia', 'James Wilson', 'Sarah Johnson', 'Michael Brown'];
    const fakeDates = ['01/15/2026', '01/14/2026', '01/13/2026', '01/12/2026', '01/11/2026'];
    const fakeStatuses = ['Pending', 'Approved', 'In Review', 'Submitted', 'Complete'];
    const fakeDepts = ['Financial Aid', 'Admissions', 'HR', 'IT', 'Marketing'];

    return fakeNames.map((name, i) => {
        const row = {};
        columns.forEach((col, j) => {
            const colLower = col.toLowerCase();
            if (colLower.includes('name') || colLower.includes('requester')) {
                row[col] = name;
            } else if (colLower.includes('date')) {
                row[col] = fakeDates[i];
            } else if (colLower.includes('status') || colLower.includes('step')) {
                row[col] = fakeStatuses[i];
            } else if (colLower.includes('dept') || colLower.includes('department')) {
                row[col] = fakeDepts[i];
            } else if (colLower.includes('email')) {
                row[col] = name.split(' ')[0].toLowerCase() + '@cod.edu';
            } else if (colLower.includes('id')) {
                row[col] = 'A' + (100000 + i * 1234);
            } else if (col === '...') {
                row[col] = '...';
            } else {
                row[col] = 'Data ' + (i + 1);
            }
        });
        return row;
    });
}

// ============================================================================
// EXPANDABLE PREVIEW
// ============================================================================

function expandPreview() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    // Get the current preview HTML
    const previewHtml = previewContent.innerHTML;

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'previewModal';
    modal.className = 'preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-content">
            <div class="preview-header">
                <div class="dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                </div>
                <span class="title">${escapeHtml(State.dashboardTitle || 'Dashboard')} - Full Preview</span>
                <button class="close-preview" id="closePreviewBtn">
                    <i class="bi bi-x-lg"></i> Close
                </button>
            </div>
            <div class="preview-content">
                ${previewHtml}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button (CSP-safe, no inline onclick)
    modal.querySelector('#closePreviewBtn').addEventListener('click', function() {
        closePreviewModal();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePreviewModal();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', handlePreviewEscape);
}

function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handlePreviewEscape);
}

function handlePreviewEscape(e) {
    if (e.key === 'Escape') {
        closePreviewModal();
    }
}


// ============================================================================
// AMD MODULE REGISTRATION
// ============================================================================
// RequireJS needs a define() call to know this script has loaded.
// All the code above runs in global scope (window.*) because it is OUTSIDE
// the define() function body. This preserves onclick='selectMode(...)' etc.
// ============================================================================
if (typeof define === 'function' && define.amd) {
  define('template/wizard-templates', ['template/wizard-demo'], function () {
    return { loaded: true };
  });
}