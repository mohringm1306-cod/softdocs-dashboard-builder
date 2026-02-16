/**
 * Dashboard Builder Wizard 3.0 - Webinar Demo
 * Simulated API responses for demonstration purposes
 */

console.log('Dashboard Builder Wizard Demo loaded');

// ============================================================================
// SIMULATED API DATA (What would come from live Etrieve)
// ============================================================================

var SimulatedData = {
    // Areas/Catalogs - simulates GET /areas response
    areas: [
        { id: 2, name: 'Students', description: 'Student document repository' },
        { id: 13, name: 'Employees', description: 'Employee HR documents' },
        { id: 38, name: 'Testing Center', description: 'Testing center records' },
        { id: 39, name: 'PD Appeals', description: 'Police Department appeals' },
        { id: 41, name: 'Transfer Services', description: '3+1 transfer program documents' },
        { id: 44, name: 'Health Sciences', description: 'Health sciences program applications' }
    ],

    // Document Types - simulates GET /documentTypes response
    documentTypes: {
        2: [ // Students
            { id: 101, name: 'FA - FAFSA', code: 'FAFAFSA' },
            { id: 102, name: 'FA - W2', code: 'FAW2' },
            { id: 103, name: 'FA - Tax Return', code: 'FATAX' },
            { id: 104, name: 'FA - Verification Worksheet', code: 'FAVER' },
            { id: 105, name: 'FA - Award Letter', code: 'FAAWARD' },
            { id: 106, name: 'FA - SAP Appeal', code: 'FASAP' },
            { id: 110, name: 'Transcript - Official', code: 'TRANSOFF' },
            { id: 111, name: 'Transcript - Unofficial', code: 'TRANSUN' },
            { id: 112, name: 'Transcript - HS', code: 'TRANSHS' },
            { id: 120, name: 'Registration - Add/Drop', code: 'REGADD' },
            { id: 121, name: 'Registration - Withdrawal', code: 'REGWD' }
        ],
        13: [ // Employees
            { id: 201, name: 'HR - Application', code: 'HRAPP' },
            { id: 202, name: 'HR - I9', code: 'HRI9' },
            { id: 203, name: 'HR - W4', code: 'HRW4' },
            { id: 204, name: 'HR - Direct Deposit', code: 'HRDD' },
            { id: 205, name: 'HR - Benefits Enrollment', code: 'HRBEN' },
            { id: 206, name: 'HR - Performance Review', code: 'HRPERF' }
        ],
        44: [ // Health Sciences
            { id: 301, name: 'HS - Application', code: 'HSAPP' },
            { id: 302, name: 'HS - Background Check', code: 'HSBG' },
            { id: 303, name: 'HS - Immunization Record', code: 'HSIMM' },
            { id: 304, name: 'HS - Drug Screen', code: 'HSDRUG' },
            { id: 305, name: 'HS - CPR Certification', code: 'HSCPR' }
        ]
    },

    // Key Fields by Area - simulates document type field definitions
    // Each field can have 'values' array for fields that are filterable
    keyFields: {
        2: [ // Student fields
            { id: 2, name: 'First Name', type: 'party', alias: 'StudentFName' },
            { id: 4, name: 'Last Name', type: 'party', alias: 'StudentLName' },
            { id: 25, name: 'Student ID', type: 'party', alias: 'StudentID' },
            { id: 9, name: 'Student Info Lookup', type: 'lookup', alias: 'StudentLookup' },
            { id: 10, name: 'Document Date', type: 'date', alias: 'DocumentDate' },
            { id: 11, name: 'Term', type: 'text', alias: 'Term', values: ['Fall 2025', 'Spring 2026', 'Summer 2026', 'Fall 2026'] },
            { id: 18, name: 'Academic Year', type: 'text', alias: 'AcademicYear', values: ['2024-2025', '2025-2026', '2026-2027'] },
            { id: 60, name: 'FA Status', type: 'text', alias: 'FAStatus', values: ['Pending Review', 'Under Review', 'Approved', 'Denied', 'Incomplete', 'Needs More Info'] },
            { id: 496, name: 'Student Status', type: 'text', alias: 'StudentStatus', values: ['Active', 'Inactive', 'Graduated', 'Withdrawn', 'On Hold'] },
            { id: 504, name: 'FA Comments', type: 'text', alias: 'FAComments' }
        ],
        13: [ // Employee fields
            { id: 2, name: 'First Name', type: 'party', alias: 'EmployeeFName' },
            { id: 4, name: 'Last Name', type: 'party', alias: 'EmployeeLName' },
            { id: 58, name: 'Employee ID', type: 'party', alias: 'EmployeeID' },
            { id: 59, name: 'Employee Info Lookup', type: 'lookup', alias: 'EmployeeLookup' },
            { id: 10, name: 'Document Date', type: 'date', alias: 'DocumentDate' },
            { id: 132, name: 'Document Owner', type: 'text', alias: 'DocOwner' },
            { id: 133, name: 'HR Status', type: 'text', alias: 'HRStatus', values: ['New', 'In Progress', 'Complete', 'Archived'] }
        ],
        44: [ // Health Sciences fields
            { id: 2, name: 'First Name', type: 'party', alias: 'StudentFName' },
            { id: 4, name: 'Last Name', type: 'party', alias: 'StudentLName' },
            { id: 25, name: 'Student ID', type: 'party', alias: 'StudentID' },
            { id: 87, name: 'HS Program', type: 'text', alias: 'HSProgram', values: ['Nursing', 'Dental Hygiene', 'Radiologic Tech', 'Respiratory Care', 'Sonography'] },
            { id: 97, name: 'HS Status', type: 'text', alias: 'HSStatus', values: ['Applied', 'Documents Pending', 'Under Review', 'Interview Scheduled', 'Accepted', 'Waitlisted', 'Denied'] },
            { id: 98, name: 'Admission Decision', type: 'text', alias: 'AdmissionDecision', values: ['Pending', 'Accepted', 'Conditional Accept', 'Waitlisted', 'Denied'] },
            { id: 99, name: 'Program Deadline', type: 'date', alias: 'ProgramDeadline' }
        ]
    },

    // Form Templates - simulates GET /reporting/central_forms_TemplateVersion
    formTemplates: [
        { id: 586, name: 'Service Request', templateId: 361 },
        { id: 638, name: 'Capital Budget Request FY26', templateId: 401 },
        { id: 665, name: 'Position Request', templateId: 402 },
        { id: 668, name: 'Capital Budget Request FY27', templateId: 401 },
        { id: 692, name: 'Incident Report', templateId: 360 },
        { id: 710, name: 'Equipment Request', templateId: 420 },
        { id: 725, name: 'Travel Authorization', templateId: 430 }
    ],

    // Form InputIDs by Template - simulates form field discovery
    formInputIds: {
        586: [ // Service Request
            { id: 'first_name_1', label: 'First Name' },
            { id: 'last_name_2', label: 'Last Name' },
            { id: 'email_3', label: 'Employee Email' },
            { id: 'department_6', label: 'Department' },
            { id: 'title_7', label: 'Job Title' },
            { id: 'checkbox_1# Category A', label: 'Category: Option A' },
            { id: 'checkbox_1# Category B', label: 'Category: Option B' },
            { id: 'checkbox_1# Category C', label: 'Category: Option C' },
            { id: 'checkbox_1# Category D', label: 'Category: Option D' },
            { id: 'employee_signature_1', label: 'Signature' },
            { id: 'request_date_5', label: 'Request Date' }
        ],
        692: [ // Incident Report
            { id: 'employee_name', label: 'Employee Name' },
            { id: 'Employee_ID', label: 'Employee ID' },
            { id: 'employee_email', label: 'Employee Email' },
            { id: 'employee_phone', label: 'Employee Phone' },
            { id: 'job_title', label: 'Job Title' },
            { id: 'hire_date', label: 'Hire Date' },
            { id: 'incident_date', label: 'Incident Date' },
            { id: 'incident_time', label: 'Incident Time' },
            { id: 'incident_location', label: 'Incident Location' },
            { id: 'incident_type', label: 'Incident Type' },
            { id: 'incident_description', label: 'Incident Description' },
            { id: 'injury_description', label: 'Injury Description' },
            { id: 'emergency_room', label: 'Emergency Room Visit' },
            { id: 'lost_time', label: 'Lost Time' },
            { id: 'supervisor_name', label: 'Supervisor Name' },
            { id: 'supervisor_signature', label: 'Supervisor Signature' }
        ],
        665: [ // Budget Position
            { id: 'first_name_8', label: 'Requester First Name' },
            { id: 'last_name_9', label: 'Requester Last Name' },
            { id: 'employee_email_11', label: 'Requester Email' },
            { id: 'radio_1', label: 'Request Type' },
            { id: 'input_30', label: 'New Position: Job Title' },
            { id: 'input_31', label: 'New Position: Pay Grade' },
            { id: 'input_32', label: 'New Position: Department' },
            { id: 'input_34', label: 'Increase FTE: Current Position' },
            { id: 'input_35', label: 'Increase FTE: Current FTE' },
            { id: 'input_36', label: 'Increase FTE: Requested FTE' },
            { id: 'text_area_3', label: 'Justification' }
        ]
    },

    // Workflow Steps by ProcessID
    workflowSteps: {
        'service': [
            { id: 'step-1-guid', name: 'Supervisor_Approval', displayName: 'Supervisor Approval' },
            { id: 'step-2-guid', name: 'Department_Review', displayName: 'Department Review' },
            { id: 'step-3-guid', name: 'Fulfillment_Queue', displayName: 'Fulfillment Queue' }
        ],
        'incident': [
            { id: 'f45-step-1', name: 'Supervisor', displayName: 'Supervisor Report' },
            { id: 'f45-step-2', name: 'Safety_Review', displayName: 'Safety Review' },
            { id: 'f45-step-3', name: 'Compliance_Review', displayName: 'Compliance Review' },
            { id: 'f45-step-4', name: 'Payroll', displayName: 'Payroll Review' },
            { id: 'f45-step-5', name: 'Final_Review', displayName: 'Final Review' }
        ],
        'budget': [
            { id: 'bo-step-1', name: 'BOSupervisor', displayName: 'Supervisor' },
            { id: 'bo-step-2', name: 'BOSupervisorsSupervisor', displayName: "Supervisor's Supervisor" },
            { id: 'bo-step-3', name: 'BOSupervisorsSupervisorsSupervisor', displayName: "Director Level" },
            { id: 'bo-step-4', name: 'IT Review', displayName: 'IT Review' }
        ]
    }
};

