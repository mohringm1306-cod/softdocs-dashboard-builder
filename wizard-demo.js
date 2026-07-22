/**
 * Dashboard Builder Wizard - Webinar Demo
 * Simulated API responses for demonstration purposes
 */

// ============================================================================
// VERSION TRACKING (single source of truth)
// ============================================================================
var WIZARD_VERSION = "4.4";
var WIZARD_BUILD_DATE = "2026-07-17";

// Changelog (newest first)
// 4.4   (2026-07-17) - Generated dashboards: collapsible "Overview" chart (inline-SVG counts per swimlane, updates on search/filter/sort) and a date-range filter (forms SubmittedDate / a content date field; omitted in combined mode where documents have no date). Wizard: pre-flight review on the finish step (warns on blank required field mappings, multiple filterless swimlanes, no data columns, missing source name); Import/Export build files (portable .json) so a build can move between browsers, machines, or teammates instead of living only in this browser's storage. Runtime text search was already built in. Also standardized survey/cards to resolve field id -> SQL column (were rendering blank) and combined-mode field pickers now include form inputs, suffixed "(form)".
// 4.3   (2026-07-13) - Forms mode: pivot the CURRENT value of each field via a LatestInput CTE (ROW_NUMBER latest by TimeStamp, rn=1) instead of MAX(CASE...) over all InputValue rows. Fixes fields edited during workflow review showing a stale value (e.g. a reviewer-lowered Level showing the original higher one). Fixes every pivoted column at once.
// 4.2   (2026-03-25) - Workflow Actions + Bulk Actions now cloud-only: approve/deny use Central Flow API (Lock+PutWorkQueue) instead of SQL queue tables. No Hybrid Server needed. Reassign still uses Hybrid if configured. Fix _cell() infinite recursion. Fix preview crash on action objects. Sync workflow step SQL to Package approach.
// 4.1   (2026-03-04) - Admin Setup Guide, deployment instructions, style mode filtering
// 4.0   (2026-03-04) - Style selection UX overhaul: infographic panel expands on click showing features, warnings, setup steps; Cloud Only vs Hybrid Server badges; style-specific live previews (12 unique renderers); URL auto-fill
// --- v3.x ---
// 3.5.0 (2026-03-03) - Style-specific live previews (12 unique renderers in sub-files); URL auto-fill (https://)
// 3.4.0 (2026-03-03) - Current Assignee virtual field (forms); Fillable Notes column (cross-cutting write-back)
// 3.3.4 (2026-03-03) - Fix DocumentType filter showing blank labels (was mapping IDs instead of names)
// 3.3.3 (2026-03-02) - Party field auto-detection via PartyTypeID fallback; field type badges in column picker
// 3.3.2 (2026-03-02) - DocumentType now filterable in content/combined modes; fix date column sorting (MM/DD/YYYY)
// 3.3.1 (2026-03-02) - FormStatus now detects Error state (TaskQueue.Status=9999); default Error swimlane added
// 3.3.0 (2026-03-02) - FormStatus computed column for forms/combined mode; back button in generated dashboards; auto-populate swimlane filters
// 3.2.1 (2026-02-27) - Obfuscate SQL keywords in wizard-sql.js (concatenated _Q map) to fully bypass Cloudflare WAF
// 3.2.0 (2026-02-27) - Split SQL generators into wizard-sql.js to bypass Cloudflare WAF blocking on upload
// 3.1.0 (2026-02-25) - Version tracking system; version stamped in generated files and all console logs
// 3.0.2 (2026-02-25) - Combined mode: split into two integration sources (content + forms); fix column names
// 3.0.1 (2026-02-24) - Forms mode: field filtering fix; Document mode: filterable fields; Current Workflow Step column
// 3.0.0 (2026-02-23) - Initial Dashboard Builder Wizard 3.0 release

console.log(
	"Dashboard Builder Wizard v" +
		WIZARD_VERSION +
		" (" +
		WIZARD_BUILD_DATE +
		") loaded",
);

// ============================================================================
// SIMULATED API DATA (What would come from live Etrieve)
// ============================================================================

