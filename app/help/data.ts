import { Calendar, Users, Shield, Book, Video, Phone } from "lucide-react";

export interface HelpArticle {
    id: string;
    title: string;
    slug: string;
    category: "Getting Started" | "User Management" | "Security & Privacy" | "Troubleshooting" | "Reporting";
    description: string;
    content: string;
    lastUpdated: string;
    readTime: string;
    image?: string;
}

export const helpArticles: HelpArticle[] = [
    // Getting Started
    {
        id: "onboarding-guide",
        title: "SafeIn Onboarding: Complete Step-by-Step Guide",
        slug: "safein-onboarding-guide",
        category: "Getting Started",
        description: "The ultimate guide for new users: From first login to managing your entire visitor ecosystem.",
        readTime: "10 min read",
        lastUpdated: "Mar 2026",
        image: "/images/features/workforce_dashboard_hero_1772358658740.png",
        content: `
      <h2>Welcome to SafeIn!</h2>
      <p>Congratulations on joining India's most advanced visitor intelligence platform. This guide is designed to take you from your first login to a fully operational, high-security digital reception.</p>
      
      <p>In <strong>SafeIn</strong>, the workflow is designed to be intuitive. After you log in, follow these critical steps to ensure your organization is secured and efficient.</p>

      <div style="margin: 24px 0;">
        <img src="/images/features/workforce_dashboard_hero_1772358658740.png" alt="SafeIn Dashboard Overview" style="border-radius: 12px; width: 100%; height: auto; border: 1px solid #eee;" />
      </div>

      <hr />

      <h2>Step 1: Your First Login & Profile Setup</h2>
      <p>Once you receive your login credentials, head over to the login page. After successful authentication, your first priority should be your account settings.</p>
      <ul>
          <li><strong>Complete Business Profile:</strong> Navigate to <strong>Settings > Profile</strong>. Add your company name, official address, and contact details.</li>
          <li><strong>Upload Branding:</strong> Go to the branding section to upload your company logo. This logo will appear on visitor invite emails and printed badges.</li>
          <li><strong>Configure Notifications:</strong> Ensure your SMTP or Email settings are active under <strong>Settings > Email</strong> so that invites reach your guests instantly.</li>
      </ul>

      <h2>Step 2: Employee Registration & 'Workforce Hub'</h2>
      <p>A visitor management system is only effective if your employees are registered. Your staff members act as 'Hosts' for visitors.</p>
      <ul>
          <li><strong>Manual Registration:</strong> Admins can add individual employees via the <strong>Workforce Hub</strong>. Each employee will need a unique email or mobile number to receive arrival alerts.</li>
          <li><strong>Bulk Import & Onboarding:</strong> For larger teams, use the <strong>Bulk CSV/Excel Import</strong> feature. This allows you to onboard hundreds of employees in one click.</li>
          <li><strong>OTP Verification:</strong> When employees join, they verify their accounts using a secure OTP system, ensuring only authorized personnel can act as hosts.</li>
          <li><strong>Define Roles:</strong> Assign roles such as <em>Admin</em> for full control, or <em>Receptionist</em> for front-desk access only.</li>
      </ul>

      <div style="margin: 24px 0;">
        <img src="/images/features/otp_verification_mobile_1772358411976.png" alt="Employee OTP Verification" style="border-radius: 12px; width: 100%; height: auto; border: 1px solid #eee;" />
      </div>

      <h2>Step 3: Activating 'Smart Appointments'</h2>
      <p>Now that your team is ready, start inviting guests. SafeIn offers two primary ways to schedule visits:</p>
      <ul>
          <li><strong>Priority Booking:</strong> The host fills in the visitor's details directly. The visitor receives an automated <strong>OTP (One-Time Password)</strong> via WhatsApp and Email for secure verification.</li>
          <li><strong>Smart Invite Links:</strong> Send a registration link via WhatsApp or Email. The visitor clicks the link, fills in their own details, and the appointment is automatically booked.</li>
          <li><strong>Pre-Verification:</strong> You can ask visitors to provide their details (like vehicle number or ID) before they even arrive.</li>
      </ul>

      <div style="margin: 24px 0;">
        <img src="/images/features/smart_appointments_hero_1772358159659.png" alt="Smart Appointments Interface" style="border-radius: 12px; width: 100%; height: auto; border: 1px solid #eee;" />
      </div>

      <h2>Step 4: Managing Walk-ins with 'Spot Pass'</h2>
      <p>For visitors who arrive without an appointment, SafeIn provides the <strong>Spot Pass</strong> feature.</p>
      <ul>
          <li><strong>Spot Pass Creation:</strong> The security guard or receptionist can generate a 'Spot Pass' directly from the dashboard.</li>
          <li><strong>Frictionless Entry:</strong> Unlike Priority Bookings, <strong>Spot Pass does not require an OTP</strong>, allowing for rapid registration of walk-in guests.</li>
          <li><strong>Instant Notification:</strong> As soon as a Spot Pass is generated, the assigned host receives an instant alert.</li>
      </ul>

      <div style="margin: 24px 0;">
        <img src="/images/features/spot_pass_hero_1772358331734.png" alt="Spot Pass System" style="border-radius: 12px; width: 100%; height: auto; border: 1px solid #eee;" />
      </div>

      <h2>Step 5: Real-time Employee Chat & Communication</h2>
      <p>One of the most premium features of SafeIn is the <strong>Integrated Messaging System</strong>.</p>
      <ul>
          <li><strong>Host-Visitor Direct Chat:</strong> Hosts can chat directly with their arriving visitors through the dashboard or mobile app.</li>
          <li><strong>Status Updates:</strong> Tell your visitor <em>"I'm on my way"</em> or <em>"Please wait in the cafe"</em> with one click.</li>
          <li><strong>Secure History:</strong> All communication is encrypted and stored in the visitor log for security audits.</li>
      </ul>

      <div style="margin: 24px 0;">
        <img src="/images/features/chat_hero_1772358492233.png" alt="Real-time Chat Feature" style="border-radius: 12px; width: 100%; height: auto; border: 1px solid #eee;" />
      </div>

      <h2>Step 6: Advanced Settings & Core Integrations</h2>
      <p>To fully automate your workflow, you must configure your communication channels under <strong>Settings</strong>.</p>
      <ul>
          <li><strong>SMTP Configuration:</strong> By default, SafeIn sends emails from its official server. To use your own company email (e.g., <em>reception@yourcompany.com</em>), go to <strong>Settings > SMTP</strong>. Enter your server host, port, and credentials to enable white-labeled email invites.</li>
          <li><strong>WhatsApp API Integration:</strong> Enable the <strong>WhatsApp</strong> channel to send secure <strong>OTP codes</strong> and <strong>Smart Invite Links</strong> directly to your visitors' phones. This has a much higher open rate than traditional email.</li>
          <li><strong>SMS Gateway:</strong> Configure <strong>SMS</strong> as a secondary fallback. This ensures that even visitors without an active internet connection receive their entry codes and arrival alerts instantly.</li>
          <li><strong>Notification Center:</strong> In <strong>Settings > Notifications</strong>, you can toggle which events trigger alerts (e.g., <em>Visitor Arrival, Check-out, Messages</em>) and choose the delivery channel (Email, WhatsApp, or SMS) for each specific event.</li>
      </ul>

      <hr />

      <h2>Summary of the Flow</h2>
      <p>1. <strong>Admin Setup:</strong> Profile, Branding & SMTP/WhatsApp Settings <br/>
         2. <strong>Workforce:</strong> Manual or Bulk Employee Registration <br/>
         3. <strong>Operation:</strong> Create Appointments or Spot Passes <br/>
         4. <strong>Communication:</strong> Chat directly with visitors or automate alerts via WhatsApp/SMS <br/>
         5. <strong>Intelligence:</strong> Review dashboard data and audit logs.</p>
      
      <p>If you encounter any issues during these steps, our <strong>24/7 Live Chat</strong> is available right inside your dashboard to assist you.</p>
    `,
    },
    {
        id: "1",
        title: "How to create your first appointment",
        slug: "how-to-create-your-first-appointment",
        category: "Getting Started",
        description: "A comprehensive guide to scheduling and managing visitor appointments in SafeIn.",
        readTime: "5 min read",
        lastUpdated: "Dec 2025",
        image: "/images/features/smart_appointments_hero_1772358159659.png",
        content: `
      <h2>Introduction</h2>
      <p>Scheduling appointments effectively is the cornerstone of a secure and efficient operation. In <strong>SafeIn</strong>, creating an appointment initiates a sequence of automated workflows, including visitor notifications and secure QR code generation.</p>
      
      <p>This guide will walk you through the process of creating a new appointment for a seamless visitor experience.</p>

      <hr />

      <h2>Step-by-Step Guide</h2>

      <h3>1. Accessing the Appointment Module</h3>
      <p>Log in to your SafeIn Dashboard. You can initiate a new appointment from two locations:</p>
      <ul>
          <li><strong>Quick Actions:</strong> Click the <strong>"Make Appointment"</strong> button on the dashboard.</li>
          <li><strong>Sidebar Navigation:</strong> Click on <strong>"Appointments"</strong>, then select <strong>"New Appointment"</strong>.</li>
      </ul>

      <h3>2. Choose Booking Method</h3>
      <p>Decide how you'd like to invite your guest:</p>
      <ul>
          <li><strong>Priority Booking (Manual Entry):</strong> Enter the visitor's Name, Email, and Phone. The system will send them a secure <strong>OTP</strong> to show at the gate.</li>
          <li><strong>Smart Invite Link:</strong> Copy the unique appointment link and send it via WhatsApp/Email. The guest will fill out their own details to complete the booking.</li>
          <li><strong>QR-Based Self-Registration:</strong> Visitors can scan the printed QR code at your entry gate. This opens a registration page on their phone, allowing them to book a visit on-the-spot.</li>
      </ul>

      <blockquote>
        <strong>Pro Tip:</strong> If the visitor has visited before, the system will suggest auto-completing their details from the database (even via QR scan).
      </blockquote>

      <h3>3. Scheduling Details</h3>
      <p>Define the logistics of the visit:</p>
      <ul>
          <li><strong>Date & Time:</strong> Select the arrival date and expected time.</li>
          <li><strong>Visit Type:</strong> Categorize as <em>Interview, Meeting,</em> or <em>Vendor</em> for better reporting.</li>
      </ul>

      <h3>4. Host Assignment</h3>
      <p>By default, you are the host. If scheduling for someone else, select the correct employee from the <strong>"Host"</strong> list. The assigned host will receive instant arrival alerts.</p>

      <h3>5. Review and Confirm</h3>
      <p>Double-check the details and click <strong>"Create Appointment"</strong>.</p>

      <hr />

      <h2>What Happens Next?</h2>
      <p>Immediately after creation, the system triggers:</p>
      <ol>
          <li><strong>Visitor Notification:</strong> The guest receives an automated message with the <strong>OTP</strong> (for Priority Bookings) or the **Form Link** (for Smart Invite Links).</li>
          <li><strong>Host Notification:</strong> You (or the assigned host) will receive a confirmation alert once the appointment is finalized.</li>
      </ol>
    `,
    },
    {
        id: "2",
        title: "Setting up visitor registration",
        slug: "setting-up-visitor-registration",
        category: "Getting Started",
        description: "Configure the check-in process and custom fields for your visitors.",
        readTime: "6 min read",
        lastUpdated: "Dec 2025",
        image: "/images/features/otp_verification_mobile_1772358411976.png",
        content: `
      <h2>Overview</h2>
      <p>The visitor registration flow is the first touchpoint for your guests. SafeIn allows you to customize how visitors are onboarded at the security desk or via the <strong>Spot Pass</strong> system.</p>

      <h2>Configuration Steps</h2>

      <h3>1. Accessing Registration Settings</h3>
      <p>Navigate to <strong>Settings</strong> > <strong>Visitor Registration</strong>. Here you can define the requirements for entry.</p>

      <h3>2. Customizing Data Fields</h3>
      <p>Decide what information is mandatory for entry. Common configurations include:</p>
      <ul>
          <li><strong>Standard Fields:</strong> Name, Email, Phone, Company.</li>
          <li><strong>Required Fields:</strong> Mark fields as mandatory to ensure complete visitor logs.</li>
      </ul>

      <h3>3. ID Scanning & Documents</h3>
      <p>Enable <strong>OCR ID Scanning</strong> to allow security guards to scan visitor IDs and auto-fill details instantly, reducing manual errors.</p>
      <p>For Priority Bookings, the visitor must provide the <strong>OTP</strong> received on their phone to the guard for verification.</p>

      <h2>Gatekeeper Interface</h2>
      <p>Security personnel use the <strong>Gatekeeper App</strong> to verify visitor details and OTPs. Ensure your guards have the appropriate device permissions assigned in the <strong>Workforce Hub</strong>.</p>
    `,
    },
    {
        id: "3",
        title: "Configuring Communication Channels",
        slug: "configuring-email-notifications",
        category: "Getting Started",
        description: "Master the communication flow with automated alerts via SMTP, WhatsApp, and SMS.",
        readTime: "5 min read",
        lastUpdated: "Mar 2026",
        content: `
      <h2>The Importance of Multi-Channel Communication</h2>
      <p>Automated status updates ensure that your hosts and security staff are always in sync. SafeIn's notification engine handles these communications via three primary channels.</p>

      <h2>1. SMTP (White-Labeled Email)</h2>
      <p>By default, notifications are sent from SafeIn. To build better trust with your guests, configure your own email server.</p>
      <ul>
          <li>Navigate to <strong>Settings > SMTP</strong>.</li>
          <li>Enter your Host (e.g., mail.yourcompany.com), Port, and Password.</li>
          <li>Once active, all visitor invites and check-in emails will come from your official email address.</li>
      </ul>

      <h2>2. WhatsApp Notifications</h2>
      <p>WhatsApp is our most effective channel with near-instant open rates and high trust.</p>
      <ul>
          <li><strong>Secure OTPs:</strong> Visitors receive their 6-digit entry codes directly on WhatsApp.</li>
          <li><strong>Smart Links:</strong> Send interactive registration forms that open directly in the chat interface.</li>
          <li><strong>Activation:</strong> Toggle this on under <strong>Settings > WhatsApp</strong>.</li>
      </ul>

      <h2>3. SMS Fallback</h2>
      <p>Ensure 100% reach even when your visitor doesn't have an active data connection.</p>
      <ul>
          <li>Configure SMS settings under <strong>Settings > SMS</strong>.</li>
          <li>Useful for remote locations or visitors without smartphones.</li>
      </ul>
      
      <h2>Notification Center Control</h2>
      <p>Go to <strong>Settings</strong> > <strong>Notifications</strong>. You can map specific events to these channels. For example, you might want <em>Visitor Arrival</em> to trigger both an Email and a WhatsApp alert, but <em>Check-out</em> to only send an Email.</p>
    `,
    },
    {
        id: "4",
        title: "Basic dashboard overview",
        slug: "basic-dashboard-overview",
        category: "Getting Started",
        description: "Unlocking the power of real-time operational data on your dashboard.",
        readTime: "5 min read",
        lastUpdated: "Dec 2025",
        content: `
      <h2>Your Command Center</h2>
      <p>The SafeIn Dashboard provides a high-level view of your facility's visitor activity. It is designed to give Admins and Hosts situational awareness.</p>

      <h2>Key Metrics Cards</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
            <h3>Pending</h3>
            <p>Visitors scheduled for today who have not yet arrived.</p>
        </div>
        <div>
            <h3>Active / Checked In</h3>
            <p>The total number of guests currently inside the building.</p>
        </div>
        <div>
            <h3>Completed</h3>
            <p>Visits that have concluded. These records are archived for reporting.</p>
        </div>
      </div>

      <h2>Analytical Trends</h2>
      
      <h3>Visitor Distribution</h3>
      <p>Visual charts identify peak arrival times, helping you manage gate security and entry flow more efficiently.</p>

      <h2>Real-Time Activity Feed</h2>
      <p>The dashboard feed shows a live log of actions: <em>"John Doe checked in"</em>, <em>"New Appointment created"</em>. This provides a granular audit trail of all entry events.</p>
    `,
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
        image: "/images/features/workforce_dashboard_hero_1772358658740.png",
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

      <h2>The Verification Process</h2>
      <p>Security is our top priority. For an account to become fully operational, every employee must be verified.</p>
      <ul>
          <li><strong>Verification Link/OTP:</strong> When an employee is added, they receive a secure invitation. They must click the link and verify their identity via a one-time password (OTP) sent to their official email or phone.</li>
          <li><strong>Why it's Required:</strong> This ensures that only authorized personnel can act as 'Hosts', create appointments, and receive real-time visitor alerts.</li>
          <li><strong>Resending Invites:</strong> If an employee hasn't verified their account, you can use the <strong>"Resend Verification"</strong> button from the employee management table.</li>
      </ul>

      <div style="margin: 24px 0;">
        <img src="/images/features/otp_verification_mobile_1772358411976.png" alt="Employee Verification Interface" style="border-radius: 12px; width: 100%; height: auto; border: 1px solid #eee;" />
      </div>

      <h2>Editing and Offboarding</h2>
      <p>Click on any employee row to edit their details. If an employee leaves:</p>
      <ul>
          <li><strong>Do NOT Delete:</strong> Deleting a user removes their historical appointment data, breaking your audit trails.</li>
          <li><strong>Deactivate Instead:</strong> Toggle the "Active" status to "Inactive". This prevents login but preserves all history.</li>
      </ul>
    `,
    },
    {
        id: "6",
        title: "Visitor registration process",
        slug: "visitor-registration-process",
        category: "User Management",
        description: "Understanding the end-to-end lifecycle of a visit from the guest's perspective.",
        readTime: "5 min read",
        lastUpdated: "Dec 2025",
        image: "/images/features/spot_pass_hero_1772358331734.png",
        content: `
      <h2>The Visitor Journey</h2>
      <p>A smooth registration process reflects positively on your company brand. Here is the standard workflow using SafeIn's Smart Appointment and Spot Pass systems:</p>

      <h3>Phase 1: Pre-Arrival & Scheduling</h3>
      <p>There are two primary ways to schedule a visit:</p>
      <ul>
          <li><strong>Priority Booking:</strong> The host enters the visitor's details. The visitor receives an automated <strong>OTP (One-Time Password)</strong> via WhatsApp and Email for secure verification.</li>
          <li><strong>Smart Invite Link:</strong> The host sends a link. The visitor opens the link, fills in their details, and the appointment is booked once submitted.</li>
      </ul>

      <h3>Phase 2: Arrival & Verification</h3>
      <p>When the visitor arrives at the entry gate:</p>
      <ul>
          <li><strong>Priority Booking:</strong> The visitor tells the <strong>OTP</strong> to the Guard. The Guard enters it into the system to verify the identity and appointment instantly.</li>
          <li><strong>Smart Invite Link Booking:</strong> The Guard checks the visitor's Name/Details in the "Expected Today" list on the dashboard.</li>
          <li><strong>Spot Pass (Walk-In):</strong> Visitors without a prior invite can be registered on the spot by the Guard. <strong>No OTP is required</strong> for Spot Pass entries.</li>
      </ul>

      <h3>Phase 3: Real-Time Communication</h3>
      <p>Once verified, the host receives an instant <strong>Smart Notification</strong>. The host and visitor can use the built-in <strong>Real-time Chat</strong> to coordinate the meeting or provide directions.</p>

      <h3>Phase 4: Check-Out</h3>
      <p>On their way out, the visitor's departure is timestamped by the Gatekeeper, providing an accurate audit trail in the <strong>Workforce Hub</strong>.</p>
    `,
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
      <p><strong>Capabilities:</strong> Can check people in/out, verify QR codes, and edit visitor details. <strong>Cannot</strong> access system settings, billing, or export full databases.</p>

      <h3>4. Employee (Host)</h3>
      <p><strong>Access:</strong> Self-Service Only.</p>
      <p><strong>Capabilities:</strong> Can only see and manage <em>their own</em> appointments and history. Cannot see visitors invited by colleagues.</p>
    `,
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
    `,
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
    `,
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
    `,
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
    `,
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
            <td>Updating branding, disabling features, or updating profile info.</td>
        </tr>
      </table>

      <h3>Exporting Logs</h3>
      <p>Logs can be exported to JSON or CSV format for ingestion into your SIEM tools (like Splunk or Datadog) for centralized monitoring.</p>
    `,
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
    `,
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
          <li><strong>Status:</strong> Filter by "Checked In" or "Invited".</li>
          <li><strong>Host:</strong> See visitors for a specific department or person.</li>
      </ul>

      <h3>2. Export</h3>
      <p>Click the <strong>"Export"</strong> button. Select format: <strong>CSV</strong> (Excel compatible) or <strong>PDF</strong> (Print friendly).</p>
      <p><em>Note: Large exports (10,000+ records) may take a few minutes and will be emailed to you when ready.</em></p>

      <h2>Reporting</h2>
      <p>Automated summaries can be configured to keep everyone informed of arrival patterns and security events.</p>
    `,
    },
    {
        id: "15",
        title: "Managing visitor check-in and check-out",
        slug: "managing-visitor-check-in-and-check-out",
        category: "User Management",
        description: "Operational guide for Gatekeepers and staff handling guests.",
        readTime: "4 min read",
        lastUpdated: "Dec 2025",
        content: `
        <h2>Operational Checklist</h2>
        <p>The main operations occur in the **Visitor Log** and via the **Gatekeeper App**.</p>

        <h3>Processing a Check-In</h3>
        <p>When a visitor arrives:</p>
        <ol>
            <li><strong>Verify OTP (for VIPs):</strong> Request the OTP from the visitor and enter it into the Gatekeeper dashboard.</li>
            <li><strong>Check Expected List:</strong> For invite-link arrivals, search for their name in the "Expected Today" list.</li>
            <li><strong>Spot Pass:</strong> For walk-ins, click <strong>"Spot Pass"</strong> and enter their details directly (no OTP needed).</li>
            <li><strong>Submit:</strong> Click <strong>"Check In"</strong> to timestamp their entry.</li>
        </ol>

        <h3>Processing a Check-Out</h3>
        <p>Maintaining an accurate building log is vital:</p>
        <ul>
            <li><strong>Individual Check-Out:</strong> At the exit point, the Gatekeeper searches the name in the "Active" list and clicks "Check Out".</li>
            <li><strong>Status Update:</strong> The dashboard is updated instantly for all admins.</li>
        </ul>
      `,
    },
    {
        id: "qr-checkin-guide",
        title: "Understanding QR Check-in & Self-Service",
        slug: "qr-checkin-self-service-guide",
        category: "Security & Privacy",
        description: "How to set up and use touchless QR check-in for a friction-free visitor experience.",
        readTime: "4 min read",
        lastUpdated: "Mar 2026",
        content: `
      <h2>The Power of Touchless QR Entry</h2>
      <p>In the modern workspace, speed and security must go hand-in-hand. SafeIn's <strong>QR Check-in</strong> system allows visitors to register themselves using their own smartphones, reducing wait times at the reception desk.</p>

      <h2>How it Works</h2>
      <p>The flow is designed to be simple, secure, and entirely digital:</p>
      <ol>
          <li><strong>Printing the QR:</strong> The Admin generates and prints a unique QR code from the dashboard.</li>
          <li><strong>Visitor Scan:</strong> Upon arrival, the visitor scans the QR code at the entry gate.</li>
          <li><strong>Self-Registration:</strong> A secure mobile form opens on the visitor's phone. They enter their details (Name, Phone, Purpose of Visit).</li>
          <li><strong>Host Approval:</strong> Once submitted, the Host receives an instant alert to approve or decline the visit.</li>
          <li><strong>Entry Pass:</strong> After approval, a digital entry pass is generated on the visitor's phone.</li>
      </ol>

      <h2>Setting Up Your QR Gate</h2>
      <p>To activate this feature for your office:</p>
      <ul>
          <li>Navigate to <strong>Settings > QR Check-in</strong>.</li>
          <li><strong>Configure Fields:</strong> Choose which visitor details are mandatory during self-scan.</li>
          <li><strong>Download QR:</strong> Click the "Download & Print" button. We recommend placing this QR code at eye level on your main entry gate or reception desk.</li>
          <li><strong>Verification Level:</strong> You can choose to require an OTP verification even for QR scans for extra security.</li>
      </ul>

      <h2>Benefits of QR Check-in</h2>
      <ul>
          <li><strong>Touchless:</strong> Visitors don't need to touch a shared tablet or physical logbook.</li>
          <li><strong>Zero Queues:</strong> Multiple visitors can scan and register simultaneously.</li>
          <li><strong>Privacy:</strong> Visitor data is entered directly on their private device, not visible to others.</li>
      </ul>
      
      <blockquote>
        <strong>Note:</strong> QR Check-in works perfectly alongside Priority Bookings and Spot Passes, giving you 360-degree control over facility entry.
      </blockquote>
    `,
    },
];

export const helpCategories = [
    {
        icon: Calendar,
        title: "Onboarding & System Setup",
        description: "Master the fundamentals of your SafeIn platform: from first login to core configuration.",
        articles: [
            "safein-onboarding-guide",
            "how-to-create-your-first-appointment",
            "setting-up-visitor-registration",
        ],
    },
    {
        icon: Users,
        title: "Workforce Hub & Visitor Logs",
        description: "Manage your employee directory, visitor registrations, and granular user roles.",
        articles: [
            "adding-and-managing-employees",
            "visitor-registration-process",
            "user-roles-and-permissions",
        ],
    },
    {
        icon: Shield,
        title: "Security Controls & Compliance",
        description: "Explore advanced security settings, QR protocols, and data protection standards.",
        articles: [
            "data-encryption-and-security",
            "privacy-policy-compliance",
            "access-control-settings",
            "qr-checkin-guide",
        ],
    },
];
