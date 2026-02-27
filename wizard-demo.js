/**
 * Dashboard Builder Wizard - Webinar Demo
 * Simulated API responses for demonstration purposes
 */

// ============================================================================
// VERSION TRACKING (single source of truth)
// ============================================================================
var WIZARD_VERSION = '3.2.0';
var WIZARD_BUILD_DATE = '2026-02-27';

// Changelog (newest first)
// 3.2.0 (2026-02-27) - Split SQL generators into wizard-sql.js to bypass Cloudflare WAF blocking on upload
// 3.1.0 (2026-02-25) - Version tracking system; version stamped in generated files and all console logs
// 3.0.2 (2026-02-25) - Combined mode: split into two integration sources (content + forms); fix column names
// 3.0.1 (2026-02-24) - Forms mode: field filtering fix; Document mode: filterable fields; Current Workflow Step column
// 3.0.0 (2026-02-23) - Initial Dashboard Builder Wizard 3.0 release

console.log('Dashboard Builder Wizard v' + WIZARD_VERSION + ' (' + WIZARD_BUILD_DATE + ') loaded');

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

var State = {
    mode: null,
    currentStep: 0,
    advancedMode: false,

    // Dashboard info
    dashboardTitle: '',
    sourceName: '',
    centralUrl: '',
    contentUrl: '',

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
    },

    // Security-first access control
    // When enabled, data is only loaded if the user belongs to the power group.
    // Non-power users get a filtered integration call (per-swimlane) so unauthorized
    // data never reaches the browser.
    securityConfig: {
        enabled: false,
        powerGroupId: '',     // Azure AD group ID for supervisors/power users
        powerGroupName: '',   // Display name for the group
        swimlaneGroups: []    // Array of { swimlaneName, groupId, groupName }
    }
};

// ============================================================================
// STYLE DEFINITIONS
// ============================================================================