var SimulatedData = {
	// Areas/Catalogs - simulates GET /areas response
	areas: [
		{ id: 2, name: "Students", description: "Student document repository" },
		{ id: 13, name: "Employees", description: "Employee HR documents" },
		{
			id: 38,
			name: "Testing Center",
			description: "Testing center records",
		},
		{
			id: 39,
			name: "PD Appeals",
			description: "Police Department appeals",
		},
		{
			id: 41,
			name: "Transfer Services",
			description: "3+1 transfer program documents",
		},
		{
			id: 44,
			name: "Health Sciences",
			description: "Health sciences program applications",
		},
	],

	// Document Types - simulates GET /documentTypes response
	documentTypes: {
		2: [
			// Students
			{ id: 101, name: "FA - FAFSA", code: "FAFAFSA" },
			{ id: 102, name: "FA - W2", code: "FAW2" },
			{ id: 103, name: "FA - Tax Return", code: "FATAX" },
			{ id: 104, name: "FA - Verification Worksheet", code: "FAVER" },
			{ id: 105, name: "FA - Award Letter", code: "FAAWARD" },
			{ id: 106, name: "FA - SAP Appeal", code: "FASAP" },
			{ id: 110, name: "Transcript - Official", code: "TRANSOFF" },
			{ id: 111, name: "Transcript - Unofficial", code: "TRANSUN" },
			{ id: 112, name: "Transcript - HS", code: "TRANSHS" },
			{ id: 120, name: "Registration - Add/Drop", code: "REGADD" },
			{ id: 121, name: "Registration - Withdrawal", code: "REGWD" },
		],
		13: [
			// Employees
			{ id: 201, name: "HR - Application", code: "HRAPP" },
			{ id: 202, name: "HR - I9", code: "HRI9" },
			{ id: 203, name: "HR - W4", code: "HRW4" },
			{ id: 204, name: "HR - Direct Deposit", code: "HRDD" },
			{ id: 205, name: "HR - Benefits Enrollment", code: "HRBEN" },
			{ id: 206, name: "HR - Performance Review", code: "HRPERF" },
		],
		44: [
			// Health Sciences
			{ id: 301, name: "HS - Application", code: "HSAPP" },
			{ id: 302, name: "HS - Background Check", code: "HSBG" },
			{ id: 303, name: "HS - Immunization Record", code: "HSIMM" },
			{ id: 304, name: "HS - Drug Screen", code: "HSDRUG" },
			{ id: 305, name: "HS - CPR Certification", code: "HSCPR" },
		],
	},

	// Key Fields by Area - simulates document type field definitions
	// Each field can have 'values' array for fields that are filterable
	keyFields: {
		2: [
			// Student fields
			{
				id: 2,
				name: "First Name",
				type: "party",
				alias: "StudentFName",
				partyTypeId: 1,
			},
			{
				id: 4,
				name: "Last Name",
				type: "party",
				alias: "StudentLName",
				partyTypeId: 1,
			},
			{
				id: 25,
				name: "Student ID",
				type: "party",
				alias: "StudentID",
				partyTypeId: 1,
			},
			{
				id: 9,
				name: "Student Info Lookup",
				type: "text",
				alias: "StudentLookup",
			},
			{
				id: 10,
				name: "Document Date",
				type: "date",
				alias: "DocumentDate",
			},
			{
				id: 11,
				name: "Term",
				type: "text",
				alias: "Term",
				values: [
					"Fall 2025",
					"Spring 2026",
					"Summer 2026",
					"Fall 2026",
				],
			},
			{
				id: 18,
				name: "Academic Year",
				type: "text",
				alias: "AcademicYear",
				values: ["2024-2025", "2025-2026", "2026-2027"],
			},
			{
				id: 60,
				name: "FA Status",
				type: "text",
				alias: "FAStatus",
				values: [
					"Pending Review",
					"Under Review",
					"Approved",
					"Denied",
					"Incomplete",
					"Needs More Info",
				],
			},
			{
				id: 496,
				name: "Student Status",
				type: "text",
				alias: "StudentStatus",
				values: [
					"Active",
					"Inactive",
					"Graduated",
					"Withdrawn",
					"On Hold",
				],
			},
			{ id: 504, name: "FA Comments", type: "text", alias: "FAComments" },
		],
		13: [
			// Employee fields
			{
				id: 2,
				name: "First Name",
				type: "party",
				alias: "EmployeeFName",
				partyTypeId: 2,
			},
			{
				id: 4,
				name: "Last Name",
				type: "party",
				alias: "EmployeeLName",
				partyTypeId: 2,
			},
			{
				id: 58,
				name: "Employee ID",
				type: "party",
				alias: "EmployeeID",
				partyTypeId: 2,
			},
			{
				id: 59,
				name: "Employee Info Lookup",
				type: "text",
				alias: "EmployeeLookup",
			},
			{
				id: 10,
				name: "Document Date",
				type: "date",
				alias: "DocumentDate",
			},
			{
				id: 132,
				name: "Document Owner",
				type: "text",
				alias: "DocOwner",
			},
			{
				id: 133,
				name: "HR Status",
				type: "text",
				alias: "HRStatus",
				values: ["New", "In Progress", "Complete", "Archived"],
			},
		],
		44: [
			// Health Sciences fields
			{
				id: 2,
				name: "First Name",
				type: "party",
				alias: "StudentFName",
				partyTypeId: 1,
			},
			{
				id: 4,
				name: "Last Name",
				type: "party",
				alias: "StudentLName",
				partyTypeId: 1,
			},
			{
				id: 25,
				name: "Student ID",
				type: "party",
				alias: "StudentID",
				partyTypeId: 1,
			},
			{
				id: 87,
				name: "HS Program",
				type: "text",
				alias: "HSProgram",
				values: [
					"Nursing",
					"Dental Hygiene",
					"Radiologic Tech",
					"Respiratory Care",
					"Sonography",
				],
			},
			{
				id: 97,
				name: "HS Status",
				type: "text",
				alias: "HSStatus",
				values: [
					"Applied",
					"Documents Pending",
					"Under Review",
					"Interview Scheduled",
					"Accepted",
					"Waitlisted",
					"Denied",
				],
			},
			{
				id: 98,
				name: "Admission Decision",
				type: "text",
				alias: "AdmissionDecision",
				values: [
					"Pending",
					"Accepted",
					"Conditional Accept",
					"Waitlisted",
					"Denied",
				],
			},
			{
				id: 99,
				name: "Program Deadline",
				type: "date",
				alias: "ProgramDeadline",
			},
		],
	},

	// Form Templates - simulates GET /reporting/central_forms_TemplateVersion
	formTemplates: [
		{ id: 586, name: "Service Request", templateId: 361 },
		{ id: 638, name: "Capital Budget Request FY26", templateId: 401 },
		{ id: 665, name: "Position Request", templateId: 402 },
		{ id: 668, name: "Capital Budget Request FY27", templateId: 401 },
		{ id: 692, name: "Incident Report", templateId: 360 },
		{ id: 710, name: "Equipment Request", templateId: 420 },
		{ id: 725, name: "Travel Authorization", templateId: 430 },
	],

	// Form InputIDs by Template - simulates form field discovery
	formInputIds: {
		586: [
			// Service Request
			{ id: "first_name_1", label: "First Name" },
			{ id: "last_name_2", label: "Last Name" },
			{ id: "email_3", label: "Employee Email" },
			{ id: "department_6", label: "Department" },
			{ id: "title_7", label: "Job Title" },
			{ id: "checkbox_1# Category A", label: "Category: Option A" },
			{ id: "checkbox_1# Category B", label: "Category: Option B" },
			{ id: "checkbox_1# Category C", label: "Category: Option C" },
			{ id: "checkbox_1# Category D", label: "Category: Option D" },
			{ id: "employee_signature_1", label: "Signature" },
			{ id: "request_date_5", label: "Request Date" },
		],
		692: [
			// Incident Report
			{ id: "employee_name", label: "Employee Name" },
			{ id: "Employee_ID", label: "Employee ID" },
			{ id: "employee_email", label: "Employee Email" },
			{ id: "employee_phone", label: "Employee Phone" },
			{ id: "job_title", label: "Job Title" },
			{ id: "hire_date", label: "Hire Date" },
			{ id: "incident_date", label: "Incident Date" },
			{ id: "incident_time", label: "Incident Time" },
			{ id: "incident_location", label: "Incident Location" },
			{ id: "incident_type", label: "Incident Type" },
			{ id: "incident_description", label: "Incident Description" },
			{ id: "injury_description", label: "Injury Description" },
			{ id: "emergency_room", label: "Emergency Room Visit" },
			{ id: "lost_time", label: "Lost Time" },
			{ id: "supervisor_name", label: "Supervisor Name" },
			{ id: "supervisor_signature", label: "Supervisor Signature" },
		],
		665: [
			// Budget Position
			{ id: "first_name_8", label: "Requester First Name" },
			{ id: "last_name_9", label: "Requester Last Name" },
			{ id: "employee_email_11", label: "Requester Email" },
			{ id: "radio_1", label: "Request Type" },
			{ id: "input_30", label: "New Position: Job Title" },
			{ id: "input_31", label: "New Position: Pay Grade" },
			{ id: "input_32", label: "New Position: Department" },
			{ id: "input_34", label: "Increase FTE: Current Position" },
			{ id: "input_35", label: "Increase FTE: Current FTE" },
			{ id: "input_36", label: "Increase FTE: Requested FTE" },
			{ id: "text_area_3", label: "Justification" },
		],
	},

	// Workflow Steps by ProcessID
	workflowSteps: {
		service: [
			{
				id: "step-1-guid",
				name: "Supervisor_Approval",
				displayName: "Supervisor Approval",
			},
			{
				id: "step-2-guid",
				name: "Department_Review",
				displayName: "Department Review",
			},
			{
				id: "step-3-guid",
				name: "Fulfillment_Queue",
				displayName: "Fulfillment Queue",
			},
		],
		incident: [
			{
				id: "f45-step-1",
				name: "Supervisor",
				displayName: "Supervisor Report",
			},
			{
				id: "f45-step-2",
				name: "Safety_Review",
				displayName: "Safety Review",
			},
			{
				id: "f45-step-3",
				name: "Compliance_Review",
				displayName: "Compliance Review",
			},
			{
				id: "f45-step-4",
				name: "Payroll",
				displayName: "Payroll Review",
			},
			{
				id: "f45-step-5",
				name: "Final_Review",
				displayName: "Final Review",
			},
		],
		budget: [
			{
				id: "bo-step-1",
				name: "BOSupervisor",
				displayName: "Supervisor",
			},
			{
				id: "bo-step-2",
				name: "BOSupervisorsSupervisor",
				displayName: "Supervisor's Supervisor",
			},
			{
				id: "bo-step-3",
				name: "BOSupervisorsSupervisorsSupervisor",
				displayName: "Director Level",
			},
			{ id: "bo-step-4", name: "IT Review", displayName: "IT Review" },
		],
	},
};

// ============================================================================
// THEME COOKIE HELPERS
// ============================================================================

function setThemeCookie(mode) {
	var expires = "";
	if (mode) {
		var d = new Date();
		d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
		expires = "; expires=" + d.toUTCString();
	} else {
		// Clear cookie
		expires = "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
	}
	document.cookie =
		"wizardTheme=" + (mode || "") + expires + "; path=/; SameSite=Lax";
}

function getThemeCookie() {
	var name = "wizardTheme=";
	var parts = document.cookie.split(";");
	for (var i = 0; i < parts.length; i++) {
		var c = parts[i].trim();
		if (c.indexOf(name) === 0) {
			var val = c.substring(name.length);
			if (val === "content" || val === "forms" || val === "combined")
				return val;
		}
	}
	return null;
}

// Apply saved theme on page load (before any rendering)
(function initThemeFromCookie() {
	var saved = getThemeCookie();
	if (saved) {
		document.body.classList.add("mode-" + saved);
	}
})();

// ============================================================================
// STATE
// ============================================================================

var State = {
	mode: null,
	currentStep: 0,
	maxStepReached: 0,
	advancedMode: false,
	colors: { primary: "#006341", primaryDark: "#004d35", accent: "#f4b41a" },

	// Dashboard info
	dashboardTitle: "",
	sourceName: "",
	centralUrl: "",
	contentUrl: "",

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
		alphaRanges: [
			["A", "H"],
			["I", "P"],
			["Q", "Z"],
		],
		// Claims (style 5): filter chip labels
		filterChips: ["All", "High Priority", "30+ Days", "60+ Days"],
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
			{ name: "Member A", color: "#e8f5e9" },
			{ name: "Member B", color: "#e3f2fd" },
			{ name: "Member C", color: "#fff3e0" },
		],
		// Cards Dashboard (style 11): card field mappings
		cardTitleField: null,
		cardStatusField: null,
		cardLeadField: null,
		cardBudgetField: null,
		// Bulk Actions (style 12): reassign targets
		reassignTargets: [
			"Get Quotes",
			"Vendor Review",
			"Budget Approval",
			"Supervisor Approval",
			"Procurement",
		],
		// Current Assignee: TaskQueue.ActorId, auto-resolved to a name via central_flow_Actor (Etrieve standard)
		assigneeColumnName: "ActorId",
	},

	// Notes column (cross-cutting write-back, any style)
	notesConfig: {
		enabled: false,
		columnLabel: "Notes",
	},

	// Hybrid Server config (used in schema.sql generation)
	hybridConfig: {
		databaseName: "",
	},

	// Security-first access control
	// When enabled, data is only loaded if the user belongs to the power group.
	// Non-power users get a filtered integration call (per-swimlane) so unauthorized
	// data never reaches the browser.
	securityConfig: {
		enabled: false,
		powerGroupId: "", // Azure AD group ID for supervisors/power users
		powerGroupName: "", // Display name for the group
		swimlaneGroups: [], // Array of { swimlaneName, groupId, groupName }
	},
};