// ============================================================================
// THEME COOKIE HELPERS
// ============================================================================

function setThemeCookie(mode) {
    var expires = '';
    if (mode) {
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
        expires = '; expires=' + d.toUTCString();
    } else {
        // Clear cookie
        expires = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    }
    document.cookie = 'wizardTheme=' + (mode || '') + expires + '; path=/; SameSite=Lax';
}

function getThemeCookie() {
    var name = 'wizardTheme=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
        var c = parts[i].trim();
        if (c.indexOf(name) === 0) {
            var val = c.substring(name.length);
            if (val === 'content' || val === 'forms' || val === 'combined') return val;
        }
    }
    return null;
}

// Apply saved theme on page load (before any rendering)
(function initThemeFromCookie() {
    var saved = getThemeCookie();
    if (saved) {
        document.body.classList.add('mode-' + saved);
    }
})();

// ============================================================================
// STATE
// ============================================================================

const State = {
    mode: null,
    currentStep: 0,
    advancedMode: false,

    // Dashboard info
    dashboardTitle: '',
    sourceName: '',

    // Style selection
    selectedStyle: null,

    // Content mode
    selectedArea: null,
    selectedDocTypes: [],
    selectedFields: [],

    // Forms mode
    selectedTemplate: null,
    selectedInputIds: [],
    selectedWorkflowSteps: [],

    // Shared
    swimlanes: [],

    // Advanced mode - custom SQL edits
    customSQL: null,

    // Style-specific config
    styleConfig: {
        // Expandable (styles 3, 7, 9): fields shown in detail row
        detailFields: [],
        // Alpha Split (style 4): which field has the last name
        nameField: null,
        alphaRanges: [['A','H'], ['I','P'], ['Q','Z']],
        // Claims (style 5): filter chip labels
        filterChips: ['All', 'High Priority', '30+ Days', '60+ Days'],
        ageBadgeWarning: 30,
        ageBadgeCritical: 60,
        // Workflow Actions (style 6): action buttons per swimlane
        workflowActions: {},
        // Survey Analytics (style 8): field mappings
        ratingField: null,
        commentField: null,
        departmentField: null,
        // Committee Voting (style 10): member definitions
        committeeMembers: [
            { name: 'Member A', color: '#e8f5e9' },
            { name: 'Member B', color: '#e3f2fd' },
            { name: 'Member C', color: '#fff3e0' }
        ],
        // Cards Dashboard (style 11): card field mappings
        cardTitleField: null,
        cardStatusField: null,
        cardLeadField: null,
        cardBudgetField: null,
        // Bulk Actions (style 12): reassign targets
        reassignTargets: ['Get Quotes', 'Vendor Review', 'Budget Approval', 'Supervisor Approval', 'Procurement']
    }
};