var DashboardStyles = [
    {
        id: 'simple-status',
        num: 1,
        name: 'Simple Status',
        icon: 'bi-check-circle',
        category: 'Basic',
        description: 'Collapsible swimlanes organized by status progression.',
        bestFor: 'Linear workflows: Received -> In Progress -> Complete',
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

var DRAFT_KEY = 'dashboardBuilderDraft';
var DRAFT_SAVE_DELAY = 500; // ms debounce
var saveTimeout = null;

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
            if (e && e.name === 'QuotaExceededError') {
                showToast('Draft save failed: browser storage full. Try clearing old drafts.', 'warning');
            }
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
    State.centralUrl = draft.centralUrl || draft.baseUrl || '';
    State.contentUrl = draft.contentUrl || '';
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
    if (draft.securityConfig) {
        Object.assign(State.securityConfig, draft.securityConfig);
    }

    // Migrate old drafts: backfill missing sqlAlias on swimlane filters
    // Known field name → SQL alias mappings (for when SimulatedData isn't loaded yet)
    var knownAliases = {
        'Current Workflow Step': 'CurrentStepName',
        'Document Type': 'DocumentType',
        'Category': 'Category',
        'Record Type': 'RecordType'
    };
    if (State.swimlanes) {
        State.swimlanes.forEach(function(sl) {
            if (sl.filters) {
                sl.filters.forEach(function(f) {
                    if (!f.sqlAlias && f.fieldName) {
                        // Use known mapping first, then try live fields, then fall back
                        if (knownAliases[f.fieldName]) {
                            f.sqlAlias = knownAliases[f.fieldName];
                        } else {
                            try {
                                var fields = getFilterableFields();
                                var match = fields.find(function(ff) { return ff.name === f.fieldName || String(ff.id) === String(f.fieldId); });
                                f.sqlAlias = match ? (match.sqlAlias || match.name) : f.fieldName;
                            } catch (e) {
                                f.sqlAlias = f.fieldName;
                            }
                        }
                    }
                });
            }
        });
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
    if (isNaN(date.getTime())) return 'unknown time';
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
    if (document.getElementById('draftModal')) return; // prevent duplicate modals
    const timeAgo = formatDraftTime(draft.savedAt);
    const title = draft.dashboardTitle || 'Untitled';
    const modeLabel = draft.mode === 'content' ? 'Document' : draft.mode === 'forms' ? 'Form' : 'Combined';

    // Compute actual step count by temporarily restoring mode/style
    var savedMode = State.mode, savedStyle = State.selectedStyle;
    State.mode = draft.mode;
    State.selectedStyle = draft.selectedStyle || null;
    var totalSteps = (typeof getSteps === 'function') ? getSteps().length : '?';
    State.mode = savedMode;
    State.selectedStyle = savedStyle;

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
                <div><strong>Step:</strong> ${Math.min(draft.currentStep + 1, totalSteps)} of ${totalSteps}</div>
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

    // Reload data for draft selections.
    // In Etrieve mode, formInputIds/docTypes are fetched on demand via
    // selectTemplate()/selectArea(), but drafts restore State without
    // triggering those fetches. Call them with keepSelections=true so
    // the restored selectedInputIds/selectedFields are preserved.
    if (State.selectedTemplate && (State.mode === 'forms' || State.mode === 'combined')) {
        var formData = SimulatedData.formInputIds[State.selectedTemplate.id];
        if (!formData || formData.length === 0) {
            selectTemplate(State.selectedTemplate.id, true);
        }
    }

    if (State.selectedArea && (State.mode === 'content' || State.mode === 'combined')) {
        var docData = SimulatedData.documentTypes[State.selectedArea.id];
        if (!docData || docData.length === 0) {
            selectArea(State.selectedArea.id, true);
        }
    }

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
    // Confirm if user has made progress
    if (State.mode && State.currentStep > 0) {
        if (!confirm('Start over? All your current selections will be lost.')) {
            return;
        }
    }

    // Reset all state
    State.mode = null;
    State.currentStep = 0;
    State.advancedMode = false;
    State.dashboardTitle = '';
    State.sourceName = '';
    State.centralUrl = '';
    State.contentUrl = '';
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
    State.securityConfig = {
        enabled: false, powerGroupId: '', powerGroupName: '', swimlaneGroups: []
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
        <p>Build powerful Softdocs dashboards without writing SQL from scratch</p>
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

    // Insert security step between swimlanes and generate (always available)
    const genIdx = steps.findIndex(s => s.id === 'generate');
    if (genIdx >= 0) {
        steps.splice(genIdx, 0, { id: 'securityConfig', title: 'Security', icon: 'bi-shield-lock' });
    }

    return steps;
}

function nextStep() {
    const steps = getSteps();

    // Validate current step before advancing
    const step = steps[State.currentStep];
    if (step) {
        if (step.id === 'setup' && !State.dashboardTitle.trim()) {
            showToast('Please enter a dashboard name before continuing.', 'warning');
            return;
        }
        if (step.id === 'setup') {
            if ((State.mode === 'forms' || State.mode === 'combined') && !State.centralUrl.trim()) {
                showToast('Please enter your Etrieve Central URL (e.g., https://yoursite.etrieve.cloud).', 'warning');
                return;
            }
            if ((State.mode === 'content' || State.mode === 'combined') && !State.contentUrl.trim()) {
                showToast('Please enter your Etrieve Content URL (e.g., https://yoursitecontent.etrieve.cloud).', 'warning');
                return;
            }
            if (State.centralUrl && !State.centralUrl.match(/^https?:\/\//i)) {
                showToast('Central URL must start with https:// (e.g., https://yoursite.etrieve.cloud).', 'warning');
                return;
            }
            if (State.contentUrl && !State.contentUrl.match(/^https?:\/\//i)) {
                showToast('Content URL must start with https:// (e.g., https://yoursitecontent.etrieve.cloud).', 'warning');
                return;
            }
        }
        if (step.id === 'style' && !State.selectedStyle) {
            showToast('Please select a dashboard style before continuing.', 'warning');
            return;
        }
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
        if (step.id === 'fields' && State.selectedFields.length === 0 && State.selectedInputIds.length === 0) {
            showToast('Please select at least one field.', 'warning');
            return;
        }
        if (step.id === 'formFields' && State.selectedInputIds.length === 0) {
            showToast('Please select at least one form field.', 'warning');
            return;
        }
        if (step.id === 'docFields' && State.selectedFields.length === 0) {
            showToast('Please select at least one document field.', 'warning');
            return;
        }
        if (step.id === 'swimlanes' && State.swimlanes.length === 0) {
            showToast('Please add at least one group before continuing.', 'warning');
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
    var steps = getSteps();
    if (State.currentStep >= steps.length) State.currentStep = steps.length - 1;
    if (State.currentStep > 0) {
        State.currentStep--;
        renderProgress();
        renderStep();
        saveDraft();
    }
}
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Escape strings for SQL single-quote literals (prevents SQL injection in generated queries)
function escapeSQL(str) {
    if (str == null) return '';
    if (typeof str === 'object') {
        // Guard against accidental object inputs (e.g., passing a filter object instead of string)
        console.warn('[escapeSQL] Received object instead of string:', str);
        return String(str).replace(/'/g, "''");
    }
    return String(str).replace(/'/g, "''");
}

// Escape strings for T-SQL bracket-delimited identifiers ([...])
// Inside brackets, ] must be doubled to ]] to prevent breakout
function escapeBracket(str) {
    if (str == null) return '';
    return String(str).replace(/\]/g, ']]');
}

// Safe integer conversion for SQL output — never emits NaN, handles id=0 correctly
function safeInt(val, fallback) {
    if (val == null) return fallback || 0;
    var n = parseInt(val, 10);
    return isNaN(n) ? (fallback || 0) : n;
}

// Escape strings for JavaScript output (prevents code injection in generated files)
function escapeJS(str) {
    if (str == null) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/\n/g, '\\n').replace(/\r/g, '');
}

// Escape for JS strings embedded inside HTML attributes (onclick, onchange, etc.)
// Applies JS escaping first, then HTML-encodes the result so the HTML parser
// doesn't interpret quotes/ampersands before the JS engine sees the string.
function escapeJSAttr(str) {
    return escapeHtml(escapeJS(str));
}

// Toast notification for the wizard UI
function showToast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast-notification' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : type === 'warning' ? ' toast-warning' : type === 'info' ? ' toast-info' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    // Success/info toasts with filenames stay longer so user can read them
    var duration = (type === 'success' || type === 'info') ? 5000 : 3000;
    setTimeout(function() { t.classList.add('show'); }, 10);
    setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, duration);
}

// SQL generators (resetSQL, copySQL, formatSQL, generateSQL, generateContentSQL,
// generateFormsSQL, generateCombinedSQL, generateSwimlaneConfig, highlightSQL,
// downloadDashboard, generateColumnDefinitions, generateSplitColumnDefinitions)
// are defined in wizard-sql.js (split out to avoid Cloudflare WAF false-positive).

// generateViewModelJS(), generateIndexHTML(), generateReadme() are defined in wizard-generators.js
// (which overrides these via function declaration hoisting when loaded second)

// ============================================================================
// AMD MODULE REGISTRATION
// ============================================================================
if (typeof define === 'function' && define.amd) {
  define('template/wizard-demo', [], function () {
    return { loaded: true };
  });
}