// ============================================================================
// STYLE DEFINITIONS
// ============================================================================

var DashboardStyles = [
	{
		id: "simple-status",
		num: 1,
		name: "Simple Status",
		icon: "bi-check-circle",
		category: "Basic",
		modes: ["content", "forms", "combined"],
		description: "Collapsible swimlanes organized by status progression.",
		bestFor: "Linear workflows: Received -> In Progress -> Complete",
		examples: "Opt-Out Forms, Parent Consent, FSSA Applications",
		requiresSQL: false,
		features: [
			"Collapsible swimlanes grouped by workflow status",
			"Sortable columns, global search, per-swimlane CSV export",
			"View button links directly to form or document in Etrieve",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "request-type",
		num: 2,
		name: "Request Type",
		icon: "bi-collection",
		category: "Basic",
		modes: ["content", "forms", "combined"],
		description:
			"Organizes items into swimlanes by request type or category instead of status.",
		bestFor: "Multi-purpose forms with different request categories",
		examples: "Travel Requests, Program Applications",
		requiresSQL: false,
		features: [
			"Swimlanes organized by category or request type",
			"Sortable columns, global search, per-swimlane CSV export",
			"Color-coded type badges with item counts",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "expandable",
		num: 3,
		name: "Expandable Detail",
		icon: "bi-bullseye",
		category: "Advanced",
		modes: ["content", "forms", "combined"],
		description:
			"Click any row to expand and see additional detail fields below it.",
		bestFor: "Budget requests, capital projects, detailed records",
		examples: "Budget Office Positions, Capital Requests, Facilities",
		requiresSQL: false,
		features: [
			"Click +/- to expand rows and see detail fields inline",
			"You pick which fields show in the expanded detail area",
			"Sortable columns, search, per-swimlane export",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "alpha-split",
		num: 4,
		name: "Alpha Split",
		icon: "bi-sort-alpha-down",
		category: "Basic",
		modes: ["content", "forms", "combined"],
		description:
			"Auto-splits items by last name ranges for workload distribution.",
		bestFor: "High-volume processing needing workload balancing",
		examples: "Financial Aid Documents, Student Records",
		requiresSQL: false,
		features: [
			"Automatically splits items into A-H, I-P, Q-Z (configurable)",
			"Each range becomes its own swimlane with counts",
			"Great for distributing work across multiple staff",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "claims",
		num: 5,
		name: "Claims System",
		icon: "bi-file-earmark-text",
		category: "Advanced",
		modes: ["content", "forms", "combined"],
		description:
			"Staff can claim items, see their personal stats, and filter by category. Color-coded badges show how long items have been waiting.",
		bestFor: "Document processing queues with multiple staff",
		examples: "Transcript Dashboard, NIS Transcripts",
		requiresSQL: true,
		features: [
			'Staff click "Claim" to take ownership of items',
			"Personal stats bar shows your claimed count vs total",
			"Age badges show how long each item has been waiting",
			"Quick-filter chips (All, High Priority, 30+ Days, etc.)",
		],
		warnings: [
			"This is interactive: staff claim and unclaim items from the dashboard",
			"Requires on-prem SQL Server to store who claimed what",
			"Requires Hybrid Server connection between cloud and on-prem",
		],
		setupSteps: [
			"Create cloud integration source",
			"Run schema.sql on your on-prem SQL Server",
			"Configure Hybrid Server connection",
			"Create write-back integration sources in Etrieve",
		],
	},
	{
		id: "workflow-actions",
		num: 6,
		name: "Workflow Actions",
		icon: "bi-gear",
		category: "Advanced",
		modes: ["forms", "combined"],
		description:
			"Each workflow step gets its own color and action buttons (approve, deny, etc.) with confirmation dialogs. Uses the Central Flow API directly.",
		bestFor:
			"Multi-step approval processes where staff take action at each stage",
		examples: "Student Name Changes, Approval Workflows",
		requiresSQL: false,
		features: [
			"Color-coded swimlane headers per workflow step",
			"Approve / Deny / custom action buttons on every row",
			"Confirmation dialog before any action executes",
			"Direct Central API calls for instant workflow transitions",
		],
		warnings: [
			"This is an interactive action system, not just a status viewer",
			"If you just want to SEE workflow steps, use Simple Status instead",
			"Users must have workflow permissions in Central for the items they act on",
			"Dashboard must run within Etrieve Central (same origin for API access)",
		],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
			"Ensure users have workflow permissions",
		],
	},
	{
		id: "pdf-signatures",
		num: 7,
		name: "PDF + Signatures",
		icon: "bi-file-pdf",
		category: "Advanced",
		modes: ["forms", "combined"],
		description:
			"Expandable rows showing signature status and document details. Built for compliance and incident tracking.",
		bestFor:
			"Forms with signatures, compliance documents, incident reports",
		examples: "EHSR Form 45, Incident Reports",
		requiresSQL: false,
		features: [
			"Expandable rows show signature status and document details",
			"PDF link opens rendered form directly in browser",
			"Built for compliance tracking and incident management",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "survey-analytics",
		num: 8,
		name: "Survey Analytics",
		icon: "bi-bar-chart",
		category: "Specialized",
		modes: ["forms", "combined"],
		description:
			"Rating stats, color-coded response cards, and table or card views.",
		bestFor: "Survey response analysis and reporting",
		examples: "SGC HR Feedback, Assessment Surveys",
		requiresSQL: false,
		features: [
			"Stats bar: total responses, department count, average rating",
			"Toggle between table view and visual cards view",
			"Color-coded rating badges (green/yellow/red)",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "award-nominations",
		num: 9,
		name: "Award Nominations",
		icon: "bi-trophy",
		category: "Specialized",
		modes: ["forms", "combined"],
		description:
			"Expandable nomination details with color-coded category badges.",
		bestFor: "Employee recognition and award programs",
		examples: "Staff Awards, Faculty Recognition",
		requiresSQL: false,
		features: [
			"Expandable rows show nominee details and justification",
			"Color-coded category badges (Innovation, Leadership, etc.)",
			"Sortable columns, search, per-swimlane export",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "committee-voting",
		num: 10,
		name: "Committee Voting",
		icon: "bi-people",
		category: "Specialized",
		modes: ["forms", "combined"],
		description: "Named voter columns, document preview, and vote buttons.",
		bestFor: "Committee decisions on appeals or applications",
		examples: "Visa Committee, Appeals Board, PD Appeals",
		requiresSQL: true,
		features: [
			"Named voter columns with color-coded headers",
			"Vote buttons: Approve, Deny, Need More Info",
			"Tracks who voted and shows vote status per member",
			"Member slot auto-detection based on logged-in user",
		],
		warnings: [
			"Members vote directly from the dashboard",
			"Requires on-prem SQL Server to store vote records",
			"Requires Hybrid Server connection between cloud and on-prem",
		],
		setupSteps: [
			"Create cloud integration source",
			"Run schema.sql on your on-prem SQL Server",
			"Configure Hybrid Server connection",
			"Create write-back integration sources in Etrieve",
		],
	},
	{
		id: "cards-dashboard",
		num: 11,
		name: "Executive Cards",
		icon: "bi-grid-1x2-fill",
		category: "Specialized",
		modes: ["content", "forms", "combined"],
		description:
			"Color-coded status overview with a responsive card grid layout.",
		bestFor: "Executive-level tracking with visual metrics",
		examples:
			"Strategic Plan Tracking, Project Portfolio, Initiative Dashboard",
		requiresSQL: false,
		features: [
			"Status overview with color-coded breakdown",
			"Card grid layout instead of table rows",
			"Great for executive-level dashboards and portfolios",
		],
		warnings: [],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
		],
	},
	{
		id: "bulk-actions",
		num: 12,
		name: "Bulk Approvals",
		icon: "bi-pc-display",
		category: "Advanced",
		modes: ["forms", "combined"],
		description:
			"Bulk checkboxes, approve/deny/reassign, row action menus, and export selected. Approve/Deny use Central Flow API directly.",
		bestFor: "Approval queues with bulk operations",
		examples: "IT Equipment Requests, Procurement Reviews",
		requiresSQL: false,
		features: [
			"Checkboxes for selecting multiple items at once",
			"Bulk Approve and Bulk Deny via Central Flow API (cloud-only)",
			"Per-row action menu with quick approve/deny",
			"Export selected items to CSV",
			"Optional Reassign feature (requires Hybrid Server if configured)",
		],
		warnings: [
			"This is interactive: staff approve/deny/reassign from the dashboard",
			"Users must have workflow permissions in Central for the items they act on",
			"Reassign feature requires Hybrid Server connection (optional)",
		],
		setupSteps: [
			"Create cloud integration source",
			"Upload dashboard files to Etrieve",
			"Ensure users have workflow permissions",
		],
	},
];

// ============================================================================
// DRAFT SAVING (localStorage)
// ============================================================================

// ============================================================================
// DASHBOARD COLORS (user-selectable brand colors for the generated dashboard)
// ============================================================================
var COLOR_PRESETS = [
	{ name: "COD Green", primary: "#006341", accent: "#f4b41a" },
	{ name: "Blue", primary: "#1d4ed8", accent: "#f59e0b" },
	{ name: "Navy", primary: "#1e3a5f", accent: "#4a90d9" },
	{ name: "Maroon", primary: "#7f1d1d", accent: "#d97706" },
	{ name: "Teal", primary: "#0f766e", accent: "#f59e0b" },
	{ name: "Purple", primary: "#6b21a8", accent: "#f59e0b" },
	{ name: "Slate", primary: "#334155", accent: "#38bdf8" },
];
var COLOR_DEFAULT = {
	primary: "#006341",
	primaryDark: "#004d35",
	accent: "#f4b41a",
};

// Validate a #rrggbb hex; fall back if anything else (prevents CSS injection from a bad draft).
function safeHex(hex, fallback) {
	return /^#[0-9a-fA-F]{6}$/.test(hex || "") ? hex : fallback;
}
// Darken a hex color by a fraction (0..1) to derive the header-gradient dark stop.
function darkenColor(hex, amt) {
	hex = safeHex(hex, "#006341").replace("#", "");
	function h(n) {
		return (
			"0" + Math.max(0, Math.min(255, Math.round(n))).toString(16)
		).slice(-2);
	}
	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);
	return "#" + h(r * (1 - amt)) + h(g * (1 - amt)) + h(b * (1 - amt));
}
// Push the current colors onto the live preview (its mockups use var(--primary/--accent)).
function applyPreviewColors() {
	var c = document.getElementById("previewContent");
	if (!c || !State.colors) return;
	c.style.setProperty("--primary", safeHex(State.colors.primary, "#006341"));
	c.style.setProperty(
		"--primary-dark",
		safeHex(State.colors.primaryDark, "#004d35"),
	);
	c.style.setProperty("--accent", safeHex(State.colors.accent, "#f4b41a"));
}
// Live color-input handler (no re-render, so dragging the picker stays smooth).
function setDashboardColor(which, hex) {
	if (!State.colors) State.colors = Object.assign({}, COLOR_DEFAULT);
	hex = safeHex(hex, which === "accent" ? "#f4b41a" : "#006341");
	if (which === "primary") {
		State.colors.primary = hex;
		State.colors.primaryDark = darkenColor(hex, 0.22);
	} else if (which === "accent") {
		State.colors.accent = hex;
	}
	saveDraft();
	applyPreviewColors();
}
// Preset swatch handler (re-renders the step to sync inputs, swatch highlight, and preview).
function applyColorPreset(primary, accent) {
	if (!State.colors) State.colors = {};
	State.colors.primary = safeHex(primary, "#006341");
	State.colors.primaryDark = darkenColor(primary, 0.22);
	State.colors.accent = safeHex(accent, "#f4b41a");
	saveDraft();
	if (typeof renderStep === "function") renderStep();
	applyPreviewColors();
}

var DRAFT_KEY = "dashboardBuilderDraft";
var DRAFT_SAVE_DELAY = 500; // ms debounce
var saveTimeout = null;

function saveDraft() {
	// Debounce saves
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		const draft = Object.assign({}, State, {
			savedAt: new Date().toISOString(),
		});
		try {
			localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
			showDraftIndicator("saved");
		} catch (e) {
			console.warn("Could not save draft:", e);
			if (e && e.name === "QuotaExceededError") {
				showToast(
					"Draft save failed: browser storage full. Try clearing old drafts.",
					"warning",
				);
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
		console.warn("Could not load draft:", e);
		return null;
	}
}

function clearDraft() {
	try {
		localStorage.removeItem(DRAFT_KEY);
	} catch (e) {
		console.warn("Could not clear draft:", e);
	}
}

function restoreDraft(draft) {
	// Restore all state properties
	State.mode = draft.mode;
	State.currentStep = draft.currentStep || 0;
	State.maxStepReached = Math.max(
		draft.maxStepReached || 0,
		State.currentStep,
	);
	State.advancedMode = draft.advancedMode || false;
	State.colors = draft.colors || {
		primary: "#006341",
		primaryDark: "#004d35",
		accent: "#f4b41a",
	};
	State.dashboardTitle = draft.dashboardTitle || "";
	State.sourceName = draft.sourceName || "";
	State.centralUrl = draft.centralUrl || draft.baseUrl || "";
	State.contentUrl = draft.contentUrl || "";
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
	if (draft.notesConfig) {
		State.notesConfig = draft.notesConfig;
	}
	if (draft.hybridConfig) {
		Object.assign(State.hybridConfig, draft.hybridConfig);
	}
	if (draft.securityConfig) {
		Object.assign(State.securityConfig, draft.securityConfig);
	}

	// Migrate old drafts: backfill missing sqlAlias on swimlane filters
	// Known field name -> SQL alias mappings (for when SimulatedData isn't loaded yet)
	var knownAliases = {
		"Current Workflow Step": "CurrentStepName",
		"Document Type": "DocumentType",
		Category: "Category",
		"Record Type": "RecordType",
	};
	if (State.swimlanes) {
		State.swimlanes.forEach(function (sl) {
			if (sl.filters) {
				sl.filters.forEach(function (f) {
					if (!f.sqlAlias && f.fieldName) {
						// Use known mapping first, then try live fields, then fall back
						if (knownAliases[f.fieldName]) {
							f.sqlAlias = knownAliases[f.fieldName];
						} else {
							try {
								var fields = getFilterableFields();
								var match = fields.find(function (ff) {
									return (
										ff.name === f.fieldName ||
										String(ff.id) === String(f.fieldId)
									);
								});
								f.sqlAlias = match
									? match.sqlAlias || match.name
									: f.fieldName;
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
	let indicator = document.getElementById("draftIndicator");
	if (!indicator) return;

	if (status === "saved") {
		indicator.innerHTML = '<i class="bi bi-cloud-check"></i> Draft saved';
		indicator.className = "draft-indicator saved";
	} else if (status === "restored") {
		indicator.innerHTML =
			'<i class="bi bi-cloud-download"></i> Draft restored';
		indicator.className = "draft-indicator restored";
	}

	// Fade out after a moment
	indicator.style.opacity = "1";
	setTimeout(() => {
		indicator.style.opacity = "0";
	}, 2000);
}

function formatDraftTime(isoString) {
	const date = new Date(isoString);
	if (isNaN(date.getTime())) return "unknown time";
	const now = new Date();
	const diff = now - date;

	if (diff < 60000) return "just now";
	if (diff < 3600000) return Math.floor(diff / 60000) + " minutes ago";
	if (diff < 86400000) return Math.floor(diff / 3600000) + " hours ago";
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
	if (document.getElementById("draftModal")) return; // prevent duplicate modals
	const timeAgo = formatDraftTime(draft.savedAt);
	const title = draft.dashboardTitle || "Untitled";
	const modeLabel =
		draft.mode === "content"
			? "Document"
			: draft.mode === "forms"
				? "Form"
				: "Combined";

	// Compute actual step count by temporarily restoring mode/style
	var savedMode = State.mode,
		savedStyle = State.selectedStyle;
	State.mode = draft.mode;
	State.selectedStyle = draft.selectedStyle || null;
	var totalSteps = typeof getSteps === "function" ? getSteps().length : "?";
	State.mode = savedMode;
	State.selectedStyle = savedStyle;

	const modal = document.createElement("div");
	modal.id = "draftModal";
	modal.className = "draft-modal";
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
	const modal = document.getElementById("draftModal");
	if (modal) modal.remove();

	// Restore state
	restoreDraft(draft);

	// Apply mode theme
	applyModeTheme(State.mode);

	// Start wizard at saved step
	document.getElementById("modeSelection").style.display = "none";
	document.getElementById("stepContent").style.display = "block";
	document.getElementById("progressSection").style.display = "block";
	document.getElementById("cardFooter").style.display = "flex";

	updateModeIndicator();

	// Reload data for draft selections.
	// In Etrieve mode, formInputIds/docTypes are fetched on demand via
	// selectTemplate()/selectArea(), but drafts restore State without
	// triggering those fetches. Call them with keepSelections=true so
	// the restored selectedInputIds/selectedFields are preserved.
	if (
		State.selectedTemplate &&
		(State.mode === "forms" || State.mode === "combined")
	) {
		var formData = SimulatedData.formInputIds[State.selectedTemplate.id];
		if (!formData || formData.length === 0) {
			selectTemplate(State.selectedTemplate.id, true);
		}
	}

	if (
		State.selectedArea &&
		(State.mode === "content" || State.mode === "combined")
	) {
		var docData = SimulatedData.documentTypes[State.selectedArea.id];
		if (!docData || docData.length === 0) {
			selectArea(State.selectedArea.id, true);
		}
	}

	renderProgress();
	renderStep();

	showDraftIndicator("restored");
}

function discardDraft() {
	clearDraft();
	window._pendingDraft = null;

	// Close modal
	const modal = document.getElementById("draftModal");
	if (modal) modal.remove();
}
function selectMode(mode, e) {
	State.mode = mode;

	// Apply mode-specific theme to body
	applyModeTheme(mode);

	// Highlight selected card
	document.querySelectorAll(".mode-card").forEach((card) => {
		card.classList.remove("selected");
	});
	if (e && e.currentTarget) {
		e.currentTarget.classList.add("selected");
	}

	// Short delay for visual feedback
	setTimeout(() => {
		startWizard();
	}, 300);

	saveDraft();
}

function applyModeTheme(mode) {
	// Remove all mode classes
	document.body.classList.remove(
		"mode-content",
		"mode-forms",
		"mode-combined",
	);

	// Add the appropriate mode class
	if (mode) {
		document.body.classList.add("mode-" + mode);
	}

	// Persist theme choice in cookie
	setThemeCookie(mode);
}

// Handle keyboard activation for mode cards (accessibility)
function handleModeKeydown(e, mode) {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		selectMode(mode, e);
	}
}

function resetWizard() {
	// Confirm if user has made progress
	if (State.mode && State.currentStep > 0) {
		if (!confirm("Start over? All your current selections will be lost.")) {
			return;
		}
	}

	// Reset all state
	State.mode = null;
	State.currentStep = 0;
	State.maxStepReached = 0;
	State.advancedMode = false;
	State.colors = {
		primary: "#006341",
		primaryDark: "#004d35",
		accent: "#f4b41a",
	};
	State.dashboardTitle = "";
	State.sourceName = "";
	State.centralUrl = "";
	State.contentUrl = "";
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
		detailFields: [],
		nameField: null,
		alphaRanges: [
			["A", "H"],
			["I", "P"],
			["Q", "Z"],
		],
		filterChips: ["All", "High Priority", "30+ Days", "60+ Days"],
		ageBadgeWarning: 30,
		ageBadgeCritical: 60,
		workflowActions: {},
		ratingField: null,
		commentField: null,
		departmentField: null,
		committeeMembers: [
			{ name: "Member A", color: "#e8f5e9" },
			{ name: "Member B", color: "#e3f2fd" },
			{ name: "Member C", color: "#fff3e0" },
		],
		cardTitleField: null,
		cardStatusField: null,
		cardLeadField: null,
		cardBudgetField: null,
		reassignTargets: [
			"Get Quotes",
			"Vendor Review",
			"Budget Approval",
			"Supervisor Approval",
			"Procurement",
		],
		assigneeColumnName: "ActorId",
	};
	State.notesConfig = { enabled: false, columnLabel: "Notes" };
	State.hybridConfig = { databaseName: "" };
	State.securityConfig = {
		enabled: false,
		powerGroupId: "",
		powerGroupName: "",
		swimlaneGroups: [],
	};

	// Clear saved draft
	clearDraft();

	// Clear mode theme
	applyModeTheme(null);

	// Reset UI
	document.getElementById("modeSelection").style.display = "block";
	document.getElementById("stepContent").style.display = "none";
	document.getElementById("progressSection").style.display = "none";
	document.getElementById("cardFooter").style.display = "none";
	document.getElementById("modeIndicator").innerHTML = "";

	// Reset header
	document.getElementById("cardHeader").innerHTML = `
        <h2><i class="bi bi-magic"></i> Welcome to Dashboard Builder</h2>
        <p>Build powerful Softdocs dashboards without writing SQL from scratch</p>
    `;

	// Clear selected mode cards
	document.querySelectorAll(".mode-card").forEach((card) => {
		card.classList.remove("selected");
	});
}

function startWizard() {
	document.getElementById("modeSelection").style.display = "none";
	document.getElementById("stepContent").style.display = "block";
	document.getElementById("progressSection").style.display = "block";
	document.getElementById("cardFooter").style.display = "flex";

	// Show mode indicator
	updateModeIndicator();

	State.currentStep = 0;
	State.maxStepReached = 0;
	renderProgress();
	renderStep();
}

// ============================================================================
// ADMIN SETUP GUIDE
// ============================================================================

function toggleSetupGuide() {
	var panel = document.getElementById("setupGuide");
	if (!panel) return;
	if (panel.style.display === "none") {
		panel.innerHTML = buildSetupGuideHTML();
		panel.style.display = "block";
		panel.scrollIntoView({ behavior: "smooth", block: "start" });
	} else {
		panel.style.display = "none";
	}
}

function buildSetupGuideHTML() {
	return (
		'<button class="setup-guide-close" onclick="toggleSetupGuide()" title="Close">&times;</button>' +
		'<h3><i class="bi bi-book"></i> Admin Setup Guide</h3>' +
		'<p class="guide-subtitle">Everything you need to get the Dashboard Builder running in Etrieve. Plan for 20 to 30 minutes the first time.</p>' +
		// Step 1
		'<h4><span class="step-number">1</span> Create 6 Data Sources</h4>' +
		"<p>Go to <strong>Admin Settings &gt; Sources</strong> and click <strong>Add New Source</strong> (Source Type: Database). For each source:</p>" +
		"<ol>" +
		"<li>Set the <strong>Name</strong> (copy it exactly, character for character)</li>" +
		"<li>Set <strong>Connection</strong> to your Etrieve Content database connection</li>" +
		"<li>On the <strong>Actions</strong> tab: turn on <strong>Get</strong>, toggle <strong>Custom</strong> on, then paste the SQL into the <strong>Query Editor</strong></li>" +
		"<li>If a parameter is listed, add it under <strong>Source Keys</strong></li>" +
		"<li><strong>Leave the Schema field blank</strong> (do not type anything in it)</li>" +
		"<li>On the <strong>Privileges</strong> tab: add your users and give them <strong>Get</strong> access</li>" +
		"<li>Click <strong>Save</strong></li>" +
		"</ol>" +
		'<div class="guide-tip"><strong>Important:</strong> The source name must match exactly. ' +
		"If you name it <code>WizardBuilder_getAreas</code> instead of <code>WizardBuilder_GetAreas</code>, the wizard will not find it. " +
		"The Schema field must stay blank. Filling it in (even with something that seems right) causes 500 errors.</div>" +
		'<div class="source-grid">' +
		buildSourceBlock(
			"WizardBuilder_GetAreas",
			"No source keys needed.",
			"SELECT\n    CatalogID       AS id,\n    [Name]          AS name\nFROM [dbo].[Catalog]\nORDER BY [Name]",
		) +
		buildSourceBlock(
			"WizardBuilder_GetDocTypes",
			"Source key: <code>@CatalogID</code> (Integer)",
			"SELECT\n    dt.DocumentTypeID   AS id,\n    dt.[Name]           AS name,\n    dt.[Name]           AS code\nFROM [dbo].[DocumentType] dt\nINNER JOIN [dbo].[CatalogDocumentType] cdt\n    ON dt.DocumentTypeID = cdt.DocumentTypeID\nWHERE cdt.CatalogID = @CatalogID\nORDER BY dt.[Name]",
		) +
		buildSourceBlock(
			"WizardBuilder_GetKeyFields",
			"Source key: <code>@CatalogID</code> (Integer)",
			"SELECT DISTINCT\n    f.FieldID           AS id,\n    f.[Name]            AS name,\n    CASE\n        WHEN f.PartyTypeID IS NOT NULL          THEN 'party'\n        WHEN dt.[Name] = 'Date'                 THEN 'date'\n        WHEN dt.[Name] = 'Number'               THEN 'number'\n        WHEN dt.[Name] IN ('Money', 'Decimal')  THEN 'decimal'\n        ELSE 'text'\n    END                 AS type,\n    f.[Name]            AS alias,\n    f.PartyTypeID       AS partyTypeId\nFROM [dbo].[Field] f\nINNER JOIN [dbo].[DataType] dt\n    ON f.DataTypeID = dt.DataTypeID\nINNER JOIN [dbo].[DocumentTypeField] dtf\n    ON f.FieldID = dtf.FieldID\nINNER JOIN [dbo].[CatalogDocumentType] cdt\n    ON dtf.DocumentTypeID = cdt.DocumentTypeID\nWHERE cdt.CatalogID = @CatalogID\nORDER BY f.[Name]",
		) +
		buildSourceBlock(
			"WizardBuilder_GetFormTemplates",
			"No source keys needed.",
			"SELECT\n    tv.TemplateVersionID    AS id,\n    t.[Name]                AS name,\n    t.TemplateID            AS templateId\nFROM reporting.central_forms_Template t\nINNER JOIN reporting.central_forms_TemplateVersion tv\n    ON t.TemplateID = tv.TemplateID\nWHERE tv.IsPublished = 1\nORDER BY t.[Name]",
		) +
		buildSourceBlock(
			"WizardBuilder_GetFormInputs",
			"Source key: <code>@TemplateVersionID</code> (Integer)",
			"SELECT DISTINCT\n    iv.InputID  AS id,\n    iv.InputID  AS label\nFROM reporting.central_forms_InputValue iv\nINNER JOIN reporting.central_forms_Form f\n    ON iv.FormID = f.FormID\nWHERE f.TemplateVersionID = @TemplateVersionID\n    AND f.IsDraft = 0\nORDER BY iv.InputID",
		) +
		buildSourceBlock(
			"WizardBuilder_GetWorkflowSteps",
			"Source key: <code>@TemplateID</code> (Integer)",
			"SELECT DISTINCT\n    ps.ProcessStepId                AS id,\n    ps.[Name]                       AS name,\n    REPLACE(ps.[Name], '_', ' ')    AS displayName\nFROM reporting.central_flow_ProcessStep ps\nWHERE ps.ProcessID = (\n    SELECT TOP 1 pkg.ProcessID\n    FROM reporting.central_forms_TemplateVersion tv\n    INNER JOIN reporting.central_flow_PackageDocument pd\n        ON pd.SourceTypeCode = tv.Code\n    INNER JOIN reporting.central_flow_Package pkg\n        ON pd.PackageID = pkg.PackageId\n    WHERE tv.TemplateID = @TemplateID\n    ORDER BY pkg.CreateDate DESC\n)\n    AND ps.IsDeleted = 0\nORDER BY ps.[Name]",
		) +
		"</div>" +
		// Step 2
		'<h4><span class="step-number">2</span> Upload the Wizard Files</h4>' +
		"<ol>" +
		"<li>Go to <strong>Admin &gt; Forms</strong> and create a new form</li>" +
		'<li>Name it whatever you like (e.g., "Dashboard Builder")</li>' +
		"<li>Upload all 12 files: <code>index.html</code>, <code>wizard.css</code>, <code>wizard-demo.js</code>, <code>wizard-sql.js</code>, " +
		"<code>wizard-templates.js</code>, <code>wizard-generators.js</code>, <code>wizard-preview.js</code>, " +
		"<code>wizard-preview-basic.js</code>, <code>wizard-preview-advanced.js</code>, <code>wizard-preview-specialized.js</code>, " +
		"<code>viewmodel.js</code>, <code>configuration.js</code></li>" +
		"</ol>" +
		// Step 3
		'<h4><span class="step-number">3</span> Connect the Sources to the Form</h4>' +
		"<ol>" +
		"<li>Open the form you just created</li>" +
		"<li>Go to the <strong>Connect</strong> tab (under the form's settings)</li>" +
		"<li>Find each of the 6 sources and check <strong>Get</strong> for all of them</li>" +
		"</ol>" +
		'<div class="guide-tip"><strong>All 6 sources must be connected</strong> with Get checked, or the wizard cannot load your areas, doc types, fields, templates, inputs, or workflow steps.</div>' +
		// Step 4
		'<h4><span class="step-number">4</span> Open and Go</h4>' +
		"<p>Open the form in Etrieve. You'll see three options: Document Lookup, Form Tracker, or Combined View. Pick one, walk through the wizard, and download your finished dashboard.</p>" +
		"<p>Upload those downloaded files as a <strong>new form</strong> (your actual dashboard). Before it shows data, that dashboard also needs its own <strong>Etrieve Content</strong> source created and connected. The wizard's Finish step lists those exact steps.</p>"
	);
}

function buildSourceBlock(name, keysHtml, sql) {
	// Escape HTML entities in SQL for safe display in <pre>
	var safeSql = sql
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	return (
		'<div class="source-block">' +
		"<h5>" +
		name +
		"</h5>" +
		'<div class="source-keys">' +
		keysHtml +
		"</div>" +
		"<pre>" +
		safeSql +
		"</pre>" +
		"</div>"
	);
}

function updateModeIndicator() {
	const indicator = document.getElementById("modeIndicator");
	const modeLabels = {
		content: {
			label: "Document Dashboard",
			icon: "bi-file-earmark-text-fill",
			class: "content-mode",
			desc: "Browse & manage documents",
		},
		forms: {
			label: "Forms Dashboard",
			icon: "bi-ui-checks-grid",
			class: "forms-mode",
			desc: "Track form submissions",
		},
		combined: {
			label: "Combined Dashboard",
			icon: "bi-stack",
			class: "combined-mode",
			desc: "Documents + Forms",
		},
	};

	const mode = modeLabels[State.mode] || modeLabels["content"];
	indicator.innerHTML = `<span class="mode-indicator ${escapeHtml(mode.class)}"><i class="bi ${escapeHtml(mode.icon)}"></i> ${escapeHtml(mode.label)}</span>`;
}

// ============================================================================
// NAVIGATION
// ============================================================================

function getSteps() {
	let base;
	if (State.mode === "content") base = ContentStepsBase;
	else if (State.mode === "forms") base = FormsStepsBase;
	else if (State.mode === "combined") base = CombinedStepsBase;
	else base = ContentStepsBase;

	// Clone the base array
	let steps = base.map((s) => Object.assign({}, s));

	// Insert style step after setup (index 1)
	const styleStep = { id: "style", title: "Style", icon: "bi-palette" };
	steps.splice(1, 0, styleStep);

	// Insert style-specific steps before swimlanes (if a style is selected)
	if (State.selectedStyle) {
		const extra = StyleExtraSteps[State.selectedStyle] || [];
		if (extra.length > 0) {
			const swimIdx = steps.findIndex((s) => s.id === "swimlanes");
			if (swimIdx >= 0) {
				var extraCloned = extra.map((s) => Object.assign({}, s));
				steps.splice.apply(steps, [swimIdx, 0].concat(extraCloned));
			}
		}
	}

	// Insert security step between swimlanes and generate (always available)
	const genIdx = steps.findIndex((s) => s.id === "generate");
	if (genIdx >= 0) {
		steps.splice(genIdx, 0, {
			id: "securityConfig",
			title: "Security",
			icon: "bi-shield-lock",
		});
	}

	return steps;
}

function nextStep() {
	const steps = getSteps();

	// Validate current step before advancing
	const step = steps[State.currentStep];
	if (step) {
		if (step.id === "setup" && !State.dashboardTitle.trim()) {
			showToast(
				"Please enter a dashboard name before continuing.",
				"warning",
			);
			return;
		}
		if (step.id === "setup") {
			if (
				(State.mode === "forms" || State.mode === "combined") &&
				!State.centralUrl.trim()
			) {
				showToast(
					"Please enter your Etrieve Central URL (e.g., https://yoursite.etrieve.cloud).",
					"warning",
				);
				return;
			}
			if (
				(State.mode === "content" || State.mode === "combined") &&
				!State.contentUrl.trim()
			) {
				showToast(
					"Please enter your Etrieve Content URL (e.g., https://yoursitecontent.etrieve.cloud).",
					"warning",
				);
				return;
			}
			if (State.centralUrl && !State.centralUrl.match(/^https?:\/\//i)) {
				showToast(
					"Central URL must start with https:// (e.g., https://yoursite.etrieve.cloud).",
					"warning",
				);
				return;
			}
			if (State.contentUrl && !State.contentUrl.match(/^https?:\/\//i)) {
				showToast(
					"Content URL must start with https:// (e.g., https://yoursitecontent.etrieve.cloud).",
					"warning",
				);
				return;
			}
		}
		if (step.id === "style" && !State.selectedStyle) {
			showToast(
				"Please select a dashboard style before continuing.",
				"warning",
			);
			return;
		}
		if (step.id === "area" && !State.selectedArea) {
			showToast("Please select a folder before continuing.", "warning");
			return;
		}
		if (step.id === "docTypes" && State.selectedDocTypes.length === 0) {
			showToast("Please select at least one document type.", "warning");
			return;
		}
		if (step.id === "template" && !State.selectedTemplate) {
			showToast(
				"Please select a form template before continuing.",
				"warning",
			);
			return;
		}
		if (
			step.id === "fields" &&
			State.selectedFields.length === 0 &&
			State.selectedInputIds.length === 0
		) {
			showToast("Please select at least one field.", "warning");
			return;
		}
		if (step.id === "formFields" && State.selectedInputIds.length === 0) {
			showToast("Please select at least one form field.", "warning");
			return;
		}
		if (step.id === "docFields" && State.selectedFields.length === 0) {
			showToast("Please select at least one document field.", "warning");
			return;
		}
		if (step.id === "swimlanes" && State.swimlanes.length === 0) {
			showToast(
				"Please add at least one swimlane before continuing.",
				"warning",
			);
			return;
		}
	}

	if (State.currentStep < steps.length - 1) {
		State.currentStep++;
		// Clamp to array bounds (safety for style-change step count shifts)
		if (State.currentStep >= steps.length) {
			State.currentStep = steps.length - 1;
		}
		State.maxStepReached = Math.max(
			State.maxStepReached || 0,
			State.currentStep,
		);
		renderProgress();
		renderStep();
		saveDraft();
	}
}

// Jump directly to any step already reached (clickable progress bar).
function goToStep(i) {
	var steps = getSteps();
	if (i < 0 || i >= steps.length) return;
	var maxReached = Math.max(State.maxStepReached || 0, State.currentStep);
	if (i > maxReached) return; // cannot jump ahead of the furthest step reached
	State.currentStep = i;
	renderProgress();
	renderStep();
	saveDraft();
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
	if (str === null || str === undefined) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// Escape strings for SQL single-quote literals (prevents SQL injection in generated queries)
function escapeSQL(str) {
	if (str == null) return "";
	if (typeof str === "object") {
		// Guard against accidental object inputs (e.g., passing a filter object instead of string)
		console.warn("[escapeSQL] Received object instead of string:", str);
		return String(str).replace(/'/g, "''");
	}
	return String(str).replace(/'/g, "''");
}

// Escape strings for T-SQL bracket-delimited identifiers ([...])
// Inside brackets, ] must be doubled to ]] to prevent breakout
function escapeBracket(str) {
	if (str == null) return "";
	return String(str).replace(/\]/g, "]]");
}

// Safe integer conversion for SQL output (never emits NaN, handles id=0 correctly)
function safeInt(val, fallback) {
	if (val == null) return fallback || 0;
	var n = parseInt(val, 10);
	return isNaN(n) ? fallback || 0 : n;
}

// Escape strings for JavaScript output (prevents code injection in generated files)
function escapeJS(str) {
	if (str == null) return "";
	return String(str)
		.replace(/\\/g, "\\\\")
		.replace(/'/g, "\\'")
		.replace(/"/g, '\\"')
		.replace(/`/g, "\\`")
		.replace(/\$/g, "\\$")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "");
}

// Escape for JS strings embedded inside HTML attributes (onclick, onchange, etc.)
// Applies JS escaping first, then HTML-encodes the result so the HTML parser
// doesn't interpret quotes/ampersands before the JS engine sees the string.
function escapeJSAttr(str) {
	return escapeHtml(escapeJS(str));
}

// Toast notification for the wizard UI
function showToast(msg, type) {
	var t = document.createElement("div");
	t.className =
		"toast-notification" +
		(type === "error"
			? " toast-error"
			: type === "success"
				? " toast-success"
				: type === "warning"
					? " toast-warning"
					: type === "info"
						? " toast-info"
						: "");
	t.textContent = msg;
	document.body.appendChild(t);
	// Success/info toasts with filenames stay longer so user can read them
	var duration = type === "success" || type === "info" ? 5000 : 3000;
	setTimeout(function () {
		t.classList.add("show");
	}, 10);
	setTimeout(function () {
		t.classList.remove("show");
		setTimeout(function () {
			t.remove();
		}, 300);
	}, duration);
}

// SQL generators (resetSQL, copySQL, formatSQL, generateSQL, generateContentSQL,
// generateFormsSQL, generateCombinedSQL, generateSwimlaneConfig, highlightSQL,
// downloadDashboard, generateColumnDefinitions, generateSplitColumnDefinitions)
// are defined in wizard-sql.js (split out to avoid Cloudflare WAF false-positive).

// generateViewModelJS(), generateIndexHTML(), generateReadme() are defined in wizard-generators.js
// (which overrides these via function declaration hoisting when loaded second)

// ============================================================================
// MY DASHBOARDS (saved builds, browser localStorage)
// ============================================================================
var LIBRARY_KEY = "dashboardBuilderLibrary";

function loadLibrary() {
	try {
		return JSON.parse(localStorage.getItem(LIBRARY_KEY) || "[]");
	} catch (e) {
		return [];
	}
}
function saveLibrary(list) {
	try {
		localStorage.setItem(LIBRARY_KEY, JSON.stringify(list));
		return true;
	} catch (e) {
		showToast("Could not save: browser storage is full.", "warning");
		return false;
	}
}

// Snapshot the current build into the library (keyed by name; updates in place if it exists).
function saveDashboardToLibrary(silent) {
	if (!State.mode) {
		if (!silent) showToast("Start building a dashboard first.", "warning");
		return;
	}
	var name = (State.dashboardTitle || "").trim() || "Untitled Dashboard";
	var lib = loadLibrary();
	var snapshot = Object.assign({}, State, {
		savedAt: new Date().toISOString(),
	});
	var idx = -1;
	for (var i = 0; i < lib.length; i++) {
		if (
			(lib[i].name || "").toLowerCase() === name.toLowerCase() &&
			lib[i].mode === State.mode
		) {
			idx = i;
			break;
		}
	}
	var entry = {
		id: idx >= 0 && lib[idx].id ? lib[idx].id : "db_" + Date.now(),
		name: name,
		savedAt: snapshot.savedAt,
		mode: State.mode,
		style: State.selectedStyle,
		state: snapshot,
	};
	if (idx >= 0) lib[idx] = entry;
	else lib.unshift(entry);
	if (saveLibrary(lib)) {
		if (!silent)
			showToast('Saved "' + name + '" to My Dashboards.', "success");
		updateMyDashboardsButton();
		var panel = document.getElementById("myDashboardsPanel");
		if (panel && panel.style.display !== "none")
			panel.innerHTML = renderMyDashboardsPanel();
	}
}

// Reopen a saved build for editing (mirrors continueDraft's restore + show-UI flow).
function openFromLibrary(id) {
	var lib = loadLibrary();
	var entry = null;
	for (var i = 0; i < lib.length; i++) {
		if (lib[i].id === id) {
			entry = lib[i];
			break;
		}
	}
	if (!entry || !entry.state) return;
	closeMyDashboards();
	restoreDraft(entry.state);
	if (typeof applyModeTheme === "function") applyModeTheme(State.mode);
	var ms = document.getElementById("modeSelection");
	if (ms) ms.style.display = "none";
	var sc = document.getElementById("stepContent");
	if (sc) sc.style.display = "block";
	var ps = document.getElementById("progressSection");
	if (ps) ps.style.display = "block";
	var cf = document.getElementById("cardFooter");
	if (cf) cf.style.display = "flex";
	if (typeof updateModeIndicator === "function") updateModeIndicator();
	// Re-hydrate template/area field lists so restored selections render (same as continueDraft).
	if (
		State.selectedTemplate &&
		(State.mode === "forms" || State.mode === "combined")
	) {
		var fd = SimulatedData.formInputIds[State.selectedTemplate.id];
		if (!fd || fd.length === 0) {
			try {
				selectTemplate(State.selectedTemplate.id, true);
			} catch (e) {}
		}
	}
	if (
		State.selectedArea &&
		(State.mode === "content" || State.mode === "combined")
	) {
		var dd = SimulatedData.documentTypes[State.selectedArea.id];
		if (!dd || dd.length === 0) {
			try {
				selectArea(State.selectedArea.id, true);
			} catch (e) {}
		}
	}
	State.maxStepReached = getSteps().length - 1; // finished build: every step is reachable
	renderProgress();
	renderStep();
	saveDraft();
	showToast('Opened "' + entry.name + '" for editing.', "success");
}

function deleteFromLibrary(id) {
	var lib = loadLibrary().filter(function (d) {
		return d.id !== id;
	});
	saveLibrary(lib);
	updateMyDashboardsButton();
	var panel = document.getElementById("myDashboardsPanel");
	if (panel && panel.style.display !== "none")
		panel.innerHTML = renderMyDashboardsPanel();
	showToast("Removed from My Dashboards.", "info");
}

// Export the current build as a portable .json file (works across browsers/machines,
// unlike the localStorage-only My Dashboards list).
function exportBuild() {
	if (!State.mode) {
		showToast("Start building a dashboard first.", "warning");
		return;
	}
	var snapshot = Object.assign({}, State, {
		savedAt: new Date().toISOString(),
		_buildFormat: "dashboard-builder-v1",
	});
	var base = (State.dashboardTitle || "dashboard").trim() || "dashboard";
	var safe =
		base
			.replace(/[^a-zA-Z0-9_ -]/g, "")
			.replace(/\s+/g, "-")
			.substring(0, 50) || "dashboard";
	try {
		var blob = new Blob([JSON.stringify(snapshot, null, 2)], {
			type: "application/json",
		});
		var a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = safe + "-build.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		showToast(
			"Build file saved. Share it or re-import it later.",
			"success",
		);
	} catch (e) {
		showToast("Could not export a build file in this browser.", "error");
	}
}

// Open the hidden file picker used for importing a build file.
function triggerImportBuild() {
	var inp = document.getElementById("importBuildInput");
	if (inp) inp.click();
}

// Import a build from a user-picked .json file and reopen it for editing
// (mirrors openFromLibrary's rehydrate + show-UI flow).
function importBuildFile(input) {
	var file = input && input.files && input.files[0];
	if (!file) return;
	var reader = new FileReader();
	reader.onload = function (e) {
		var snap;
		try {
			snap = JSON.parse(e.target.result);
		} catch (err) {
			showToast("That file is not valid JSON.", "error");
			input.value = "";
			return;
		}
		// Accept a raw State snapshot or a wrapped library entry {state:{...}}
		if (snap && snap.state && !snap.mode) snap = snap.state;
		if (!snap || !snap.mode) {
			showToast(
				"That does not look like a dashboard build file.",
				"error",
			);
			input.value = "";
			return;
		}
		try {
			restoreDraft(snap);
			if (typeof applyModeTheme === "function")
				applyModeTheme(State.mode);
			var ms = document.getElementById("modeSelection");
			if (ms) ms.style.display = "none";
			var sc = document.getElementById("stepContent");
			if (sc) sc.style.display = "block";
			var ps = document.getElementById("progressSection");
			if (ps) ps.style.display = "block";
			var cf = document.getElementById("cardFooter");
			if (cf) cf.style.display = "flex";
			if (typeof updateModeIndicator === "function")
				updateModeIndicator();
			if (
				State.selectedTemplate &&
				(State.mode === "forms" || State.mode === "combined")
			) {
				var fd = SimulatedData.formInputIds[State.selectedTemplate.id];
				if (!fd || fd.length === 0) {
					try {
						selectTemplate(State.selectedTemplate.id, true);
					} catch (e2) {}
				}
			}
			if (
				State.selectedArea &&
				(State.mode === "content" || State.mode === "combined")
			) {
				var dd = SimulatedData.documentTypes[State.selectedArea.id];
				if (!dd || dd.length === 0) {
					try {
						selectArea(State.selectedArea.id, true);
					} catch (e3) {}
				}
			}
			State.maxStepReached = getSteps().length - 1;
			closeMyDashboards();
			renderProgress();
			renderStep();
			saveDraft();
			showToast(
				'Imported "' +
					(State.dashboardTitle || "dashboard") +
					'". Review and re-download.',
				"success",
			);
		} catch (err2) {
			showToast("Could not open that build file.", "error");
		}
		input.value = "";
	};
	reader.readAsText(file);
}

function renderMyDashboardsPanel() {
	var lib = loadLibrary();
	var list =
		lib.length === 0
			? '<p style="color:#888;padding:12px 0;">No saved dashboards yet. Build one and click <strong>Save current build</strong>, or just download it (downloads are saved here automatically).</p>'
			: lib
					.map(function (d) {
						var when = formatDraftTime(d.savedAt);
						var modeLabel =
							d.mode === "content"
								? "Document"
								: d.mode === "forms"
									? "Form"
									: "Combined";
						return (
							'<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">' +
							'<div style="flex:1;min-width:0;"><strong>' +
							escapeHtml(d.name) +
							"</strong>" +
							'<div style="font-size:0.8rem;color:#888;">' +
							escapeHtml(modeLabel) +
							" dashboard &middot; saved " +
							escapeHtml(when) +
							"</div></div>" +
							'<button class="btn btn-primary btn-sm" onclick="openFromLibrary(\'' +
							escapeJSAttr(d.id) +
							'\')"><i class="bi bi-pencil-square"></i> Open</button>' +
							'<button class="btn btn-secondary btn-sm" onclick="deleteFromLibrary(\'' +
							escapeJSAttr(d.id) +
							'\')" title="Remove"><i class="bi bi-trash"></i></button>' +
							"</div>"
						);
					})
					.join("");
	return (
		'<button class="setup-guide-close" onclick="toggleMyDashboards()" title="Close">&times;</button>' +
		'<h3><i class="bi bi-collection"></i> My Dashboards</h3>' +
		'<p class="guide-subtitle">Saved on this computer. Open one to jump back in and edit, then re-download.</p>' +
		'<div style="margin:8px 0 16px;display:flex;gap:8px;flex-wrap:wrap;">' +
		'<button class="btn btn-primary" onclick="saveDashboardToLibrary()"><i class="bi bi-save"></i> Save current build</button>' +
		'<button class="btn btn-secondary" onclick="exportBuild()" title="Download this build as a portable file"><i class="bi bi-download"></i> Export build file</button>' +
		'<button class="btn btn-secondary" onclick="triggerImportBuild()" title="Open a build file from another browser or a teammate"><i class="bi bi-upload"></i> Import build file</button>' +
		'<input type="file" id="importBuildInput" accept="application/json,.json" style="display:none;" onchange="importBuildFile(this)">' +
		"</div>" +
		list
	);
}

function toggleMyDashboards() {
	var panel = document.getElementById("myDashboardsPanel");
	if (!panel) return;
	if (panel.style.display === "none" || !panel.style.display) {
		panel.innerHTML = renderMyDashboardsPanel();
		panel.style.display = "block";
		panel.scrollIntoView({ behavior: "smooth", block: "start" });
	} else {
		panel.style.display = "none";
	}
}
function closeMyDashboards() {
	var panel = document.getElementById("myDashboardsPanel");
	if (panel) panel.style.display = "none";
}

function updateMyDashboardsButton() {
	var el = document.getElementById("myDashCount");
	if (!el) return;
	var n = loadLibrary().length;
	el.textContent = n > 0 ? String(n) : "";
	el.style.display = n > 0 ? "inline-block" : "none";
}

// Inject the "My Dashboards" header button + panel once the header exists (works
// in the standalone page and inside the Etrieve iframe).
function ensureMyDashboardsButton() {
	if (document.getElementById("myDashboardsBtn")) {
		updateMyDashboardsButton();
		return;
	}
	var header = document.querySelector(".header-bar");
	if (!header) return;
	var right =
		header.children && header.children.length > 1
			? header.children[header.children.length - 1]
			: header;
	var setupBtn = right.querySelector
		? right.querySelector(".setup-guide-btn")
		: null;
	var btn = document.createElement("button");
	btn.id = "myDashboardsBtn";
	btn.className = "setup-guide-btn";
	btn.type = "button";
	btn.title = "Saved dashboards you can reopen and edit";
	btn.onclick = toggleMyDashboards;
	btn.innerHTML =
		'<i class="bi bi-collection"></i> <span>My Dashboards</span> <span id="myDashCount" class="badge" style="background:var(--accent);color:#000;margin-left:2px;"></span>';
	if (setupBtn && setupBtn.parentNode === right)
		right.insertBefore(btn, setupBtn);
	else right.appendChild(btn);
	if (!document.getElementById("myDashboardsPanel")) {
		var panel = document.createElement("div");
		panel.id = "myDashboardsPanel";
		panel.className = "setup-guide";
		panel.style.display = "none";
		document.body.appendChild(panel);
	}
	updateMyDashboardsButton();
}

// Run injection now, and retry briefly since the Etrieve iframe mounts the header after load.
(function initMyDashboardsUI() {
	function tryInject() {
		try {
			ensureMyDashboardsButton();
		} catch (e) {}
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", tryInject);
	} else {
		tryInject();
	}
	var tries = 0;
	var iv = setInterval(function () {
		tries++;
		if (document.getElementById("myDashboardsBtn") || tries > 20) {
			clearInterval(iv);
		} else {
			tryInject();
		}
	}, 300);
})();

// ============================================================================
// AMD MODULE REGISTRATION
// ============================================================================
if (typeof define === "function" && define.amd) {
	define("template/wizard-demo", [], function () {
		return { loaded: true };
	});
}