// ============================================================================
// STYLE DEFINITIONS
// ============================================================================

const DashboardStyles = [
    {
        id: 'simple-status',
        num: 1,
        name: 'Simple Status',
        icon: 'bi-check-circle',
        category: 'Basic',
        description: 'Collapsible swimlanes organized by status progression.',
        bestFor: 'Linear workflows: Received → In Progress → Complete',
        examples: 'Opt-Out Forms, Parent Consent, FSSA Applications'
    },
    {
        id: 'request-type',
        num: 2,
        name: 'Request Type',
        icon: 'bi-collection',
        category: 'Basic',
        description: 'Groups items by request type or category instead of status.',
        bestFor: 'Multi-purpose forms with different request categories',
        examples: 'Travel Requests, Program Applications'
    },
    {
        id: 'expandable',
        num: 3,
        name: 'Expandable Detail',
        icon: 'bi-bullseye',
        category: 'Advanced',
        description: 'Click any row to expand and see additional detail fields below it.',
        bestFor: 'Budget requests, capital projects, detailed records',
        examples: 'Budget Office Positions, Capital Requests, Facilities'
    },
    {
        id: 'alpha-split',
        num: 4,
        name: 'Alpha Split',
        icon: 'bi-sort-alpha-down',
        category: 'Basic',
        description: 'Auto-splits items by last name ranges for workload distribution.',
        bestFor: 'High-volume processing needing workload balancing',
        examples: 'Financial Aid Documents, Student Records'
    },
    {
        id: 'claims',
        num: 5,
        name: 'Claims System',
        icon: 'bi-file-earmark-text',
        category: 'Advanced',
        description: 'Staff can claim items, see their personal stats, and filter by category. Color-coded badges show how long items have been waiting.',
        bestFor: 'Document processing queues with multiple staff',
        examples: 'Transcript Dashboard, NIS Transcripts'
    },
    {
        id: 'workflow-actions',
        num: 6,
        name: 'Workflow Actions',
        icon: 'bi-gear',
        category: 'Advanced',
        description: 'Each workflow step gets its own color and action buttons (approve, deny, etc.) with confirmation dialogs.',
        bestFor: 'Multi-step approval processes where staff take action at each stage',
        examples: 'Student Name Changes, Approval Workflows'
    },
    {
        id: 'pdf-signatures',
        num: 7,
        name: 'PDF + Signatures',
        icon: 'bi-file-pdf',
        category: 'Advanced',
        description: 'Expandable rows showing signature status and document details. Built for compliance and incident tracking.',
        bestFor: 'Forms with signatures, compliance documents, incident reports',
        examples: 'EHSR Form 45, Incident Reports'
    },
    {
        id: 'survey-analytics',
        num: 8,
        name: 'Survey Analytics',
        icon: 'bi-bar-chart',
        category: 'Specialized',
        description: 'Visual analytics with rating distributions, common themes from comments, and multiple view modes.',
        bestFor: 'Survey response analysis and reporting',
        examples: 'SGC HR Feedback, Assessment Surveys'
    },
    {
        id: 'award-nominations',
        num: 9,
        name: 'Award Nominations',
        icon: 'bi-trophy',
        category: 'Specialized',
        description: 'Expandable nomination details with category badges and voting.',
        bestFor: 'Employee recognition and award programs',
        examples: 'Staff Awards, Faculty Recognition'
    },
    {
        id: 'committee-voting',
        num: 10,
        name: 'Committee Voting',
        icon: 'bi-people',
        category: 'Specialized',
        description: 'Named voter columns, document preview, vote buttons, and toast notifications.',
        bestFor: 'Committee decisions on appeals or applications',
        examples: 'Visa Committee, Appeals Board, PD Appeals'
    },
    {
        id: 'cards-dashboard',
        num: 11,
        name: 'Executive Cards',
        icon: 'bi-grid-1x2-fill',
        category: 'Specialized',
        description: 'Donut chart, progress bars, alert panel, and responsive card grid layout.',
        bestFor: 'Executive-level tracking with visual metrics',
        examples: 'Strategic Plan Tracking, Project Portfolio, Initiative Dashboard'
    },
    {
        id: 'bulk-actions',
        num: 12,
        name: 'IT Equipment Review',
        icon: 'bi-pc-display',
        category: 'Advanced',
        description: 'Bulk checkboxes, approve/deny/reassign, row action menus, and export selected.',
        bestFor: 'Approval queues with bulk operations',
        examples: 'IT Equipment Requests, Procurement Reviews'
    }
];

// ============================================================================
// DRAFT SAVING (localStorage)
// ============================================================================

const DRAFT_KEY = 'dashboardBuilderDraft';
const DRAFT_SAVE_DELAY = 500; // ms debounce
let saveTimeout = null;

function saveDraft() {
    // Debounce saves
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const draft = Object.assign({}, State, {
            savedAt: new Date().toISOString()
        });
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            showDraftIndicator('saved');
        } catch (e) {
            console.warn('Could not save draft:', e);
        }
    }, DRAFT_SAVE_DELAY);
}

function loadDraft() {
    try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (!saved) return null;
        return JSON.parse(saved);
    } catch (e) {
        console.warn('Could not load draft:', e);
        return null;
    }
}

function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
        console.warn('Could not clear draft:', e);
    }
}

function restoreDraft(draft) {
    // Restore all state properties
    State.mode = draft.mode;
    State.currentStep = draft.currentStep || 0;
    State.advancedMode = draft.advancedMode || false;
    State.dashboardTitle = draft.dashboardTitle || '';
    State.sourceName = draft.sourceName || '';
    State.selectedStyle = draft.selectedStyle || null;
    State.selectedArea = draft.selectedArea;
    State.selectedDocTypes = draft.selectedDocTypes || [];
    State.selectedFields = draft.selectedFields || [];
    State.selectedTemplate = draft.selectedTemplate;
    State.selectedInputIds = draft.selectedInputIds || [];
    State.selectedWorkflowSteps = draft.selectedWorkflowSteps || [];
    State.swimlanes = draft.swimlanes || [];
    State.customSQL = draft.customSQL;
    if (draft.styleConfig) {
        Object.assign(State.styleConfig, draft.styleConfig);
    }
}

