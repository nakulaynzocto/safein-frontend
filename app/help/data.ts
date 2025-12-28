
import { Calendar, Users, Shield, Book, Video, Phone } from "lucide-react"

export interface HelpArticle {
  id: string
  title: string
  slug: string
  category: "Getting Started" | "User Management" | "Security & Privacy" | "Troubleshooting" | "Reporting"
  description: string
  content: string
  lastUpdated: string
  readTime: string
}

export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    id: "1",
    title: "How to create your first appointment",
    slug: "how-to-create-your-first-appointment",
    category: "Getting Started",
    description: "A comprehensive guide to scheduling and managing visitor appointments in SafeIn.",
    readTime: "5 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Introduction</h2>
      <p>Scheduling appointments effectively is the cornerstone of a secure and efficient front-desk operation. In <strong>SafeIn</strong>, creating an appointment not only reserves a time slot but also initiates a sequence of automated workflows, including visitor notifications, calendar invites, and security pre-checks.</p>
      
      <p>This guide will walk you through the complete process of creating a new appointment, ensuring you capture all necessary details for a seamless visitor experience.</p>

      <hr />

      <h2>Step-by-Step Guide</h2>

      <h3>1. Accessing the Appointment Module</h3>
      <p>Log in to your SafeIn Dashboard. You can initiate a new appointment from two locations:</p>
      <ul>
          <li><strong>Quick Actions:</strong> Located on the top-right of the main Dashboard, click the <strong>"Make Appointment"</strong> button for immediate access.</li>
          <li><strong>Sidebar Navigation:</strong> Click on <strong>"Appointments"</strong> in the left-hand menu, then select <strong>"New Appointment"</strong>.</li>
      </ul>

      <h3>2. Entering Visitor Information</h3>
      <p>Accurate data entry is crucial for security and communication. Please fill in the following fields:</p>
      <ul>
          <li><strong>Visitor Name (Required):</strong> Enter the guest's full legal name as it appears on their ID.</li>
          <li><strong>Email Address (Required):</strong> This is used to send the invitation, QR code, and parking instructions.</li>
          <li><strong>Phone Number (Optional):</strong> Useful for SMS notifications (if enabled in your plan).</li>
          <li><strong>Company/Organization:</strong> The entity the visitor represents.</li>
      </ul>

      <blockquote>
        <strong>Pro Tip:</strong> If the visitor has visited before, start typing their name, and SafeIn will suggest auto-completing their details from the database.
      </blockquote>

      <h3>3. Scheduling Details</h3>
      <p>Define the logistics of the visit:</p>
      <ul>
          <li><strong>Date & Time:</strong> Select the arrival date and expected duration.</li>
          <li><strong>Visit Type:</strong> Choose from categories like <em>Interview, Client Meeting, Vendor,</em> or <em>Personal</em>. This helps in analytics reporting later.</li>
          <li><strong>Meeting Room:</strong> (Optional) Assign a specific conference room to prevent booking conflicts.</li>
      </ul>

      <h3>4. Host Assignment</h3>
      <p>By default, you are listed as the host. If you are scheduling on behalf of someone else (e.g., as an Executive Assistant), search and select the correct employee from the <strong>"Host"</strong> dropdown. The assigned host will receive all arrival notifications.</p>

      <h3>5. Review and Confirm</h3>
      <p>Double-check all entered information. Once satisfied, click the <strong>"Create Appointment"</strong> button.</p>

      <hr />

      <h2>What Happens Next?</h2>
      <p>Immediately after creation, the system triggers the following actions:</p>
      <ol>
          <li><strong>Visitor Notification:</strong> The guest receives a branded email containing the date, time, location map, and a unique QR code for express check-in.</li>
          <li><strong>Calendar Sync:</strong> An invite (.ics file) is sent to both the host and the visitor to add to their Outlook, Google, or Apple calendars.</li>
          <li><strong>Pre-Registration:</strong> If your security settings require it, a link to sign an NDA or upload ID documents may be included in the invitation.</li>
      </ol>

      <h2>Troubleshooting</h2>
      <p>If the visitor does not receive the email, please check the spelling of the email address or ask them to check their Spam/Junk folder. You can always <strong>Resend Invite</strong> from the Appointment Details page.</p>
    `
  },
  {
    id: "2",
    title: "Setting up visitor registration",
    slug: "setting-up-visitor-registration",
    category: "Getting Started",
    description: "Configure the check-in process, custom fields, and legal documents for your visitors.",
    readTime: "6 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Overview</h2>
      <p>The visitor registration flow is the first touchpoint for your guests. A well-configured flow balances security requirements with a welcoming user experience. SafeIn allows you to customize every step of this process.</p>

      <h2>Configuration Steps</h2>

      <h3>1. Accessing Registration Settings</h3>
      <p>Navigate to <strong>Settings</strong> > <strong>Visitor Registration</strong>. Here you will see a drag-and-drop interface representing the screens your visitors will see on the Kiosk or iPad.</p>

      <h3>2. Customizing Data Fields</h3>
      <p>Decide what information is mandatory for entry. Common configurations include:</p>
      <ul>
          <li><strong>Standard Fields:</strong> Name, Email, Phone, Company.</li>
          <li><strong>Custom Fields:</strong> You can add text inputs, dropdowns, or checkboxes. Examples:
            <ul>
                <li><em>"Car License Plate"</em> (for parking management)</li>
                <li><em>"Citizenship"</em> (for export control compliance)</li>
                <li><em>"Laptop Serial Number"</em> (for asset protection)</li>
            </ul>
          </li>
      </ul>

      <h3>3. Photo & Document Capture</h3>
      <p>Enable <strong>Photo Capture</strong> to require a webcam photo of the visitor. This photo will be printed on their badge for visual identification.</p>
      <p>Enable <strong>Document Scan</strong> if you need to capture a driver's license or passport (requires compatible hardware).</p>

      <h3>4. Legal Agreements (NDAs)</h3>
      <p>Protect your intellectual property by enabling <strong>NDA Signing</strong>. You can upload your PDF text. The visitor must scroll through and digitally sign on the screen before check-in is permitted. A copy of the signed PDF is stored in their visitor profile.</p>

      <h3>5. Badge Printing</h3>
      <p>Configure the badge layout under the <strong>Badge Printing</strong> tab. You can toggle:</p>
      <ul>
          <li>Visitor Name (Large font)</li>
          <li>Host Name</li>
          <li>Wi-Fi Credentials</li>
          <li>Visitor Photo</li>
          <li>Your Company Logo</li>
      </ul>

      <hr />

      <h2>Kiosk Mode</h2>
      <p>Once configured, open the SafeIn Kiosk App on your tablet. Go to <strong>Settings</strong> in the app and select <strong>"Lock to Kiosk Mode"</strong>. This hinders visitors from closing the app or accessing other tablet functions.</p>
    `
  },
  {
    id: "3",
    title: "Configuring email notifications",
    slug: "configuring-email-notifications",
    category: "Getting Started",
    description: "Master the communication flow with automated email templates and triggers.",
    readTime: "4 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>The Importance of Communication</h2>
      <p>Automated status updates ensure that your reception team, hosts, and security staff are always in sync. SafeIn's notification engine handles these communications instantly.</p>

      <h2>Notification Types</h2>

      <h3>1. Visitor Arrival (Host Notification)</h3>
      <p><strong>Trigger:</strong> Visitor completes check-in at the kiosk.</p>
      <p><strong>Recipient:</strong> The assigned Host.</p>
      <p><strong>Content:</strong> "Your visitor, [Visitor Name], has arrived and is waiting in the lobby."</p>

      <h3>2. Invite Email (Visitor Notification)</h3>
      <p><strong>Trigger:</strong> Appointment is created.</p>
      <p><strong>Content:</strong> Contains directions, parking info, and QR code.</p>
      
      <h3>3. Watchlist Alert (Security Notification)</h3>
      <p><strong>Trigger:</strong> A visitor matches an entry on the internal blocklist.</p>
      <p><strong>Recipient:</strong> Security Team / Admins.</p>
      <p><strong>Action:</strong> Instant alert requiring manual approval before the visitor can proceed.</p>

      <h2>Customizing Templates</h2>
      <p>Go to <strong>Settings</strong> > <strong>Notifications</strong> > <strong>Email Templates</strong>.</p>
      <p>You can use dynamic placeholders/variables to personalize the messages:</p>
      <ul>
          <li><code>{{visitor_name}}</code></li>
          <li><code>{{host_name}}</code></li>
          <li><code>{{appointment_time}}</code></li>
          <li><code>{{location_name}}</code></li>
      </ul>
      <p>Supports basic HTML for branding (adding logos, colors, and footer links).</p>
    `
  },
  {
    id: "4",
    title: "Basic dashboard overview",
    slug: "basic-dashboard-overview",
    category: "Getting Started",
    description: "Unlocking the power of real-time analytics and operational data on your dashboard.",
    readTime: "5 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Your Command Center</h2>
      <p>The SafeIn Dashboard provides a high-level view of your facility's activity. It is designed to give Receptionists and Admins "at-a-glance" situational awareness.</p>

      <h2>Key Metrics Cards</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
            <h3>Pending</h3>
            <p>Visitors scheduled for today who have not yet arrived. Use this to prepare badges or clear security lists in advance.</p>
        </div>
        <div>
            <h3>Active / Checked In</h3>
            <p>The total number of guests currently inside the building. Crucial for fire drills and emergency evacuations.</p>
        </div>
        <div>
            <h3>Completed</h3>
            <p>Visits that have concluded. These records are archived for reporting.</p>
        </div>
        <div>
            <h3>Overstay / Time Out</h3>
            <p>Visitors who are still checked in past their expected departure time. Requires security attention.</p>
        </div>
      </div>

      <h2>Analytical Charts</h2>
      
      <h3>Visitor Trends (Monthly)</h3>
      <p>A bar chart showing visitor volume over the last 30 days. Use this to identify busy days (e.g., "Mondays are our busiest days") and adjust front-desk staffing accordingly.</p>

      <h3>Hourly Distribution</h3>
      <p>Access the heatmap to see peak arrival times. If you see a spike between 9:00 AM and 10:00 AM, ensure you have extra reception support during that window.</p>

      <h2>Real-Time Activity Feed</h2>
      <p>The sidebar or bottom feed shows a live log of actions: <em>"John Doe checked in"</em>, <em>"Meeting with Sarah Smith ended"</em>. This provides a granular audit trail of the day's events.</p>
    `
  },

  // User Management
  {
    id: "5",
    title: "Adding and managing employees",
    slug: "adding-and-managing-employees",
    category: "User Management",
    description: "A complete guide to directory management, role assignment, and access control for your staff.",
    readTime: "4 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Employee Directory Management</h2>
      <p>For the system to function effectively, your employee database must be up to date. Employees need accounts to invite visitors and receive arrival notifications.</p>

      <h2>Adding Employees</h2>
      
      <h3>Manual Entry</h3>
      <ol>
          <li>Navigate to the <strong>Users</strong> / <strong>Employees</strong> section.</li>
          <li>Click the <strong>"New Employee"</strong> button.</li>
          <li><strong>Required Fields:</strong> First Name, Last Name, Official Email Address.</li>
          <li><strong>Department:</strong> Assigning a department (e.g., HR, Engineering) helps in filtering reports.</li>
          <li><strong>Phone Number:</strong> Required for SMS notifications.</li>
      </ol>

      <h3>Directory Sync (Enterprise)</h3>
      <p>For larger organizations, manual entry is inefficient. SafeIn supports integration with <strong>Active Directory</strong>, <strong>Google Workspace</strong>, and <strong>Okta</strong>. Configuring this sync ensures that when an employee leaves the company, their SafeIn access is automatically revoked.</p>

      <h2>Editing and Offboarding</h2>
      <p>Click on any employee row to edit their details. If an employee leaves:</p>
      <ul>
          <li><strong>Do NOT Delete:</strong> Deleting a user removes their historical appointment data, breaking your audit trails.</li>
          <li><strong>Deactivate Instead:</strong> Toggle the "Active" status to "Inactive". This prevents login but preserves all history.</p>
      </ul>
    `
  },
  {
    id: "6",
    title: "Visitor registration process",
    slug: "visitor-registration-process",
    category: "User Management",
    description: "Understanding the end-to-end lifecycle of a visit from the guest's perspective.",
    readTime: "5 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>The Visitor Journey</h2>
      <p>A smooth registration process reflects positively on your company brand. Here is the standard workflow:</p>

      <h3>Phase 1: Pre-Arrival</h3>
      <p>The host creates an invite. The visitor receives an email with a <strong>QuickPass QR Code</strong>. They can save this to their Apple Wallet or Google Pay for easy access.</p>

      <h3>Phase 2: Arrival & Check-In</h3>
      <p>The visitor walks into the lobby and approaches the iPad Kiosk.</p>
      <ul>
          <li><strong>With Invite:</strong> They scan their QR code. The system instantly recognizes them, skips data entry, and prints a badge. <strong>(Time: < 10 seconds)</strong>.</li>
          <li><strong>Walk-In:</strong> They tap "I'm here to see someone". They manually type their name and search for their host. They take a photo and sign the NDA. <strong>(Time: ~2 minutes)</strong>.</li>
      </ul>

      <h3>Phase 3: The Meeting</h3>
      <p>The host comes to the lobby to collect the guest. The "Status" in the dashboard changes to "Checked In".</p>

      <h3>Phase 4: Check-Out</h3>
      <p>On their way out, the visitor scans their badge at the kiosk or simply taps "Check Out" and types their name. This timestamps their departure and updates the Fire List.</p>
    `
  },
  {
    id: "7",
    title: "User roles and permissions",
    slug: "user-roles-and-permissions",
    category: "User Management",
    description: "Detailed breakdown of access levels: Global Admin, Location Admin, Receptionist, and Employee.",
    readTime: "3 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>RBAC (Role-Based Access Control)</h2>
      <p>SafeIn adheres to the principle of least privilege. Assign roles based on job function.</p>

      <h3>1. Global Admin</h3>
      <p><strong>Access:</strong> Unlimited.</p>
      <p><strong>Responsibilities:</strong> Billing management, security policy configuration, global settings, integration setup.</p>

      <h3>2. Location Admin (Enterprise)</h3>
      <p><strong>Access:</strong> Full admin rights but restricted to a specific office (e.g., "New York Office").</p>
      <p><strong>Responsibilities:</strong> Managing local receptionists, devices, and employees for that site.</p>

      <h3>3. Receptionist / Security Guard</h3>
      <p><strong>Access:</strong> Dashboard View, Visitor Log (Read/Write).</p>
      <p><strong>Capabilities:</strong> Can check people in/out, edit visitor details, print badges. <strong>Cannot</strong> access system settings, billing, or export full databases.</p>

      <h3>4. Employee (Host)</h3>
      <p><strong>Access:</strong> Self-Service Only.</p>
      <p><strong>Capabilities:</strong> Can only see and manage <em>their own</em> appointments and history. Cannot see visitors invited by colleagues.</p>
    `
  },
  {
    id: "8",
    title: "Bulk user import",
    slug: "bulk-user-import",
    category: "User Management",
    description: "How to rapidly onboard hundreds of employees using CSV tools.",
    readTime: "2 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Mass Onboarding</h2>
      <p>Setting up a new office? You don't need to add users one by one.</p>

      <h3>Step 1: Download Template</h3>
      <p>Go to <strong>Employees</strong> > <strong>Actions</strong> > <strong>Bulk Import</strong>. Download the provided <code>.csv</code> template file.</p>

      <h3>Step 2: Prepare Your Data</h3>
      <p>Open the template in Excel or Google Sheets. Copy-paste your employee list. Ensure:</p>
      <ul>
          <li>Email addresses are unique.</li>
          <li>No special characters in the phone number fields.</li>
          <li>Roles are typed exactly as "Admin", "Receptionist", or "Employee".</li>
      </ul>

      <h3>Step 3: Upload and Validate</h3>
      <p>Upload the saved CSV file. The system will pre-validate the data. Rows with errors (e.g., invalid email format) will be highlighted in red. You can correct them directly in the browser preview.</p>

      <h3>Step 4: Commit</h3>
      <p>Click <strong>"Import Users"</strong>. The system will create the accounts in the background and optionally send Welcome Emails to all new users with a link to set their passwords.</p>
    `
  },

  // Security & Privacy
  {
    id: "9",
    title: "Data encryption and security",
    slug: "data-encryption-and-security",
    category: "Security & Privacy",
    description: "Technical overview of SafeIn's data protection architecture and standards.",
    readTime: "3 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Data Protection Architecture</h2>
      <p>SafeIn is built with a "Security-First" approach, trusting that visitor data is often sensitive corporate intelligence.</p>

      <h3>Encryption Standards</h3>
      <ul>
          <li><strong>In Transit:</strong> All data moving between the Kiosk, Dashboard, and Cloud is encrypted using SHA-256 with RSA encryption (TLS 1.2 or higher).</li>
          <li><strong>At Rest:</strong> Databases are encrypted using AES-256 standards. Keys are rotated regularly.</li>
      </ul>

      <h3>Infrastructure Security</h3>
      <p>Our servers are hosted in top-tier AWS (Amazon Web Services) data centers, which are <strong>SOC 2 Type II</strong> and <strong>ISO 27001</strong> certified. We utilize VPCs (Virtual Private Clouds) to isolate visitor data from public networks.</p>

      <h3>Penetration Testing</h3>
      <p>We conduct annual third-party penetration tests to identify and patch vulnerabilities. Summary reports are available to Enterprise customers upon request.</p>
    `
  },
  {
    id: "10",
    title: "Privacy policy compliance",
    slug: "privacy-policy-compliance",
    category: "Security & Privacy",
    description: "Tools to ensure compliance with GDPR, CCPA, and other data privacy regulations.",
    readTime: "4 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Regulatory Compliance</h2>
      <p>Modern privacy laws (GDPR in Europe, CCPA in California) give individuals rights over their data. SafeIn provides the tools you need to remain compliant.</p>

      <h3>Data Minimization & Retention</h3>
      <p>You should only keep visitor data as long as necessary. Configure <strong>Auto-Delete Rules</strong>:</p>
      <ul>
          <li><em>"Delete visitor photos after 24 hours."</em></li>
          <li><em>"Anonymize visitor logs after 365 days."</em></li>
      </ul>

      <h3>Right to be Forgotten</h3>
      <p>If a visitor requests data deletion, use the <strong>"Purge User"</strong> feature. This permanently scrubs their PII (Personally Identifiable Information) from the database while keeping the statistical record (e.g., "A visitor was here") for analytics integrity.</p>

      <h3>Explicit Consent</h3>
      <p>During check-in, you can force a "Terms of Service" or "Privacy Notice" screen that the visitor must accept before providing their data.</p>
    `
  },
  {
    id: "11",
    title: "Access control settings",
    slug: "access-control-settings",
    category: "Security & Privacy",
    description: "Advanced security settings including IP whitelisting and 2FA.",
    readTime: "3 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Securing the Dashboard</h2>
      <p>Protecting the admin panel is as important as protecting the physical door.</p>

      <h3>Two-Factor Authentication (2FA)</h3>
      <p>Enforce 2FA for all admin accounts. Users will be required to enter a code sent to their email or generated by an Authenticator App (Google/Microsoft Auth) upon login.</p>

      <h3>IP Whitelisting (Enterprise)</h3>
      <p>Restrict dashboard access to your corporate network only. If an admin tries to log in from a home network or public coffee shop Wi-Fi, the attempt will be blocked, even if they have the correct password.</p>

      <h3>Session Policies</h3>
      <p>Configure automatic logout timers. For example, <em>"Log out inactive receptionists after 15 minutes"</em>. This prevents a security breach if a front-desk iPad is left unattended.</p>
    `
  },
  {
    id: "12",
    title: "Audit trail features",
    slug: "audit-trail-features",
    category: "Security & Privacy",
    description: "Complete visibility into every system modification for compliance audits.",
    readTime: "2 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>System Transparency</h2>
      <p>The Audit Log is an immutable record of "Who did What, and When". It is essential for forensic investigations and compliance audits.</p>

      <h3>What is Logged?</h3>
      <table style="width:100%; text-align: left;">
        <tr>
            <th>Category</th>
            <th>Events Tracked</th>
        </tr>
        <tr>
            <td>Authentication</td>
            <td>Logins, Failed Logins, Password Resets, 2FA challenges.</td>
        </tr>
        <tr>
            <td>User Management</td>
            <td>Creating, Editing, Deleting, or Changing roles of employees.</td>
        </tr>
        <tr>
            <td>Visitor Data</td>
            <td>Manual check-ins/outs, editing visitor names, exporting CSVs.</td>
        </tr>
        <tr>
            <td>System Config</td>
            <td>Changing badge layouts, disabling features, updating billing info.</td>
        </tr>
      </table>

      <h3>Exporting Logs</h3>
      <p>Logs can be exported to JSON or CSV format for ingestion into your SIEM tools (like Splunk or Datadog) for centralized monitoring.</p>
    `
  },

  // Troubleshooting
  {
    id: "13",
    title: "Troubleshooting common login issues",
    slug: "troubleshooting-common-login-issues",
    category: "Troubleshooting",
    description: "Diagnose and resolve access issues for your team.",
    readTime: "2 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>Cannot Access Account</h2>
      <p>If you or your team members are stuck at the login screen, follow this checklist.</p>

      <h3>1. "Invalid Credentials" Error</h3>
      <ul>
          <li><strong>Check Caps Lock:</strong> Passwords are case-sensitive.</li>
          <li><strong>Browser Autofill:</strong> Sometimes browsers save old/wrong passwords. Try clearing the field and typing manually.</li>
      </ul>

      <h3>2. Password Reset Not Working</h3>
      <p>If you clicked "Forgot Password" but didn't receive an email:</p>
      <ul>
          <li>Check Spam/Junk folders.</li>
          <li>Wait 5 minutes. server queues can sometimes cause delays.</li>
          <li>Ensure you entered the email address exactly as registered (e.g., <code>john.doe@company.com</code> vs <code>john@company.com</code>).</li>
      </ul>

      <h3>3. "Account Locked"</h3>
      <p>For security, 5 consecutive failed attempts trigger a 15-minute lockout. You must wait for the timer to expire. Admins cannot override this timer (security feature).</p>

      <h3>4. SSO Issues</h3>
      <p>If logging in with Google/Microsoft, ensure your browser allows pop-ups and third-party cookies for the authentication token to pass through.</p>
    `
  },

  // Reporting (Corrected category from Popular to Reporting where appropriate)
  {
    id: "14",
    title: "Exporting visitor reports and analytics",
    slug: "exporting-visitor-reports-and-analytics",
    category: "Reporting",
    description: "Generating compliance reports and data dumps for offline analysis.",
    readTime: "6 min read",
    lastUpdated: "Dec 2025",
    content: `
      <h2>The Power of Data</h2>
      <p>SafeIn keeps a historical record of every single footfall in your facility.</p>

      <h2>Generating a Visitor Log Report</h2>
      
      <h3>1. Filter Data</h3>
      <p>Go to the <strong>Visitors</strong> tab. Use the filters at the top:</p>
      <ul>
          <li><strong>Date Range:</strong> "Last 30 Days", "This Year", or "Custom Range".</li>
          <li><strong>Status:</strong> Filter by "Checked In", "Invited", or "Watchlist".</li>
          <li><strong>Host:</strong> See visitors for a specific department or person.</li>
      </ul>

      <h3>2. Export</h3>
      <p>Click the <strong>"Export"</strong> button. Select format: <strong>CSV</strong> (Excel compatible) or <strong>PDF</strong> (Print friendly).</p>
      <p><em>Note: Large exports (10,000+ records) may take a few minutes and will be emailed to you when ready.</em></p>

      <h2>Scheduled Reports</h2>
      <p>Don't want to export manually? Set up <strong>Automated Reporting</strong>.</p>
      <p>Go to <strong>Settings</strong> > <strong>Reports</strong>. Create a schedule:</p>
      <ul>
          <li><em>"Send me a PDF summary of all visitors every Friday at 5:00 PM."</em></li>
          <li><em>"Send the Fire Marshal a list of active visitors every day at 8:00 AM."</em></li>
      </ul>
    `
  },
  {
    id: "15",
    title: "Managing visitor check-in and check-out",
    slug: "managing-visitor-check-in-and-check-out",
    category: "User Management",
    description: "Operational guide for front-desk staff handling guests manually.",
    readTime: "4 min read",
    lastUpdated: "Dec 2025",
    content: `
        <h2>Manual Operations for Receptionists</h2>
        <p>While Kiosks handle self-service, the Receptionist Dashboard is designed for power users who need to manage exceptions.</p>

        <h3>Processing a Check-In</h3>
        <p>If a visitor arrives without a smartphone or finds the kiosk difficult:</p>
        <ol>
            <li>Ask for their name.</li>
            <li>Search them in the "Expected Today" list on your dashboard.</li>
            <li>Click the <strong>Eye Icon</strong> to verify details.</li>
            <li>Click <strong>"Check In"</strong>.</li>
            <li><strong>Badge Printing:</strong> You can click "Print Badge" to trigger the printer behind the desk manually.</li>
        </ol>

        <h3>Processing a Check-Out</h3>
        <p>It is vital to check visitors out to maintain an accurate emergency evacuation list.</p>
        <ul>
            <li><strong>Individual:</strong> Search the name in the "Active" list and click "Check Out".</li>
            <li><strong>Bulk Action:</strong> Verify that the lobby is empty at the end of the day. Select "Select All Active" and click "Force Check Out". *Use a note like "End of Day Auto-Checkout" for the audit trail.*</li>
        </ul>
      `
  }
]

export const helpCategories = [
  {
    icon: Calendar,
    title: "Getting Started",
    description: "Learn the basics of setting up your SafeIn management system",
    articles: [
      "how-to-create-your-first-appointment",
      "setting-up-visitor-registration",
      "configuring-email-notifications",
      "basic-dashboard-overview"
    ]
  },
  {
    icon: Users,
    title: "User Management",
    description: "Manage employees, visitors, and user permissions",
    articles: [
      "adding-and-managing-employees",
      "visitor-registration-process",
      "user-roles-and-permissions",
      "bulk-user-import",
      "managing-visitor-check-in-and-check-out"
    ]
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Learn about security features and data protection",
    articles: [
      "data-encryption-and-security",
      "privacy-policy-compliance",
      "access-control-settings",
      "audit-trail-features"
    ]
  }
]