function showDraftIndicator(status) {
    let indicator = document.getElementById('draftIndicator');
    if (!indicator) return;

    if (status === 'saved') {
        indicator.innerHTML = '<i class="bi bi-cloud-check"></i> Draft saved';
        indicator.className = 'draft-indicator saved';
    } else if (status === 'restored') {
        indicator.innerHTML = '<i class="bi bi-cloud-download"></i> Draft restored';
        indicator.className = 'draft-indicator restored';
    }

    // Fade out after a moment
    indicator.style.opacity = '1';
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

function formatDraftTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    return date.toLocaleDateString();
}

// Check for draft on page load
function checkForDraft() {
    const draft = loadDraft();
    if (draft && draft.mode) {
        showDraftModal(draft);
    }
}

function showDraftModal(draft) {
    const timeAgo = formatDraftTime(draft.savedAt);
    const title = draft.dashboardTitle || 'Untitled';
    const modeLabel = draft.mode === 'content' ? 'Document' : draft.mode === 'forms' ? 'Form' : 'Combined';

    const modal = document.createElement('div');
    modal.id = 'draftModal';
    modal.className = 'draft-modal';
    modal.innerHTML = `
        <div class="draft-modal-content">
            <div class="draft-modal-icon">
                <i class="bi bi-file-earmark-text"></i>
            </div>
            <h3>Continue where you left off?</h3>
            <p>You have an unsaved draft from <strong>${escapeHtml(timeAgo)}</strong></p>
            <div class="draft-preview">
                <div><strong>Name:</strong> ${escapeHtml(title)}</div>
                <div><strong>Type:</strong> ${escapeHtml(modeLabel)} Dashboard</div>
                <div><strong>Step:</strong> ${draft.currentStep + 1} of 6</div>
            </div>
            <div class="draft-modal-buttons">
                <button class="btn btn-secondary" onclick="discardDraft()">
                    <i class="bi bi-trash"></i> Start Fresh
                </button>
                <button class="btn btn-primary" onclick="continueDraft()">
                    <i class="bi bi-play-fill"></i> Continue
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Store draft for continueDraft()
    window._pendingDraft = draft;
}

function continueDraft() {
    const draft = window._pendingDraft;
    if (!draft) return;

    // Close modal
    const modal = document.getElementById('draftModal');
    if (modal) modal.remove();

    // Restore state
    restoreDraft(draft);

    // Apply mode theme
    applyModeTheme(State.mode);

    // Start wizard at saved step
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('stepContent').style.display = 'block';
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('cardFooter').style.display = 'flex';

    updateModeIndicator();
    renderProgress();
    renderStep();

    showDraftIndicator('restored');
}

function discardDraft() {
    clearDraft();
    window._pendingDraft = null;

    // Close modal
    const modal = document.getElementById('draftModal');
    if (modal) modal.remove();
}

// Initialize draft check on DOM ready
document.addEventListener('DOMContentLoaded', checkForDraft);

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

// Base step arrays — getSteps() inserts style + conditional steps dynamically
const ContentStepsBase = [
    { id: 'setup', title: 'Setup', icon: 'bi-gear' },
    // style step inserted here by getSteps()
    { id: 'area', title: 'Area', icon: 'bi-folder' },
    { id: 'docTypes', title: 'Documents', icon: 'bi-file-earmark' },
    { id: 'fields', title: 'Fields', icon: 'bi-list-ul' },
    // style-specific steps inserted here by getSteps()
    { id: 'swimlanes', title: 'Groups', icon: 'bi-layout-three-columns' },
    { id: 'generate', title: 'Finish', icon: 'bi-download' }
];

const FormsStepsBase = [
    { id: 'setup', title: 'Setup', icon: 'bi-gear' },
    // style step inserted here
    { id: 'template', title: 'Template', icon: 'bi-ui-checks' },
    { id: 'fields', title: 'Fields', icon: 'bi-input-cursor-text' },
    { id: 'workflow', title: 'Workflow', icon: 'bi-diagram-3' },
    // style-specific steps inserted here
    { id: 'swimlanes', title: 'Groups', icon: 'bi-layout-three-columns' },
    { id: 'generate', title: 'Finish', icon: 'bi-download' }
];

const CombinedStepsBase = [
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
const StyleExtraSteps = {
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

function selectMode(mode, e) {
    State.mode = mode;

    // Apply mode-specific theme to body
    applyModeTheme(mode);

    // Highlight selected card
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('selected');
    }

    // Short delay for visual feedback
    setTimeout(() => {
        startWizard();
    }, 300);

    saveDraft();
}

function applyModeTheme(mode) {
    // Remove all mode classes
    document.body.classList.remove('mode-content', 'mode-forms', 'mode-combined');

    // Add the appropriate mode class
    if (mode) {
        document.body.classList.add('mode-' + mode);
    }

    // Persist theme choice in cookie
    setThemeCookie(mode);
}

// Handle keyboard activation for mode cards (accessibility)
function handleModeKeydown(e, mode) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMode(mode, e);
    }
}

function resetWizard() {
    // Reset all state
    State.mode = null;
    State.currentStep = 0;
    State.advancedMode = false;
    State.dashboardTitle = '';
    State.sourceName = '';
    State.selectedStyle = null;
    State.selectedArea = null;
    State.selectedDocTypes = [];
    State.selectedFields = [];
    State.selectedTemplate = null;
    State.selectedInputIds = [];
    State.selectedWorkflowSteps = [];
    State.swimlanes = [];
    State.customSQL = null;
    State.styleConfig = {
        detailFields: [], nameField: null, alphaRanges: [['A','H'],['I','P'],['Q','Z']],
        filterChips: ['All','High Priority','30+ Days','60+ Days'],
        ageBadgeWarning: 30, ageBadgeCritical: 60, workflowActions: {},
        ratingField: null, commentField: null, departmentField: null,
        committeeMembers: [{name:'Member A',color:'#e8f5e9'},{name:'Member B',color:'#e3f2fd'},{name:'Member C',color:'#fff3e0'}],
        cardTitleField: null, cardStatusField: null, cardLeadField: null, cardBudgetField: null,
        reassignTargets: ['Get Quotes','Vendor Review','Budget Approval','Supervisor Approval','Procurement']
    };

    // Clear saved draft
    clearDraft();

    // Clear mode theme
    applyModeTheme(null);

    // Reset UI
    document.getElementById('modeSelection').style.display = 'block';
    document.getElementById('stepContent').style.display = 'none';
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('cardFooter').style.display = 'none';
    document.getElementById('modeIndicator').innerHTML = '';

    // Reset header
    document.getElementById('cardHeader').innerHTML = `
        <h2><i class="bi bi-magic"></i> Welcome to Dashboard Builder</h2>
        <p>Create custom dashboards in minutes - no coding required</p>
    `;

    // Clear selected mode cards
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
}

function startWizard() {
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('stepContent').style.display = 'block';
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('cardFooter').style.display = 'flex';

    // Show mode indicator
    updateModeIndicator();

    State.currentStep = 0;
    renderProgress();
    renderStep();
}

function updateModeIndicator() {
    const indicator = document.getElementById('modeIndicator');
    const modeLabels = {
        'content': { label: 'Document Dashboard', icon: 'bi-file-earmark-text-fill', class: 'content-mode', desc: 'Browse & manage documents' },
        'forms': { label: 'Forms Dashboard', icon: 'bi-ui-checks-grid', class: 'forms-mode', desc: 'Track form submissions' },
        'combined': { label: 'Combined Dashboard', icon: 'bi-stack', class: 'combined-mode', desc: 'Documents + Forms' }
    };

    const mode = modeLabels[State.mode] || modeLabels['content'];
    indicator.innerHTML = `<span class="mode-indicator ${escapeHtml(mode.class)}"><i class="bi ${escapeHtml(mode.icon)}"></i> ${escapeHtml(mode.label)}</span>`;
}

// ============================================================================
// NAVIGATION
// ============================================================================

function getSteps() {
    let base;
    if (State.mode === 'content') base = ContentStepsBase;
    else if (State.mode === 'forms') base = FormsStepsBase;
    else if (State.mode === 'combined') base = CombinedStepsBase;
    else base = ContentStepsBase;

    // Clone the base array
    let steps = base.map(s => Object.assign({}, s));

    // Insert style step after setup (index 1)
    const styleStep = { id: 'style', title: 'Style', icon: 'bi-palette' };
    steps.splice(1, 0, styleStep);

    // Insert style-specific steps before swimlanes (if a style is selected)
    if (State.selectedStyle) {
        const extra = StyleExtraSteps[State.selectedStyle] || [];
        if (extra.length > 0) {
            const swimIdx = steps.findIndex(s => s.id === 'swimlanes');
            if (swimIdx >= 0) {
                var extraCloned = extra.map(s => Object.assign({}, s));
                steps.splice.apply(steps, [swimIdx, 0].concat(extraCloned));
            }
        }
    }

    return steps;
}

function nextStep() {
    const steps = getSteps();

    // Validate current step before advancing
    const step = steps[State.currentStep];
    if (step) {
        if (step.id === 'area' && !State.selectedArea) {
            showToast('Please select a folder before continuing.', 'warning');
            return;
        }
        if (step.id === 'docTypes' && State.selectedDocTypes.length === 0) {
            showToast('Please select at least one document type.', 'warning');
            return;
        }
        if (step.id === 'template' && !State.selectedTemplate) {
            showToast('Please select a form template before continuing.', 'warning');
            return;
        }
        if (step.id === 'fields' && State.selectedFields.length === 0) {
            showToast('Please select at least one field.', 'warning');
            return;
        }
        if (step.id === 'formFields' && State.selectedInputIds.length === 0) {
            showToast('Please select at least one form field.', 'warning');
            return;
        }
    }

    if (State.currentStep < steps.length - 1) {
        State.currentStep++;
        // Clamp to array bounds (safety for style-change step count shifts)
        if (State.currentStep >= steps.length) {
            State.currentStep = steps.length - 1;
        }
        renderProgress();
        renderStep();
        saveDraft();
    }
}

function prevStep() {
    if (State.currentStep > 0) {
        State.currentStep--;
        renderProgress();
        renderStep();
        saveDraft();
    }
}

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
                <i class="bi bi-download"></i> Download Dashboard
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

        <div class="advanced-toggle">
            <label>
                <input type="checkbox" ${State.advancedMode ? 'checked' : ''} onchange="toggleAdvancedMode(this.checked)">
                <span>Advanced Mode</span>
            </label>
            <span class="badge-advanced">Power User</span>
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
    fieldId = Number(fieldId);
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
                        <span>—</span>
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

function selectArea(areaId) {
    State.selectedArea = SimulatedData.areas.find(a => a.id === areaId);
    State.selectedDocTypes = []; // Reset doc types when area changes
    State.selectedFields = [];
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

function selectTemplate(id) {
    State.selectedTemplate = SimulatedData.formTemplates.find(t => t.id === id);
    State.selectedInputIds = [];
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
            ${fieldsHtml}
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
            ${inputsHtml}
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

// Resolve workflow steps from SimulatedData — works in both standalone (string keys) and Etrieve (numeric keys) mode
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

    const swimlanesHtml = State.swimlanes.map((sl, idx) => {
        // Build filter tags display
        const filterTags = sl.filters.map((f, fIdx) => `
            <span class="filter-tag">
                <strong>${escapeHtml(f.fieldName)}:</strong> ${f.values.map(v => escapeHtml(v)).join(', ')}
                <span class="remove-filter" onclick="event.stopPropagation(); removeFilter(${idx}, ${fIdx})">
                    <i class="bi bi-x"></i>
                </span>
            </span>
        `).join('');

        return `
            <div class="swimlane-config" data-index="${idx}">
                <div class="swimlane-header" draggable="true"
                     ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)" ondragend="dragEnd(event)">
                    <span class="drag-handle"><i class="bi bi-grip-vertical"></i></span>
                    <input type="text" class="swimlane-name" value="${escapeHtml(sl.name)}"
                           onchange="updateSwimlaneName(${idx}, this.value)" onclick="event.stopPropagation()">
                    <span class="delete-btn" onclick="deleteSwimlane(${idx})" title="Delete group">
                        <i class="bi bi-trash"></i>
                    </span>
                </div>
                <div class="swimlane-filters">
                    <div class="filter-label">
                        <i class="bi bi-funnel"></i> Show items where:
                    </div>
                    ${sl.filters.length > 0 ? `
                        <div class="filter-tags">
                            ${filterTags}
                        </div>
                    ` : `
                        <div class="no-filters">No filters - shows all items</div>
                    `}
                    <button class="add-filter-btn" onclick="openFilterModal(${idx})">
                        <i class="bi bi-plus-circle"></i> Add Filter
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="step-description">
            <p><i class="bi bi-layout-three-columns" style="color:var(--accent);margin-right:8px;"></i>
            Create groups to organize your dashboard. Each group can filter by field values.</p>
        </div>

        <div class="swimlane-list" id="swimlaneList">
            ${swimlanesHtml}
        </div>

        <button class="btn btn-secondary" onclick="addSwimlane()" style="margin-top:15px;">
            <i class="bi bi-plus-lg"></i> Add Another Group
        </button>

        ${filterableFields.length === 0 ? `
            <div class="info-box" style="margin-top:25px;background:rgba(255,193,7,0.1);border-color:#ffc107;">
                <h4><i class="bi bi-exclamation-triangle" style="color:#856404;"></i> No Filterable Fields</h4>
                <p style="color:#856404;">Go back and select fields that have predefined values (like Status, Term, etc.) to enable filtering.</p>
            </div>
        ` : `
            <div class="info-box" style="margin-top:25px;">
                <h4><i class="bi bi-lightbulb"></i> How Filters Work</h4>
                <p>Each group shows items matching its filters. For example:<br>
                <strong>"Pending Review"</strong> → FA Status = "Pending Review" or "Under Review"<br>
                <strong>"Completed"</strong> → FA Status = "Approved" or "Denied"</p>
            </div>
        `}

        <!-- Filter Modal -->
        <div id="filterModal" class="filter-modal" style="display:none;">
            <div class="filter-modal-content">
                <div class="filter-modal-header">
                    <h4><i class="bi bi-funnel"></i> Add Filter</h4>
                    <button class="close-modal" onclick="closeFilterModal()">&times;</button>
                </div>
                <div class="filter-modal-body">
                    <div class="form-group">
                        <label>Filter by Field:</label>
                        <select id="filterFieldSelect" onchange="updateFilterValues()">
                            <option value="">Select a field...</option>
                            ${filterableFields.map(f => `
                                <option value="${escapeHtml(f.id)}" data-values="${escapeHtml(JSON.stringify(f.values))}">${escapeHtml(f.name)}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="filterValuesGroup" style="display:none;">
                        <label>Include items matching ANY of these values:</label>
                        <div id="filterValuesContainer" class="filter-values-grid"></div>
                    </div>
                </div>
                <div class="filter-modal-footer">
                    <button class="btn btn-secondary" onclick="closeFilterModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="applyFilter()" id="applyFilterBtn" disabled>
                        <i class="bi bi-check"></i> Apply Filter
                    </button>
                </div>
            </div>
        </div>
    `;
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
}

function closeFilterModal() {
    var el = document.getElementById('filterModal');
    if (el) el.style.display = 'none';
    currentFilterSwimlaneIdx = null;
    selectedFilterValues = [];
}

// Global Escape key handler — closes any open modal
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

    if (!option.value) {
        valuesGroup.style.display = 'none';
        return;
    }

    const values = JSON.parse(option.dataset.values || '[]');
    selectedFilterValues = [];

    valuesContainer.innerHTML = values.map(v => `
        <label class="filter-value-item">
            <input type="checkbox" value="${escapeHtml(v)}" onchange="toggleFilterValue('${escapeJS(v)}')">
            <span>${escapeHtml(v)}</span>
        </label>
    `).join('');

    valuesGroup.style.display = 'block';
    document.getElementById('applyFilterBtn').disabled = true;
}

function toggleFilterValue(value) {
    const idx = selectedFilterValues.indexOf(value);
    if (idx === -1) {
        selectedFilterValues.push(value);
    } else {
        selectedFilterValues.splice(idx, 1);
    }
    document.getElementById('applyFilterBtn').disabled = selectedFilterValues.length === 0;
}

function applyFilter() {
    if (currentFilterSwimlaneIdx === null || selectedFilterValues.length === 0) return;

    const select = document.getElementById('filterFieldSelect');
    const option = select.options[select.selectedIndex];
    const fieldId = option.value;
    const fieldName = option.text;

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
        // Reorder the array — adjust target index after removal
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
                    <li>Click <strong>Download Dashboard</strong> below</li>
                    <li>Create Source in Etrieve Central: <code>${escapeHtml(State.sourceName)}</code></li>
                    <li>Paste your SQL query into the Source</li>
                    <li>Upload the dashboard files</li>
                </ol>
            </div>

            <div class="advanced-toggle" style="margin-top:20px;">
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
                <li>Click <strong>Download Dashboard</strong> below to get your files</li>
                <li>Email the ZIP to your Etrieve administrator</li>
                <li>They'll create a source named <code>${escapeHtml(State.sourceName || 'your dashboard name')}</code> and upload the files</li>
                <li>Your dashboard will be ready in Etrieve Central</li>
            </ol>
        </div>

        <div class="advanced-toggle" style="margin-top:20px;">
            <label>
                <input type="checkbox" ${State.advancedMode ? 'checked' : ''} onchange="toggleAdvancedMode(this.checked)">
                <span>Advanced Mode</span>
            </label>
            <span class="badge-advanced">Power User</span>
        </div>
    `;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Escape strings for SQL single-quote literals (prevents SQL injection in generated queries)
function escapeSQL(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

// Escape strings for JavaScript output (prevents code injection in generated files)
function escapeJS(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/\n/g, '\\n').replace(/\r/g, '');
}

// Toast notification for the wizard UI
function showToast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast-notification' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : type === 'warning' ? ' toast-warning' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add('show'); }, 10);
    setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 3000);
}

function resetSQL() {
    State.customSQL = null;
    renderStep();
}

function copySQL(e) {
    const sql = State.customSQL || generateSQL();
    navigator.clipboard.writeText(sql).then(() => {
        // Visual feedback
        const btn = e ? e.target.closest('button') : document.querySelector('.editor-toolbar button[onclick*="copySQL"]');
        if (!btn) return;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        btn.classList.add('active');
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('active');
        }, 2000);
    }).catch(() => {
        showToast('Failed to copy — try selecting and copying manually.', 'error');
    });
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
        if (f.type === 'date') {
            return `   [${f.alias}].DATE AS [${f.alias}]`;
        }
        return `   [${f.alias}].text AS [${f.alias}]`;
    }).join(',\n');

    let fieldJoins = selectedFields.map(f => {
        const table = f.type === 'date' ? 'ivDocumentDateFieldValue' : 'ivDocumentTextFieldValue';
        return `LEFT JOIN dbo.${table} AS [${f.alias}]
   ON Document.DocumentID = [${f.alias}].DocumentID
   AND [${f.alias}].FieldID = ${parseInt(f.id, 10)}  -- ${escapeSQL(f.name)}`;
    }).join('\n');

    // Generate swimlane configuration comments
    const swimlaneConfig = generateSwimlaneConfig();

    return `-- ${escapeSQL(State.dashboardTitle || 'Content Dashboard')}
-- Source: ${escapeSQL(State.sourceName || 'ContentSource')}
-- Generated by Dashboard Builder v3.0
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
                config += `--   Filter: ${f.fieldName} IN (${f.values.map(v => `'${escapeSQL(v)}'`).join(', ')})\n`;
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
        const alias = inp.label.replace(/[^A-Za-z0-9]/g, '');
        return `   MAX(CASE WHEN iv.InputID = '${escapeSQL(inp.id)}' THEN iv.Value END) AS [${escapeSQL(inp.label)}]`;
    }).join(',\n');

    const hasWorkflow = State.selectedWorkflowSteps.length > 0;

    // Generate swimlane configuration comments
    const swimlaneConfig = generateSwimlaneConfig();

    let sql = `-- ${escapeSQL(State.dashboardTitle || 'Forms Dashboard')}
-- Source: ${escapeSQL(State.sourceName || 'FormsSource')}
-- Template: ${escapeSQL((template && template.name) || 'Form')} (ID: ${parseInt((template && template.id), 10) || 'XXX'})
-- Generated by Dashboard Builder v3.0
${swimlaneConfig}
SELECT
   f.FormID,
   f.Created AS SubmittedDate,
${fieldPivots || '   -- Add your field pivots here'}`;

    if (hasWorkflow) {
        sql += `,
   ps.Name AS CurrentStepName`;
    }

    sql += `
FROM reporting.central_forms_Form f
LEFT JOIN reporting.central_forms_InputValue iv
   ON f.FormID = iv.FormID`;

    if (hasWorkflow) {
        sql += `
LEFT JOIN reporting.central_flow_PackageDocument pd
   ON pd.SourceID = CAST(f.FormID AS VARCHAR(50))
LEFT JOIN reporting.central_flow_TaskQueue tq
   ON tq.PackageId = pd.PackageID
LEFT JOIN reporting.central_flow_ProcessStep ps
   ON tq.ProcessStepID = ps.ProcessStepId`;
    }

    sql += `
WHERE f.TemplateVersionID = ${parseInt((template && template.id), 10) || 'XXX'}
   AND f.IsDraft = 0
GROUP BY f.FormID, f.Created${hasWorkflow ? ', ps.Name' : ''}
ORDER BY f.Created DESC`;

    return sql;
}

function generateCombinedSQL() {
    // Combined mode generates BOTH document and forms queries with a UNION
    const area = State.selectedArea;
    const docTypes = SimulatedData.documentTypes[(area && area.id)] || [];
    const selectedDocs = docTypes.filter(d => State.selectedDocTypes.includes(d.id));
    const docFields = SimulatedData.keyFields[(area && area.id)] || [];
    const selectedDocFields = docFields.filter(f => State.selectedFields.includes(f.id));

    const template = State.selectedTemplate;
    const formInputs = SimulatedData.formInputIds[(template && template.id)] || [];
    const selectedFormInputs = formInputs.filter(i => State.selectedInputIds.includes(i.id));

    const hasWorkflow = State.selectedWorkflowSteps.length > 0;
    const swimlaneConfig = generateSwimlaneConfig();

    // Build document portion
    const docTypeList = selectedDocs.map(d => `'${escapeSQL(d.name)}'`).join(', ');

    let docFieldSelects = selectedDocFields.slice(0, 3).map((f, idx) => {
        if (f.type === 'date') {
            return `CAST([${f.alias}].DATE AS VARCHAR(50)) AS Field${idx + 1}`;
        }
        return `[${f.alias}].text AS Field${idx + 1}`;
    }).join(',\n       ');

    let docFieldJoins = selectedDocFields.slice(0, 3).map(f => {
        const table = f.type === 'date' ? 'ivDocumentDateFieldValue' : 'ivDocumentTextFieldValue';
        return `LEFT JOIN dbo.${table} AS [${f.alias}]
   ON Document.DocumentID = [${f.alias}].DocumentID AND [${f.alias}].FieldID = ${parseInt(f.id, 10)}`;
    }).join('\n');

    // Build form portion
    let formFieldSelects = selectedFormInputs.slice(0, 3).map((inp, idx) => {
        return `MAX(CASE WHEN iv.InputID = '${escapeSQL(inp.id)}' THEN iv.Value END) AS Field${idx + 1}`;
    }).join(',\n       ');

    let sql = `-- ${escapeSQL(State.dashboardTitle || 'Combined Dashboard')}
-- Source: ${escapeSQL(State.sourceName || 'CombinedSource')}
-- Type: Combined (Documents + Forms)
-- Generated by Dashboard Builder v3.0
${swimlaneConfig}
-- ==================== DOCUMENTS ====================
SELECT
   'Document' AS RecordType,
   CAST(Document.DocumentID AS VARCHAR(50)) AS RecordID,
   DocumentType.[Name] AS Category,
   ${docFieldSelects || "'' AS Field1, '' AS Field2, '' AS Field3"},
   '/#areaId=' + CAST(Node.CatalogID AS VARCHAR) +
   '&NodeId=' + CAST(Node.NodeID AS VARCHAR) +
   '&DocumentId=' + CAST(Document.DocumentID AS VARCHAR) AS url
FROM dbo.DocumentType
INNER JOIN dbo.Document
   ON DocumentType.DocumentTypeID = Document.DocumentTypeID
   AND Document.DocumentID NOT IN (SELECT DocumentID FROM dbo.RecycleBin)
   AND DocumentType.[Name] IN (${docTypeList || "'YourDocType'"})
INNER JOIN dbo.Node
   ON Document.DocumentID = Node.DocumentID
   AND Node.CatalogID = ${(area && area.id) || 2}
${docFieldJoins}

UNION ALL

-- ==================== FORMS ====================
SELECT
   'Form' AS RecordType,
   CAST(f.FormID AS VARCHAR(50)) AS RecordID,
   '${escapeSQL((template && template.name) || 'Form')}' AS Category,
   ${formFieldSelects || "'' AS Field1, '' AS Field2, '' AS Field3"},
   '/forms/' + CAST(f.FormID AS VARCHAR) AS url
FROM reporting.central_forms_Form f
LEFT JOIN reporting.central_forms_InputValue iv
   ON f.FormID = iv.FormID
WHERE f.TemplateVersionID = ${parseInt((template && template.id), 10) || 'XXX'}
   AND f.IsDraft = 0
GROUP BY f.FormID

ORDER BY RecordType, RecordID DESC`;

    return sql;
}

function highlightSQL(sql) {
    // Simple SQL syntax highlighting
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT', 'INNER', 'OUTER', 'JOIN', 'ON',
                      'AS', 'IN', 'NOT', 'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'CASE', 'WHEN',
                      'THEN', 'END', 'MAX', 'MIN', 'COUNT', 'SUM', 'CAST', 'VARCHAR', 'INT', 'DESC', 'ASC'];

    let highlighted = sql;

    // Escape HTML
    highlighted = highlighted.replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

function showDownloadModal(files) {
    // Show a modal with file contents that users can copy
    const modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.className = 'draft-modal';

    // Build tab buttons without inline onclick (CSP-safe)
    var tabsHtml = Object.keys(files).map(function(filename, idx) {
        return '<button class="file-tab' + (idx === 0 ? ' active' : '') + '" data-file="' + escapeHtml(filename) + '">' +
               '<i class="bi bi-file-code"></i> ' + escapeHtml(filename) + '</button>';
    }).join('');

    // Build initial content using first file
    var firstFile = Object.keys(files)[0];
    var initialContent = '<pre style="margin:0;padding:20px;background:#1e1e1e;color:#d4d4d4;font-family:Consolas,monospace;font-size:0.85rem;height:100%;overflow:auto;">' + escapeHtml(files[firstFile]) + '</pre>';

    modal.innerHTML =
        '<div class="draft-modal-content" style="max-width:800px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">' +
            '<div style="padding:25px 30px;border-bottom:1px solid #e9ecef;">' +
                '<h3 style="margin:0 0 10px;display:flex;align-items:center;gap:10px;">' +
                    '<i class="bi bi-file-earmark-zip" style="color:var(--primary);"></i>' +
                    'Dashboard Files Generated' +
                '</h3>' +
                '<p style="margin:0;color:#666;">Click each file tab to view and copy its contents.</p>' +
            '</div>' +
            '<div class="file-tabs-bar" style="display:flex;border-bottom:1px solid #e9ecef;overflow-x:auto;">' +
                tabsHtml +
            '</div>' +
            '<div style="flex:1;overflow:auto;padding:0;">' +
                '<div id="fileContentArea" style="height:100%;">' + initialContent + '</div>' +
            '</div>' +
            '<div style="padding:15px 25px;border-top:1px solid #e9ecef;display:flex;gap:12px;justify-content:flex-end;background:#f8f9fa;">' +
                '<button class="btn btn-secondary" id="copyFileBtn">' +
                    '<i class="bi bi-clipboard"></i> Copy Current File' +
                '</button>' +
                '<button class="btn btn-primary" id="doneBtn">' +
                    '<i class="bi bi-check-lg"></i> Done' +
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

    // Done button handler
    modal.querySelector('#doneBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        closeDownloadModal();
    });

    // Close on backdrop click (clicking the dark overlay, not the content)
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDownloadModal();
        }
    });

    // Escape key handled by global keydown listener (see closeFilterModal)
}

function showFileContent(filename) {
    var files = window._downloadFiles;
    if (!files || !files[filename]) return;

    window._currentFile = filename;

    // Update tabs — scope to download modal only
    var modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.querySelectorAll('.file-tab').forEach(function(tab) {
        tab.classList.toggle('active', tab.dataset.file === filename);
    });

    // Update content using string concatenation (avoids template literal issues with file content)
    var contentArea = document.getElementById('fileContentArea');
    if (contentArea) {
        contentArea.innerHTML = '<pre style="margin:0;padding:20px;background:#1e1e1e;color:#d4d4d4;font-family:Consolas,monospace;font-size:0.85rem;height:100%;overflow:auto;">' + escapeHtml(files[filename]) + '</pre>';
    }
}

function copyCurrentFile(e) {
    var files = window._downloadFiles;
    var filename = window._currentFile;
    if (!files || !filename) return;

    navigator.clipboard.writeText(files[filename]).then(function() {
        // Visual feedback
        var btn = e ? e.target.closest('button') : document.getElementById('copyFileBtn');
        if (!btn) return;
        var originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        setTimeout(function() {
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(function() {
        showToast('Failed to copy — try selecting and copying manually.', 'error');
    });
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) modal.remove();
    window._downloadFiles = null;
    window._currentFile = null;
}

// generateDashboardFiles(), generateConfigJS() are defined in wizard-generators.js
// (which overrides these via function declaration hoisting when loaded second)

function generateColumnDefinitions() {
    const columns = [];

    if (State.mode === 'content') {
        const fields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        fields.filter(f => State.selectedFields.includes(f.id)).forEach(f => {
            columns.push(`        { field: '${escapeJS(f.alias)}', label: '${escapeJS(f.name)}', type: '${escapeJS(f.type)}' }`);
        });
    } else if (State.mode === 'forms') {
        const inputs = SimulatedData.formInputIds[(State.selectedTemplate && State.selectedTemplate.id)] || [];
        inputs.filter(i => State.selectedInputIds.includes(i.id)).forEach(i => {
            columns.push(`        { field: '${escapeJS(i.id)}', label: '${escapeJS(i.label)}', type: 'text' }`);
        });
    } else if (State.mode === 'combined') {
        // Combined mode: add both document fields and form fields
        columns.push(`        { field: 'RecordType', label: 'Type', type: 'text' }`);
        columns.push(`        { field: 'Category', label: 'Category', type: 'text' }`);

        const docFields = SimulatedData.keyFields[(State.selectedArea && State.selectedArea.id)] || [];
        docFields.filter(f => State.selectedFields.includes(f.id)).slice(0, 3).forEach((f, idx) => {
            columns.push(`        { field: 'Field${idx + 1}', label: '${escapeJS(f.name)}', type: '${escapeJS(f.type)}' }`);
        });
    }

    return columns.join(',\n');
}

// generateViewModelJS(), generateIndexHTML(), generateReadme() are defined in wizard-generators.js
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
                ${columns.map(col => `<td>${escapeHtml(row[col] || '—')}</td>`).join('')}
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
    define('template/wizard-demo', [], function() {
        return { loaded: true };
    });
}
