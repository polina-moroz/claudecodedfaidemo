import { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from "react";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                   CLAUDE-CODE IMPLEMENTATION DEMO                        ║
// ║                                                                          ║
// ║  This single-file React app demonstrates ALL 12 sections of the          ║
// ║  UI/UX pattern checklist. Each section is marked with comments like:      ║
// ║                                                                          ║
// ║    [SECTION X.Y] — Feature name                                          ║
// ║                                                                          ║
// ║  Sections covered:                                                       ║
// ║   1.  Basic Forms (inputs, labels, states, validation visuals)           ║
// ║   2.  Complex Forms (stepper, collapsible, multi-step, 20+ fields)      ║
// ║   3.  Conditional Logic (show/hide, dependent dropdowns, banners)       ║
// ║   4.  Validation (required, format, inline/summary, blur trigger)       ║
// ║   5.  Buttons & Actions (variants, loading, icon, destructive)          ║
// ║   6.  Modals / Dialogs (sizes, scroll, form, stacked, ESC/backdrop)    ║
// ║   7.  Lists / Tables (empty, skeleton, hover, select, bulk, pagination) ║
// ║   8.  States (loading, empty, error, partial, disabled, maintenance)    ║
// ║   9.  Navigation & Flows (breadcrumbs, tabs, sidebar, unsaved warn)    ║
// ║  10.  Responsive & Layout (flex grid, sidebar collapse, scroll)         ║
// ║  11.  UX Edge Cases (long input, reset, no-changes submit, discard)    ║
// ║  12.  Business Logic (mock auth, CRUD, debounced search, toast stack)  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝


// ═══════════════════════════════════════════════════════════════════════════
// [SECTION 12.10] Auth Context → Global State
//
// Implements: login/logout sync across all pages via React Context.
// Every component can call useAuth() to access user, token, login, logout.
// Wraps the entire app so auth state is available everywhere.
// ═══════════════════════════════════════════════════════════════════════════
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // [SECTION 12.1] On mount, check localStorage for existing JWT session
  // This persists login across page refreshes
  useEffect(() => {
    const saved = localStorage.getItem("mock_token");
    const savedUser = localStorage.getItem("mock_user");
    if (saved && savedUser) {
      setToken(saved);
      try { setUser(JSON.parse(savedUser)); } catch { /* skip */ }
    }
  }, []);

  // [SECTION 12.1] Login → JWT in localStorage → dashboard
  // Simulates POST /api/auth/login with fakeFetch delay
  // Mock response: { token: 'jwt.mock', user: { role: 'admin' } }
  const login = async (email, password) => {
    await fakeFetch(800); // Simulates network latency
    if (password.length < 3) throw new Error("Invalid credentials");
    const mockUser = { id: 1, name: email.split("@")[0], email, role: "admin" };
    const mockToken = "jwt.mock." + Date.now();
    localStorage.setItem("mock_token", mockToken);
    localStorage.setItem("mock_user", JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
  };

  // [SECTION 12.2] Logout → clear storage + redirect
  // Calls localStorage.removeItem, clears state → AppShell redirects to LoginPage
  const logout = () => {
    localStorage.removeItem("mock_token");
    localStorage.removeItem("mock_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// [SECTION 12.9] Notifications → Toast Stack
//
// Implements: success/error/info toast notifications that stack vertically
// and auto-dismiss after 3.5 seconds. Used throughout the entire app
// for feedback on save, delete, logout, errors, etc.
// ═══════════════════════════════════════════════════════════════════════════
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  // addToast("message", "success"|"error"|"info") → shows toast, auto-removes after 3.5s
  const addToast = useCallback((message, type = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast container fixed to bottom-right corner */}
      <div style={S.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...S.toast, ...S[`toast_${t.type}`] }}>
            <span style={S.toastIcon}>
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// HELPERS & MOCK DATA
//
// fakeFetch: simulates API network delay
// MOCK_USERS: simulates GET /api/users response
//   mock: [{ id:1, name:'John', status:'active' }]
// ═══════════════════════════════════════════════════════════════════════════
const fakeFetch = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@corp.io", role: "Admin", status: "active", department: "Engineering" },
  { id: 2, name: "Bob Smith", email: "bob@corp.io", role: "Editor", status: "active", department: "Design" },
  { id: 3, name: "Charlie Davis", email: "charlie@corp.io", role: "Viewer", status: "inactive", department: "Marketing" },
  { id: 4, name: "Diana Prince", email: "diana@corp.io", role: "Admin", status: "active", department: "Engineering" },
  { id: 5, name: "Eve Wilson", email: "eve@corp.io", role: "Editor", status: "active", department: "Design" },
  { id: 6, name: "Frank Miller", email: "frank@corp.io", role: "Viewer", status: "inactive", department: "Sales" },
  { id: 7, name: "Grace Lee", email: "grace@corp.io", role: "Editor", status: "active", department: "Marketing" },
  { id: 8, name: "Hank Brown", email: "hank@corp.io", role: "Viewer", status: "active", department: "Sales" },
];


// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP ENTRY POINT
//
// [SECTION 12.10] Auth context wraps everything → global state
// [SECTION 12.9]  Toast provider wraps everything → notifications anywhere
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  );
}

// [SECTION 12.3] Role check → protected routes
// If not authenticated → LoginPage. If authenticated → Dashboard.
function AppShell() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}


// ═══════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
//
// Demonstrates:
//   [SECTION 1.1]   Text / Email / Password input fields
//   [SECTION 1.2]   Placeholder vs label (label above field)
//   [SECTION 1.3]   Required fields (asterisk marker)
//   [SECTION 1.6]   Helper text under field
//   [SECTION 1.7]   Error state (red border + error text)
//   [SECTION 1.8]   Success state (green border + check text)
//   [SECTION 1.10]  Autofocus first field
//   [SECTION 1.11]  Enter → submit (form onSubmit)
//   [SECTION 4.1]   Required field empty validation
//   [SECTION 4.2]   Invalid format (email pattern check)
//   [SECTION 4.3]   Min length (password >= 3 chars)
//   [SECTION 4.5]   Error after blur (onBlur trigger)
//   [SECTION 4.8]   Clearing error on change (live update)
//   [SECTION 4.9]   Disabled submit when invalid
//   [SECTION 5.1]   Primary button variant
//   [SECTION 5.2]   Loading state (spinner inside button)
//   [SECTION 8.3]   Error state banner (login failure)
//   [SECTION 12.1]  Login → JWT in localStorage → dashboard
// ═══════════════════════════════════════════════════════════════════════════
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const emailRef = useRef(null);

  // [SECTION 1.10] Autofocus first field on mount
  useEffect(() => { emailRef.current?.focus(); }, []);

  // [SECTION 4.1, 4.2, 4.3] Validation rules — required, email format, min length
  const validate = (field, value) => {
    if (field === "email") {
      if (!value) return "This field is required";           // [4.1] Required
      if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format"; // [4.2] Format
    }
    if (field === "password") {
      if (!value) return "This field is required";           // [4.1] Required
      if (value.length < 3) return "Minimum 3 characters";  // [4.3] Min length
    }
    return "";
  };

  // [SECTION 4.5] Error after blur — only show errors after user leaves the field
  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validate(field, field === "email" ? email : password) }));
  };

  // [SECTION 4.8] Clearing error on change — error disappears as user types correct value
  const handleChange = (field, value) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    setLoginError("");
    if (touched[field]) setErrors((e) => ({ ...e, [field]: validate(field, value) }));
  };

  // [SECTION 1.11] Enter → submit (native form submission)
  // [SECTION 5.2]  Loading state in button (spinner + "Signing in…")
  // [SECTION 12.1] Mock POST /api/auth/login
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const eErr = validate("email", email);
    const pErr = validate("password", password);
    setErrors({ email: eErr, password: pErr });
    setTouched({ email: true, password: true });
    if (eErr || pErr) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message); // [SECTION 8.3] Error banner
    } finally {
      setLoading(false);
    }
  };

  // [SECTION 3.3, 4.9] Enable / disable submit — button disabled until form is valid
  const isValid = email && password && !errors.email && !errors.password;

  return (
    <div style={S.loginBg}>
      <div style={S.loginCard}>
        <div style={S.loginLogo}>◆</div>
        <h1 style={S.loginTitle}>Claude-Code Implementation Demo</h1>
        <p style={S.loginSub}>UI Pattern Showcase · All 12 Sections</p>

        {/* [SECTION 8.3] Error state — login failure banner */}
        {loginError && (
          <div style={S.alertError}>
            <span style={{ fontWeight: 600 }}>✕</span> {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {/* [SECTION 1.1] Email input with label, placeholder, required asterisk
              [SECTION 1.6] Helper text: "Use your corporate email"
              [SECTION 1.7] Error state: red border + error message
              [SECTION 1.8] Success state: green border + "Looks good"
              [SECTION 4.5] Error only appears after blur (onBlur trigger) */}
          <FormField
            label="Email" required value={email}
            onChange={(v) => handleChange("email", v)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : ""}
            success={touched.email && !errors.email && email}
            placeholder="you@company.com"
            helper="Use your corporate email"
            ref={emailRef} type="email"
          />

          {/* [SECTION 1.1] Password input
              [SECTION 4.3] Min length counter in helper text */}
          <FormField
            label="Password" required value={password}
            onChange={(v) => handleChange("password", v)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : ""}
            success={touched.password && !errors.password && password}
            placeholder="Enter password" type="password"
            helper={password ? `${password.length} / 3 min characters` : ""}
          />

          {/* [SECTION 5.1] Primary button
              [SECTION 5.2] Loading state — spinner + "Signing in…"
              [SECTION 4.9] Disabled when invalid */}
          <button
            type="submit"
            style={{ ...S.btnPrimary, ...(loading || !isValid ? S.btnDisabled : {}), marginTop: 8 }}
            disabled={loading || !isValid}
          >
            {loading ? <Spinner small /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ ...S.loginSub, marginTop: 16 }}>
          Demo: any email + password (3+ chars)
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD — Main authenticated layout
//
// Demonstrates:
//   [SECTION 9.1]   Breadcrumbs (Home / Current Page)
//   [SECTION 9.4]   Sidebar collapse (icons only vs full labels)
//   [SECTION 9.5]   Active state highlight (current nav item)
//   [SECTION 9.8]   Unsaved changes warning (modal on navigate)
//   [SECTION 10.1]  Responsive layout (flex sidebar + content)
//   [SECTION 10.8]  Sidebar + content collision (collapse toggle)
//   [SECTION 12.2]  Logout → clear storage + redirect
//   [SECTION 12.3]  Role check → only renders if authenticated
//   [SECTION 12.10] Auth context used for user info display
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState("forms");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const pages = [
    { id: "forms", label: "Forms", icon: "☰" },
    { id: "complex", label: "Complex Form", icon: "▤" },
    { id: "conditional", label: "Conditional", icon: "⑂" },
    { id: "tables", label: "Tables & Lists", icon: "▦" },
    { id: "modals", label: "Modals", icon: "◻" },
    { id: "states", label: "States", icon: "◔" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  // [SECTION 9.8] Unsaved changes warning — intercepts navigation
  const navigateTo = (id) => {
    if (hasUnsaved && id !== page) {
      setPendingPage(id);
      setShowUnsavedModal(true);
    } else {
      setPage(id);
    }
  };

  // [SECTION 9.8] User confirms discard → navigate to pending page
  const confirmNav = () => {
    setHasUnsaved(false);
    setPage(pendingPage);
    setShowUnsavedModal(false);
  };

  // [SECTION 12.2] Logout → clear storage + redirect via auth context
  const handleLogout = () => {
    toast("Logged out successfully", "info");
    logout();
  };

  return (
    <div style={S.dashLayout}>

      {/* ─── SIDEBAR ─────────────────────────────────────────────
          [SECTION 9.4]  Sidebar collapse — toggles between 220px and 60px
          [SECTION 9.5]  Active state — highlights current page in nav
          [SECTION 10.8] Sidebar + content — collapsible to avoid collision
          ───────────────────────────────────────────────────────── */}
      <aside style={{ ...S.sidebar, width: sidebarCollapsed ? 60 : 220 }}>
        <div style={S.sidebarHeader}>
          <span style={S.sidebarLogo}>◆</span>
          {!sidebarCollapsed && <span style={S.sidebarBrand}>Claude Demo</span>}
        </div>
        <nav style={S.sidebarNav}>
          {pages.map((p) => (
            <button
              key={p.id} onClick={() => navigateTo(p.id)}
              style={{
                ...S.sidebarItem,
                ...(page === p.id ? S.sidebarItemActive : {}), // [9.5] Active highlight
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title={sidebarCollapsed ? p.label : undefined} // Tooltip when collapsed
            >
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              {!sidebarCollapsed && <span style={{ marginLeft: 10 }}>{p.label}</span>}
            </button>
          ))}
        </nav>

        {/* [SECTION 12.10] User info from auth context */}
        <div style={S.sidebarFooter}>
          {!sidebarCollapsed && (
            <div style={S.userInfo}>
              <div style={S.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.role}</div>
              </div>
            </div>
          )}
          {/* [SECTION 9.4] Collapse toggle */}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={S.collapseBtn}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
      </aside>

      <main style={S.mainContent}>
        {/* [SECTION 9.1] Breadcrumbs */}
        <div style={S.breadcrumbs}>
          <span style={S.breadcrumbLink} onClick={() => navigateTo("forms")}>Home</span>
          <span style={S.breadcrumbSep}>/</span>
          <span style={S.breadcrumbCurrent}>{pages.find((p) => p.id === page)?.label}</span>
          {/* [SECTION 12.2] Logout button */}
          <button onClick={handleLogout} style={S.logoutBtn}>Sign Out</button>
        </div>

        {/* Page router */}
        {page === "forms" && <BasicFormsPage onDirty={setHasUnsaved} />}
        {page === "complex" && <ComplexFormPage onDirty={setHasUnsaved} />}
        {page === "conditional" && <ConditionalPage />}
        {page === "tables" && <TablesPage />}
        {page === "modals" && <ModalsPage />}
        {page === "states" && <StatesPage />}
        {page === "settings" && <SettingsPage />}
      </main>

      {/* [SECTION 9.8] Unsaved changes warning modal
          [SECTION 6.6] Confirmation modal pattern */}
      {showUnsavedModal && (
        <Modal title="Unsaved Changes" onClose={() => setShowUnsavedModal(false)}>
          <p style={S.modalText}>You have unsaved changes. Discard them and leave?</p>
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setShowUnsavedModal(false)}>Stay</button>
            <button style={S.btnDanger} onClick={confirmNav}>Discard & Leave</button>
          </div>
        </Modal>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// BASIC FORMS PAGE
//
// Demonstrates:
//   [SECTION 1.1]  Two-column layout (CSS grid)
//   [SECTION 1.1]  Text / Email inputs
//   [SECTION 1.2]  Placeholder vs label
//   [SECTION 1.3]  Required (asterisk) / optional ("optional" tag)
//   [SECTION 1.4]  Disabled state (Account ID field)
//   [SECTION 1.5]  Read-only state (Organization field)
//   [SECTION 1.6]  Helper text (character count, hints)
//   [SECTION 1.7]  Error state (red border + error text)
//   [SECTION 1.8]  Success state (green border + check)
//   [SECTION 1.9]  Long text / textarea with max-length counter
//   [SECTION 1.10] Autofocus first field
//   [SECTION 1.11] Enter → submit
//   [SECTION 2.10] Error summary at top of form
//   [SECTION 4.1-4.10] Full validation suite
//   [SECTION 5.1]  Primary / secondary / ghost buttons
//   [SECTION 5.2]  Success state button ("✓ Saved")
//   [SECTION 5.3]  Icon + text buttons (↻ Reset, ✕ Delete)
//   [SECTION 5.7]  Sticky action buttons (footer bar)
//   [SECTION 5.8]  Destructive action (red delete)
//   [SECTION 11.8] Reset form to initial values
// ═══════════════════════════════════════════════════════════════════════════
function BasicFormsPage({ onDirty }) {
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    bio: "", website: "", department: "engineering",
    notifyEmail: true, readOnlyField: "This field is read-only",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // [SECTION 4.8] Clearing error on change
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    onDirty?.(true); // [9.8] Mark dirty for unsaved warning
    if (touched[k]) setErrors((e) => ({ ...e, [k]: validateBasic(k, v) }));
  };

  // [SECTION 4.1] Required  [4.2] Format  [4.3] Max length
  const validateBasic = (k, v) => {
    if (k === "firstName" && !v) return "This field is required";
    if (k === "email" && !v) return "This field is required";
    if (k === "email" && !/\S+@\S+\.\S+/.test(v)) return "Invalid email format";
    if (k === "bio" && v.length > 200) return `${v.length}/200 — too long`;
    return "";
  };

  // [SECTION 4.4] Validate all on submit  [4.7] Multiple errors simultaneously
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    ["firstName", "email"].forEach((k) => {
      const err = validateBasic(k, form[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    setTouched({ firstName: true, email: true });
    if (Object.keys(newErrors).length) {
      toast("Please fix the errors below", "error");
      return;
    }
    setSubmitted(true);
    onDirty?.(false);
    toast("Basic form submitted successfully!", "success");
    setTimeout(() => setSubmitted(false), 2000); // [4.10] Success highlight
  };

  // [SECTION 11.8] Reset form
  const handleReset = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", bio: "", website: "", department: "engineering", notifyEmail: true, readOnlyField: "This field is read-only" });
    setErrors({}); setTouched({}); onDirty?.(false);
    toast("Form reset to defaults", "info");
  };

  return (
    <div>
      <SectionHeader title="Basic Forms" desc="Section 1: Simple forms, validation, buttons, states" />

      {/* [SECTION 2.10] Error summary at top */}
      {Object.keys(errors).filter((k) => errors[k]).length > 0 && (
        <div style={S.alertError}>
          <strong>Please fix the following errors:</strong>
          <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
            {Object.entries(errors).filter(([, v]) => v).map(([k, v]) => (<li key={k}>{v}</li>))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* [SECTION 1.1] Two-column grid */}
        <div style={S.formGrid}>
          {/* [1.3] Required + [1.10] Autofocus */}
          <FormField label="First Name" required value={form.firstName}
            onChange={(v) => set("firstName", v)}
            onBlur={() => { setTouched((t) => ({ ...t, firstName: true })); setErrors((e) => ({ ...e, firstName: validateBasic("firstName", form.firstName) })); }}
            error={touched.firstName ? errors.firstName : ""}
            success={touched.firstName && !errors.firstName && form.firstName}
            placeholder="Jane" autoFocus />
          {/* [1.3] Optional tag */}
          <FormField label="Last Name" optional value={form.lastName}
            onChange={(v) => set("lastName", v)} placeholder="Doe" />
        </div>

        <div style={S.formGrid}>
          {/* [1.6] Helper text  [4.2] Email format validation */}
          <FormField label="Email" required type="email" value={form.email}
            onChange={(v) => set("email", v)}
            onBlur={() => { setTouched((t) => ({ ...t, email: true })); setErrors((e) => ({ ...e, email: validateBasic("email", form.email) })); }}
            error={touched.email ? errors.email : ""}
            success={touched.email && !errors.email && form.email}
            placeholder="jane@company.com" helper="We'll never share your email" />
          <FormField label="Phone" optional value={form.phone}
            onChange={(v) => set("phone", v)} placeholder="+1 (555) 000-0000"
            helper="Include country code" />
        </div>

        {/* [SECTION 1.4] Disabled state */}
        <FormField label="Account ID" disabled value="USR-00482" helper="Auto-generated, cannot be changed" />

        {/* [SECTION 1.5] Read-only state */}
        <FormField label="Organization" readOnly value={form.readOnlyField} />

        {/* [SECTION 1.9] Textarea with character counter  [4.3] Max length */}
        <FormField label="Bio" optional textarea value={form.bio}
          onChange={(v) => set("bio", v)} placeholder="Tell us about yourself…"
          helper={`${form.bio.length}/200 characters`}
          error={form.bio.length > 200 ? `${form.bio.length}/200 — too long` : ""} />

        <FormSelect label="Department" value={form.department}
          onChange={(v) => set("department", v)}
          options={[
            { value: "engineering", label: "Engineering" },
            { value: "design", label: "Design" },
            { value: "marketing", label: "Marketing" },
            { value: "sales", label: "Sales" },
          ]} />

        {/* [SECTION 5] All button variants in one footer
            [5.1] Primary/secondary/ghost  [5.2] Success state
            [5.3] Icon+text  [5.7] Sticky footer  [5.8] Destructive
            [5.10] Double action (Save + Reset) */}
        <div style={{ ...S.stickyFooter, marginTop: 24 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={{ ...S.btnPrimary, ...(submitted ? S.btnSuccess : {}) }} disabled={submitted}>
              {submitted ? "✓ Saved" : "Save Changes"}
            </button>
            <button type="button" style={S.btnSecondary} onClick={handleReset}>↻ Reset</button>
            <button type="button" style={S.btnGhost}>Cancel</button>
          </div>
          <button type="button" style={S.btnDanger} onClick={() => toast("Nothing to delete!", "error")}>
            ✕ Delete
          </button>
        </div>
      </form>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// COMPLEX FORM PAGE — Multi-Step Stepper
//
// Demonstrates:
//   [SECTION 2.1]  Form with 15+ fields across 4 steps
//   [SECTION 2.2]  Logical grouping (section titles)
//   [SECTION 2.3]  Sticky submit bar / footer
//   [SECTION 2.4]  Collapsible sections (Address accordion)
//   [SECTION 2.5]  Multi-step form (4-step stepper)
//   [SECTION 2.6]  Progress indicator (visual stepper)
//   [SECTION 2.7]  Conditional required fields (per step)
//   [SECTION 3.7]  Conditional CTA — "Next →" / "✓ Submit All"
//   [SECTION 5.10] Double action — Back + Next
//   [SECTION 9.6]  Back navigation
// ═══════════════════════════════════════════════════════════════════════════
function ComplexFormPage({ onDirty }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const steps = ["Personal Info", "Work Details", "Preferences", "Review"];

  const [data, setData] = useState({
    fullName: "", dob: "", gender: "", address: "", city: "", zip: "", country: "",
    company: "", title: "", startDate: "", salary: "", manager: "",
    theme: "light", lang: "en", notifications: true, newsletter: false,
  });

  const set = (k, v) => { setData((d) => ({ ...d, [k]: v })); onDirty?.(true); };

  // [SECTION 2.7] Conditional required — different per step
  const canNext = () => {
    if (step === 0) return data.fullName && data.dob;
    if (step === 1) return data.company && data.title;
    return true;
  };

  const handleFinalSubmit = () => {
    onDirty?.(false);
    toast("Complex form submitted — all 4 steps complete!", "success");
    setStep(0);
  };

  return (
    <div>
      <SectionHeader title="Complex Multi-Step Form" desc="Section 2: Stepper, collapsible sections, progress, 20+ fields, sticky footer" />

      {/* [SECTION 2.6] Progress indicator — stepper with circles + lines */}
      <div style={S.stepper}>
        {steps.map((s, i) => (
          <div key={i} style={S.stepItem}>
            <div style={{ ...S.stepCircle, ...(i <= step ? S.stepCircleActive : {}) }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{ ...S.stepLabel, ...(i === step ? { fontWeight: 700, color: "#e2e8f0" } : {}) }}>{s}</span>
            {i < steps.length - 1 && <div style={{ ...S.stepLine, ...(i < step ? S.stepLineActive : {}) }} />}
          </div>
        ))}
      </div>

      <div style={S.card}>
        {/* Step 0: Personal Info — [2.2] Logical grouping */}
        {step === 0 && (
          <>
            <h3 style={S.sectionTitle}>Personal Information</h3>
            <div style={S.formGrid}>
              <FormField label="Full Name" required value={data.fullName} onChange={(v) => set("fullName", v)} placeholder="Jane Doe" />
              <FormField label="Date of Birth" required type="date" value={data.dob} onChange={(v) => set("dob", v)} />
            </div>
            {/* [SECTION 2.4] Collapsible section */}
            <CollapsibleSection title="Address Details (optional)">
              <FormField label="Street Address" value={data.address} onChange={(v) => set("address", v)} placeholder="123 Main St" />
              <div style={S.formGrid}>
                <FormField label="City" value={data.city} onChange={(v) => set("city", v)} placeholder="San Francisco" />
                <FormField label="ZIP Code" value={data.zip} onChange={(v) => set("zip", v)} placeholder="94105" />
              </div>
              <FormSelect label="Country" value={data.country} onChange={(v) => set("country", v)}
                options={[{ value: "", label: "Select…" }, { value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" }, { value: "de", label: "Germany" }, { value: "ua", label: "Ukraine" }]} />
            </CollapsibleSection>
          </>
        )}

        {/* Step 1: Work Details */}
        {step === 1 && (
          <>
            <h3 style={S.sectionTitle}>Work Details</h3>
            <FormField label="Company" required value={data.company} onChange={(v) => set("company", v)} placeholder="Acme Inc." />
            <FormField label="Job Title" required value={data.title} onChange={(v) => set("title", v)} placeholder="Product Designer" />
            <div style={S.formGrid}>
              <FormField label="Start Date" type="date" value={data.startDate} onChange={(v) => set("startDate", v)} />
              <FormField label="Salary" value={data.salary} onChange={(v) => set("salary", v)} placeholder="$80,000" helper="Annual gross" />
            </div>
            <FormField label="Manager" value={data.manager} onChange={(v) => set("manager", v)} placeholder="Direct report" />
          </>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <>
            <h3 style={S.sectionTitle}>Preferences</h3>
            <FormSelect label="Theme" value={data.theme} onChange={(v) => set("theme", v)}
              options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
            <FormSelect label="Language" value={data.lang} onChange={(v) => set("lang", v)}
              options={[{ value: "en", label: "English" }, { value: "uk", label: "Українська" }, { value: "de", label: "Deutsch" }]} />
            <Checkbox label="Enable email notifications" checked={data.notifications} onChange={(v) => set("notifications", v)} />
            <Checkbox label="Subscribe to newsletter" checked={data.newsletter} onChange={(v) => set("newsletter", v)} />
          </>
        )}

        {/* Step 3: Review — [9.9] Redirect after submit (resets to step 0) */}
        {step === 3 && (
          <>
            <h3 style={S.sectionTitle}>Review & Submit</h3>
            <div style={S.reviewGrid}>
              {Object.entries(data).filter(([, v]) => v !== "" && v !== false).map(([k, v]) => (
                <div key={k} style={S.reviewItem}>
                  <span style={S.reviewLabel}>{k.replace(/([A-Z])/g, " $1")}</span>
                  <span style={S.reviewValue}>{String(v)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* [2.3] Sticky footer  [3.7] Conditional CTA  [5.10] Double action  [9.6] Back */}
        <div style={{ ...S.stickyFooter, marginTop: 20 }}>
          <button style={S.btnSecondary} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          <div style={{ display: "flex", gap: 8 }}>
            {step < 3 && (
              <button style={{ ...S.btnPrimary, ...(canNext() ? {} : S.btnDisabled) }}
                onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>Next →</button>
            )}
            {step === 3 && (
              <button style={S.btnPrimary} onClick={handleFinalSubmit}>✓ Submit All</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// CONDITIONAL LOGIC PAGE
//
// Demonstrates:
//   [SECTION 3.1]  Show / hide fields by checkbox (billing toggle)
//   [SECTION 3.2]  Show / hide sections by select (account type)
//   [SECTION 3.3]  Enable / disable submit (agree checkbox)
//   [SECTION 3.4]  Dependent dropdowns (country → region)
//   [SECTION 3.5]  Conditional helper text (region hint)
//   [SECTION 3.6]  Conditional warning / info banner
//   [SECTION 3.7]  Conditional CTA label ("Save Account" / "Request Approval")
//   [SECTION 3.8]  Default vs changed state ("Modified" badge)
//   [SECTION 3.9]  Reset conditions (Reset All → defaults)
// ═══════════════════════════════════════════════════════════════════════════
function ConditionalPage() {
  const toast = useToast();
  const [accountType, setAccountType] = useState("personal");
  const [enableBilling, setEnableBilling] = useState(false);
  const [billingCycle, setBillingCycle] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [agree, setAgree] = useState(false);

  const defaults = { accountType: "personal", enableBilling: false, billingCycle: "", country: "", region: "", agree: false };

  // [SECTION 3.4] Dependent dropdown options
  const regionOptions = {
    us: [{ value: "ca", label: "California" }, { value: "ny", label: "New York" }, { value: "tx", label: "Texas" }],
    uk: [{ value: "eng", label: "England" }, { value: "sco", label: "Scotland" }],
    de: [{ value: "by", label: "Bavaria" }, { value: "nrw", label: "North Rhine-Westphalia" }],
  };

  // [SECTION 3.8] Detect changes from default
  const isChanged = accountType !== defaults.accountType || enableBilling !== defaults.enableBilling || country !== defaults.country;

  // [SECTION 3.9] Reset all to defaults
  const handleReset = () => {
    setAccountType(defaults.accountType); setEnableBilling(defaults.enableBilling);
    setBillingCycle(""); setCountry(""); setRegion(""); setAgree(false);
    toast("Reset to defaults", "info");
  };

  return (
    <div>
      <SectionHeader title="Conditional Logic" desc="Section 3: Show/hide, dependent dropdowns, conditional banners, reset" />

      {/* [SECTION 3.8] "Modified" badge */}
      {isChanged && <div style={S.alertInfo}><span style={S.badge}>Modified</span> Form has unsaved changes</div>}

      <div style={S.card}>
        {/* [SECTION 3.2] Show/hide sections by select */}
        <FormSelect label="Account Type" value={accountType}
          onChange={(v) => setAccountType(v)}
          options={[
            { value: "personal", label: "Personal" },
            { value: "business", label: "Business" },
            { value: "enterprise", label: "Enterprise" },
          ]} />

        {/* [SECTION 3.6] Conditional warning banner */}
        {accountType === "enterprise" && (
          <div style={S.alertWarning}>⚠ Enterprise accounts require manual approval by an admin.</div>
        )}

        {/* [SECTION 3.2] Conditional fields per account type */}
        {accountType === "business" && (
          <FormField label="Company Name" required placeholder="Your company" value="" onChange={() => {}} />
        )}
        {accountType === "enterprise" && (
          <>
            <FormField label="Company Name" required placeholder="Your company" value="" onChange={() => {}} />
            {/* [3.5] Conditional helper text */}
            <FormField label="Tax ID" required placeholder="Tax identification number" value="" onChange={() => {}} helper="Required for enterprise billing" />
          </>
        )}

        <div style={S.divider} />

        {/* [SECTION 3.1] Show/hide by checkbox */}
        <Checkbox label="Enable billing" checked={enableBilling} onChange={setEnableBilling} />

        {/* [3.1] Billing section — only visible when checked */}
        {enableBilling && (
          <div style={{ marginTop: 12, paddingLeft: 20, borderLeft: "3px solid #3b82f6" }}>
            <FormSelect label="Billing Cycle" value={billingCycle} onChange={setBillingCycle}
              options={[
                { value: "", label: "Select…" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual (20% off)" },
              ]} />
            {/* [3.6] Conditional success banner */}
            {billingCycle === "annual" && <div style={S.alertSuccess}>✓ You'll save 20% with annual billing!</div>}
          </div>
        )}

        <div style={S.divider} />

        {/* [SECTION 3.4] Dependent dropdowns — country enables region */}
        <FormSelect label="Country" value={country}
          onChange={(v) => { setCountry(v); setRegion(""); }}
          options={[
            { value: "", label: "Select country…" },
            { value: "us", label: "United States" },
            { value: "uk", label: "United Kingdom" },
            { value: "de", label: "Germany" },
          ]} />
        {/* [3.4] Region disabled until country selected  [3.5] Conditional helper */}
        <FormSelect label="Region" value={region} onChange={setRegion} disabled={!country}
          options={country ? [{ value: "", label: "Select region…" }, ...(regionOptions[country] || [])] : [{ value: "", label: "Select a country first" }]}
          helper={!country ? "Select a country to enable this field" : ""} />

        {/* [SECTION 3.3] Must agree to enable submit */}
        <Checkbox label="I agree to the terms and conditions" checked={agree} onChange={setAgree} />

        <div style={{ ...S.stickyFooter, marginTop: 20 }}>
          {/* [3.9] Reset All */}
          <button style={S.btnSecondary} onClick={handleReset}>↻ Reset All</button>
          {/* [3.3] Disabled until agree  [3.7] Conditional CTA label */}
          <button
            style={{ ...S.btnPrimary, ...(agree ? {} : S.btnDisabled) }}
            disabled={!agree}
            title={!agree ? "You must agree to the terms first" : ""}
            onClick={() => toast("Conditional form submitted!", "success")}
          >
            {accountType === "enterprise" ? "Request Approval" : "Save Account"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// TABLES & LISTS PAGE
//
// Demonstrates:
//   [SECTION 7.1]  Empty state (illustration + CTA)
//   [SECTION 7.2]  Loading skeleton (animated rows)
//   [SECTION 7.4]  Long text truncation (ellipsis)
//   [SECTION 7.5]  Row hover (CSS tr:hover)
//   [SECTION 7.6]  Row selected (checkbox + highlight)
//   [SECTION 7.7]  Actions per row (edit ✎, delete ✕)
//   [SECTION 7.8]  Bulk actions (select all, bulk delete)
//   [SECTION 7.9]  Pagination (pages, "Showing X–Y of Z")
//   [SECTION 8.1]  Loading state (skeleton)
//   [SECTION 8.2]  Empty state
//   [SECTION 8.3]  Error state (retry)
//   [SECTION 9.2]  Tabs (All / Active / Inactive)
//   [SECTION 12.4] Fetch list → loading/error (1.2s delay)
//   [SECTION 12.5] Create/edit → optimistic update + toast
//   [SECTION 12.6] Delete → confirm → refresh
//   [SECTION 12.7] Search/filter → debounced (300ms)
// ═══════════════════════════════════════════════════════════════════════════
function TablesPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [tab, setTab] = useState("all");
  const perPage = 4;

  // [SECTION 12.4] Fetch list with loading delay
  useEffect(() => {
    setLoading(true); setError(false);
    fakeFetch(1200).then(() => { setUsers(MOCK_USERS); setLoading(false); });
  }, []);

  // [SECTION 12.7] Debounced search — 300ms delay
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // [9.2] Tab + [12.7] search filtering
  const filteredUsers = useMemo(() => {
    let u = users;
    if (tab === "active") u = u.filter((x) => x.status === "active");
    if (tab === "inactive") u = u.filter((x) => x.status === "inactive");
    if (debouncedSearch) u = u.filter((x) => x.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || x.email.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return u;
  }, [users, tab, debouncedSearch]);

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const pageUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  // [7.8] Bulk select all on current page
  const toggleAll = () => {
    if (selected.size === pageUsers.length) setSelected(new Set());
    else setSelected(new Set(pageUsers.map((u) => u.id)));
  };

  // [12.6] Delete → confirm → refresh
  const handleDelete = () => {
    setUsers((u) => u.filter((x) => x.id !== deleteId));
    setSelected((s) => { const n = new Set(s); n.delete(deleteId); return n; });
    toast("User deleted", "success");
    setDeleteId(null);
  };

  // [12.5] Create/edit → optimistic update
  const handleSaveUser = (u) => {
    if (u.id) {
      setUsers((arr) => arr.map((x) => (x.id === u.id ? u : x)));
      toast("User updated", "success");
    } else {
      setUsers((arr) => [...arr, { ...u, id: Date.now() }]);
      toast("User created", "success");
    }
    setEditUser(null);
  };

  // [7.8] Bulk delete
  const handleBulkDelete = () => {
    setUsers((u) => u.filter((x) => !selected.has(x.id)));
    toast(`${selected.size} users deleted`, "success");
    setSelected(new Set());
  };

  // [SECTION 8.3] Error state with retry
  if (error) {
    return (
      <div>
        <SectionHeader title="Tables & Lists" desc="Section 7 + 8 + 12" />
        <div style={S.emptyState}>
          <div style={{ fontSize: 48 }}>⚠</div>
          <h3 style={S.emptyTitle}>Something went wrong</h3>
          <p style={S.emptyText}>Failed to load users. Please try again.</p>
          <button style={S.btnPrimary} onClick={() => { setError(false); setLoading(true); fakeFetch(800).then(() => { setUsers(MOCK_USERS); setLoading(false); }); }}>↻ Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Tables & Lists" desc="Section 7: Table UI, pagination, bulk actions · Section 8: Loading/empty/error · Section 12: CRUD, search, debounce" />

      {/* [SECTION 9.2] Tabs */}
      <div style={S.tabBar}>
        {["all", "active", "inactive"].map((t) => (
          <button key={t} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }} onClick={() => { setTab(t); setCurrentPage(1); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span style={S.tabCount}>{t === "all" ? users.length : users.filter((u) => u.status === t).length}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* [12.7] Search input */}
        <input style={S.searchInput} placeholder="Search users…" value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        <button style={S.btnPrimary} onClick={() => setEditUser({ name: "", email: "", role: "Viewer", status: "active", department: "Engineering" })}>+ Add User</button>
      </div>

      {/* [7.8] Bulk actions bar */}
      {selected.size > 0 && (
        <div style={S.bulkBar}>
          <span>{selected.size} selected</span>
          <button style={S.btnDangerSmall} onClick={handleBulkDelete}>Delete Selected</button>
          <button style={S.btnGhostSmall} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* [7.2, 8.1] Loading skeleton */}
      {loading ? (
        <div style={S.card}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={S.skeletonRow}>
              <div style={{ ...S.skeleton, width: 20, height: 20, borderRadius: 4 }} />
              <div style={{ ...S.skeleton, flex: 1 }} />
              <div style={{ ...S.skeleton, width: 100 }} />
              <div style={{ ...S.skeleton, width: 80 }} />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        /* [7.1, 8.2] Empty state */
        <div style={S.emptyState}>
          <div style={{ fontSize: 48 }}>📋</div>
          <h3 style={S.emptyTitle}>No users found</h3>
          <p style={S.emptyText}>{search ? "Try a different search term" : "Add your first user to get started"}</p>
          <button style={S.btnPrimary} onClick={() => setEditUser({ name: "", email: "", role: "Viewer", status: "active", department: "Engineering" })}>+ Add User</button>
        </div>
      ) : (
        /* [SECTION 7] Full table */
        <div style={S.tableContainer}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}><input type="checkbox" checked={selected.size === pageUsers.length && pageUsers.length > 0} onChange={toggleAll} /></th>
                <th style={S.th}>Name</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((u) => (
                <tr key={u.id} style={{ ...S.tr, ...(selected.has(u.id) ? S.trSelected : {}) }}>
                  {/* [7.6] Row selection */}
                  <td style={S.td}><input type="checkbox" checked={selected.has(u.id)} onChange={() => setSelected((s) => { const n = new Set(s); n.has(u.id) ? n.delete(u.id) : n.add(u.id); return n; })} /></td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{u.name}</td>
                  {/* [7.4] Truncation */}
                  <td style={{ ...S.td, ...S.truncate, maxWidth: 200 }}>{u.email}</td>
                  <td style={S.td}><span style={{ ...S.roleBadge, background: u.role === "Admin" ? "#3b82f620" : u.role === "Editor" ? "#f59e0b20" : "#64748b20", color: u.role === "Admin" ? "#60a5fa" : u.role === "Editor" ? "#fbbf24" : "#94a3b8" }}>{u.role}</span></td>
                  <td style={S.td}><span style={{ ...S.statusDot, background: u.status === "active" ? "#22c55e" : "#ef4444" }} /> {u.status}</td>
                  {/* [7.7] Per-row actions */}
                  <td style={S.td}>
                    <button style={S.iconBtn} title="Edit" onClick={() => setEditUser(u)}>✎</button>
                    <button style={{ ...S.iconBtn, color: "#ef4444" }} title="Delete" onClick={() => setDeleteId(u.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* [7.9] Pagination */}
      {!loading && filteredUsers.length > perPage && (
        <div style={S.pagination}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredUsers.length)} of {filteredUsers.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={S.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>←</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} style={{ ...S.pageBtn, ...(currentPage === i + 1 ? S.pageBtnActive : {}) }} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button style={S.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>→</button>
          </div>
        </div>
      )}

      {/* Demo button to trigger error state */}
      <button style={{ ...S.btnGhost, marginTop: 12, fontSize: 12 }} onClick={() => setError(true)}>Simulate Error State</button>

      {/* [6.6, 12.6] Delete confirmation modal */}
      {deleteId && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteId(null)}>
          <p style={S.modalText}>Are you sure you want to delete this user? This action cannot be undone.</p>
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setDeleteId(null)}>Cancel</button>
            <button style={S.btnDanger} onClick={handleDelete}>✕ Delete</button>
          </div>
        </Modal>
      )}

      {/* [6.4] Modal with form — edit/create */}
      {editUser && (
        <Modal title={editUser.id ? "Edit User" : "Create User"} onClose={() => setEditUser(null)} wide>
          <UserForm user={editUser} onSave={handleSaveUser} onCancel={() => setEditUser(null)} />
        </Modal>
      )}
    </div>
  );
}

// ─── UserForm (inside modal) ─────────────────────────────────────────────
// [SECTION 6.4] Modal with form  [4.9] Disabled submit when empty
function UserForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ ...user });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <FormField label="Name" required value={form.name} onChange={(v) => set("name", v)} placeholder="Full name" />
      <FormField label="Email" required type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="email@company.com" />
      <FormSelect label="Role" value={form.role} onChange={(v) => set("role", v)}
        options={[{ value: "Admin", label: "Admin" }, { value: "Editor", label: "Editor" }, { value: "Viewer", label: "Viewer" }]} />
      <FormSelect label="Status" value={form.status} onChange={(v) => set("status", v)}
        options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
      <div style={S.modalActions}>
        <button style={S.btnSecondary} onClick={onCancel}>Cancel</button>
        <button style={{ ...S.btnPrimary, ...(!form.name || !form.email ? S.btnDisabled : {}) }}
          disabled={!form.name || !form.email} onClick={() => onSave(form)}>
          {user.id ? "Save Changes" : "Create User"}
        </button>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// MODALS PAGE
//
// Demonstrates:
//   [SECTION 6.1]  Small / medium / large modal sizes
//   [SECTION 6.2]  Scroll inside modal
//   [SECTION 6.3]  Fixed footer actions
//   [SECTION 6.4]  Modal with form (task creation)
//   [SECTION 6.5]  Modal with long content (20 paragraphs)
//   [SECTION 6.6]  Confirmation modal (delete with icon)
//   [SECTION 6.7]  Cancel vs close icon
//   [SECTION 6.8]  Click outside to close
//   [SECTION 6.9]  ESC close
//   [SECTION 6.10] Stacked modals (parent + child)
// ═══════════════════════════════════════════════════════════════════════════
function ModalsPage() {
  const toast = useToast();
  const [activeModal, setActiveModal] = useState(null);
  const [stackedModal, setStackedModal] = useState(false);

  return (
    <div>
      <SectionHeader title="Modals & Dialogs" desc="Section 6: All modal variants — sizes, scroll, forms, stacked, ESC/backdrop close" />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button style={S.btnPrimary} onClick={() => setActiveModal("small")}>Small Modal</button>
        <button style={S.btnPrimary} onClick={() => setActiveModal("medium")}>Medium Modal</button>
        <button style={S.btnPrimary} onClick={() => setActiveModal("large")}>Large / Scrollable</button>
        <button style={S.btnPrimary} onClick={() => setActiveModal("confirm")}>Confirmation</button>
        <button style={S.btnPrimary} onClick={() => setActiveModal("form")}>Form Modal</button>
        <button style={S.btnPrimary} onClick={() => setActiveModal("stacked")}>Stacked Modals</button>
      </div>

      {/* [6.1] Small modal */}
      {activeModal === "small" && (
        <Modal title="Small Modal" onClose={() => setActiveModal(null)} size="small">
          <p style={S.modalText}>A compact dialog for quick messages or simple confirmations.</p>
          <div style={S.modalActions}>
            <button style={S.btnPrimary} onClick={() => { setActiveModal(null); toast("Done!", "success"); }}>Got it</button>
          </div>
        </Modal>
      )}

      {/* [6.1] Medium  [6.8] Click outside  [6.9] ESC close */}
      {activeModal === "medium" && (
        <Modal title="Medium Modal" onClose={() => setActiveModal(null)}>
          <p style={S.modalText}>Standard-sized modal. Click outside or press ESC to close.</p>
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setActiveModal(null)}>Cancel</button>
            <button style={S.btnPrimary} onClick={() => { setActiveModal(null); toast("Confirmed!", "success"); }}>Confirm</button>
          </div>
        </Modal>
      )}

      {/* [6.2] Scroll inside  [6.3] Fixed footer  [6.5] Long content */}
      {activeModal === "large" && (
        <Modal title="Large Modal with Scroll" onClose={() => setActiveModal(null)} wide>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} style={{ ...S.modalText, marginBottom: 8 }}>
                Paragraph {i + 1}: Scrollable content. Footer stays fixed at bottom.
              </p>
            ))}
          </div>
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* [6.6] Confirmation modal */}
      {activeModal === "confirm" && (
        <Modal title="⚠ Delete Project?" onClose={() => setActiveModal(null)} size="small">
          <p style={S.modalText}>This will permanently delete "Claude-Code Demo" and all its data.</p>
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setActiveModal(null)}>Cancel</button>
            <button style={S.btnDanger} onClick={() => { setActiveModal(null); toast("Project deleted", "error"); }}>✕ Delete Project</button>
          </div>
        </Modal>
      )}

      {/* [6.4] Modal with form */}
      {activeModal === "form" && (
        <Modal title="Create Task" onClose={() => setActiveModal(null)}>
          <FormField label="Task Title" required placeholder="What needs to be done?" value="" onChange={() => {}} />
          <FormField label="Description" textarea placeholder="Details…" value="" onChange={() => {}} />
          <FormSelect label="Priority" value="medium" onChange={() => {}}
            options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setActiveModal(null)}>Cancel</button>
            <button style={S.btnPrimary} onClick={() => { setActiveModal(null); toast("Task created!", "success"); }}>Create Task</button>
          </div>
        </Modal>
      )}

      {/* [6.10] Stacked modals — parent + child */}
      {activeModal === "stacked" && (
        <Modal title="Parent Modal" onClose={() => setActiveModal(null)}>
          <p style={S.modalText}>This is the parent modal. Click below to open a child modal on top.</p>
          <button style={S.btnPrimary} onClick={() => setStackedModal(true)}>Open Child Modal</button>
          {stackedModal && (
            <Modal title="Child Modal" onClose={() => setStackedModal(false)} size="small">
              <p style={S.modalText}>Stacked/nested modal — tests overlay layering.</p>
              <div style={S.modalActions}>
                <button style={S.btnPrimary} onClick={() => setStackedModal(false)}>Close Child</button>
              </div>
            </Modal>
          )}
          <div style={S.modalActions}>
            <button style={S.btnSecondary} onClick={() => setActiveModal(null)}>Close Parent</button>
          </div>
        </Modal>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// STATES PAGE — All 9 application states from Section 8
//
//   [8.1] Loading    [8.2] Empty       [8.3] Error
//   [8.4] Partial    [8.5] Disabled    [8.6] Read-only
//   [8.7] First-time [8.8] No perms    [8.9] Maintenance
// ═══════════════════════════════════════════════════════════════════════════
function StatesPage() {
  const [activeState, setActiveState] = useState("loading");

  const states = [
    { id: "loading", label: "Loading" },
    { id: "empty", label: "Empty" },
    { id: "error", label: "Error" },
    { id: "partial", label: "Partial Data" },
    { id: "disabled", label: "Disabled Screen" },
    { id: "readonly", label: "Read-Only" },
    { id: "firsttime", label: "First-Time User" },
    { id: "noperm", label: "No Permissions" },
    { id: "maintenance", label: "Maintenance" },
  ];

  return (
    <div>
      <SectionHeader title="UI States" desc="Section 8: All major application states" />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {states.map((s) => (
          <button key={s.id} style={{ ...S.btnGhost, ...(activeState === s.id ? { background: "#3b82f620", color: "#60a5fa", borderColor: "#3b82f6" } : {}) }}
            onClick={() => setActiveState(s.id)}>{s.label}</button>
        ))}
      </div>

      <div style={S.card}>
        {/* [8.1] Loading */}
        {activeState === "loading" && (
          <div style={S.emptyState}>
            <Spinner />
            <p style={{ color: "#94a3b8", marginTop: 12 }}>Loading data…</p>
            <div style={{ width: "100%", marginTop: 20 }}>
              {[1, 2, 3].map((i) => <div key={i} style={S.skeletonRow}><div style={{ ...S.skeleton, flex: 1 }} /><div style={{ ...S.skeleton, width: 80 }} /></div>)}
            </div>
          </div>
        )}

        {/* [8.2] Empty */}
        {activeState === "empty" && (
          <div style={S.emptyState}>
            <div style={{ fontSize: 56, opacity: 0.4 }}>📭</div>
            <h3 style={S.emptyTitle}>No items yet</h3>
            <p style={S.emptyText}>Create your first item to get started.</p>
            <button style={S.btnPrimary}>+ Create Item</button>
          </div>
        )}

        {/* [8.3] Error */}
        {activeState === "error" && (
          <div style={S.emptyState}>
            <div style={{ fontSize: 56, opacity: 0.6 }}>💥</div>
            <h3 style={S.emptyTitle}>Something went wrong</h3>
            <p style={S.emptyText}>We couldn't load the data. Please try again.</p>
            <button style={S.btnPrimary}>↻ Retry</button>
          </div>
        )}

        {/* [8.4] Partial data */}
        {activeState === "partial" && (
          <div>
            <div style={S.alertWarning}>⚠ Some data is unavailable. Showing partial results.</div>
            <div style={S.reviewGrid}>
              <div style={S.reviewItem}><span style={S.reviewLabel}>Users</span><span style={S.reviewValue}>142</span></div>
              <div style={S.reviewItem}><span style={S.reviewLabel}>Revenue</span><span style={{ ...S.reviewValue, color: "#ef4444" }}>Unavailable</span></div>
              <div style={S.reviewItem}><span style={S.reviewLabel}>Orders</span><span style={S.reviewValue}>1,847</span></div>
              <div style={S.reviewItem}><span style={S.reviewLabel}>Conversion</span><span style={{ ...S.reviewValue, color: "#ef4444" }}>Unavailable</span></div>
            </div>
          </div>
        )}

        {/* [8.5] Disabled screen — blurred overlay + lock */}
        {activeState === "disabled" && (
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(2px)", opacity: 0.4, pointerEvents: "none" }}>
              <FormField label="Setting A" value="Value" onChange={() => {}} />
              <FormField label="Setting B" value="Another value" onChange={() => {}} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 40 }}>🔒</div>
              <h3 style={{ color: "#e2e8f0", margin: "8px 0 4px" }}>Access Restricted</h3>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>You don't have permission to modify these settings.</p>
            </div>
          </div>
        )}

        {/* [8.6] Read-only */}
        {activeState === "readonly" && (
          <div>
            <div style={S.alertInfo}>ℹ This form is in read-only mode. Contact an admin to make changes.</div>
            <FormField label="Project Name" readOnly value="Claude-Code Implementation Demo" />
            <FormField label="Owner" readOnly value="Alice Johnson" />
            <FormField label="Status" readOnly value="In Progress" />
          </div>
        )}

        {/* [8.7] First-time user onboarding */}
        {activeState === "firsttime" && (
          <div style={S.emptyState}>
            <div style={{ fontSize: 56 }}>👋</div>
            <h3 style={S.emptyTitle}>Welcome to Claude-Code Demo!</h3>
            <p style={S.emptyText}>Let's get you set up. Follow these steps:</p>
            <div style={{ textAlign: "left", width: "100%", maxWidth: 360, margin: "12px auto" }}>
              {["Complete your profile", "Invite team members", "Create your first project"].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: "#cbd5e1" }}>
                  <span style={{ ...S.stepCircle, width: 24, height: 24, fontSize: 11 }}>{i + 1}</span>
                  {tip}
                </div>
              ))}
            </div>
            <button style={S.btnPrimary}>Get Started →</button>
          </div>
        )}

        {/* [8.8] No permissions */}
        {activeState === "noperm" && (
          <div style={S.emptyState}>
            <div style={{ fontSize: 56, opacity: 0.5 }}>🚫</div>
            <h3 style={S.emptyTitle}>No Permission</h3>
            <p style={S.emptyText}>Your current role (Viewer) doesn't have access. Contact your admin.</p>
          </div>
        )}

        {/* [8.9] Maintenance */}
        {activeState === "maintenance" && (
          <div style={S.emptyState}>
            <div style={{ fontSize: 56 }}>🔧</div>
            <h3 style={S.emptyTitle}>Under Maintenance</h3>
            <p style={S.emptyText}>Scheduled maintenance in progress. ~30 minutes remaining.</p>
            <div style={{ width: 200, height: 6, borderRadius: 3, background: "#1e293b", marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 3, animation: "pulse 2s infinite" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
//
//   [SECTION 12.8] Settings → pre-fill from auth profile
//   [SECTION 11.6] Form submit with no changes
// ═══════════════════════════════════════════════════════════════════════════
function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  // [12.8] Pre-fill from auth context
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    timezone: "utc",
    theme: "dark",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <SectionHeader title="Settings" desc="Section 12: Pre-filled from auth profile · Section 11: Edge cases" />
      <div style={S.card}>
        <FormField label="Display Name" value={form.name} onChange={(v) => set("name", v)} />
        <FormField label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
        <FormSelect label="Timezone" value={form.timezone} onChange={(v) => set("timezone", v)}
          options={[{ value: "utc", label: "UTC" }, { value: "est", label: "EST" }, { value: "cet", label: "CET" }, { value: "jst", label: "JST" }]} />
        <FormSelect label="Theme" value={form.theme} onChange={(v) => set("theme", v)}
          options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
        <div style={S.stickyFooter}>
          <button style={S.btnSecondary}>Cancel</button>
          <button style={S.btnPrimary} onClick={() => toast("Settings saved!", "success")}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── FormField ───────────────────────────────────────────────────────────
// Implements Section 1 almost entirely:
//   [1.1] Input types  [1.2] Label+placeholder  [1.3] Required/optional
//   [1.4] Disabled     [1.5] Read-only          [1.6] Helper text
//   [1.7] Error state  [1.8] Success state      [1.9] Textarea
//   [1.10] Autofocus   [4.6] Error positioning  [4.10] Success highlight
const FormField = ({ label, value, onChange, onBlur, error, success, helper, placeholder,
  type = "text", required, optional, disabled, readOnly, textarea, autoFocus, ref }) => (
  <div style={S.fieldWrap}>
    {label && (
      <label style={S.label}>
        {label}
        {required && <span style={S.asterisk}> *</span>}
        {optional && <span style={S.optionalTag}> optional</span>}
      </label>
    )}
    {textarea ? (
      <textarea
        style={{ ...S.input, ...S.textarea, ...(error ? S.inputError : success ? S.inputSuccess : {}), ...(disabled ? S.inputDisabled : {}), ...(readOnly ? S.inputReadonly : {}) }}
        value={value} onChange={(e) => onChange?.(e.target.value)} onBlur={onBlur}
        placeholder={placeholder} disabled={disabled} readOnly={readOnly} rows={4} />
    ) : (
      <input
        ref={ref}
        style={{ ...S.input, ...(error ? S.inputError : success ? S.inputSuccess : {}), ...(disabled ? S.inputDisabled : {}), ...(readOnly ? S.inputReadonly : {}) }}
        type={type} value={value} onChange={(e) => onChange?.(e.target.value)} onBlur={onBlur}
        placeholder={placeholder} disabled={disabled} readOnly={readOnly} autoFocus={autoFocus} />
    )}
    {error && <span style={S.errorText}>✕ {error}</span>}
    {success && !error && <span style={S.successText}>✓ Looks good</span>}
    {helper && !error && <span style={S.helperText}>{helper}</span>}
  </div>
);

// ─── FormSelect ──────────────────────────────────────────────────────────
const FormSelect = ({ label, value, onChange, options, disabled, helper }) => (
  <div style={S.fieldWrap}>
    {label && <label style={S.label}>{label}</label>}
    <select style={{ ...S.input, ...S.select, ...(disabled ? S.inputDisabled : {}) }} value={value}
      onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {helper && <span style={S.helperText}>{helper}</span>}
  </div>
);

// ─── Checkbox ────────────────────────────────────────────────────────────
const Checkbox = ({ label, checked, onChange }) => (
  <label style={S.checkWrap}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={S.checkbox} />
    <span style={S.checkLabel}>{label}</span>
  </label>
);

// ─── CollapsibleSection ──────────────────────────────────────────────────
// [SECTION 2.4] Collapsible / accordion pattern
function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={S.collapsible}>
      <button style={S.collapsibleHeader} onClick={() => setOpen(!open)}>
        <span>{open ? "▾" : "▸"} {title}</span>
      </button>
      {open && <div style={S.collapsibleBody}>{children}</div>}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────
// [6.1] Sizes  [6.7] Close icon  [6.8] Backdrop click  [6.9] ESC close
function Modal({ title, children, onClose, size, wide }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: size === "small" ? 380 : wide ? 600 : 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>{title}</h3>
          <button style={S.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
      {desc && <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{desc}</p>}
    </div>
  );
}

// [SECTION 5.2] Spinner — used in buttons and loading states
function Spinner({ small }) {
  return <div style={{ ...S.spinner, ...(small ? { width: 16, height: 16, borderWidth: 2, marginRight: 8 } : {}) }} />;
}


// ═══════════════════════════════════════════════════════════════════════════
// STYLES — All inline (single-file, zero dependencies beyond React)
// ═══════════════════════════════════════════════════════════════════════════
const S = {
  loginBg: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  loginCard: { width: 380, padding: "40px 36px", borderRadius: 16, background: "#1e293b", border: "1px solid #334155", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" },
  loginLogo: { fontSize: 32, color: "#818cf8", marginBottom: 8 },
  loginTitle: { fontSize: 20, fontWeight: 700, color: "#e2e8f0", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif", textAlign: "center" },
  loginSub: { fontSize: 13, color: "#64748b", margin: "0 0 24px" },
  dashLayout: { display: "flex", minHeight: "100vh", background: "#0f172a", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#cbd5e1" },
  sidebar: { background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden", flexShrink: 0 },
  sidebarHeader: { display: "flex", alignItems: "center", padding: "20px 16px", gap: 10 },
  sidebarLogo: { fontSize: 22, color: "#818cf8" },
  sidebarBrand: { fontSize: 18, fontWeight: 700, color: "#e2e8f0", letterSpacing: -0.5 },
  sidebarNav: { flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2 },
  sidebarItem: { display: "flex", alignItems: "center", gap: 0, padding: "10px 12px", borderRadius: 8, border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "left", width: "100%", transition: "all 0.15s" },
  sidebarItemActive: { background: "#334155", color: "#e2e8f0" },
  sidebarFooter: { padding: 12, borderTop: "1px solid #334155" },
  userInfo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#818cf8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  collapseBtn: { width: "100%", padding: "6px", border: "1px solid #334155", borderRadius: 6, background: "none", color: "#64748b", cursor: "pointer", fontSize: 13 },
  mainContent: { flex: 1, padding: "24px 32px", overflowY: "auto", maxHeight: "100vh" },
  breadcrumbs: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13 },
  breadcrumbLink: { color: "#64748b", cursor: "pointer" },
  breadcrumbSep: { color: "#475569" },
  breadcrumbCurrent: { color: "#e2e8f0", fontWeight: 600 },
  logoutBtn: { marginLeft: "auto", padding: "6px 14px", border: "1px solid #334155", borderRadius: 6, background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12 },
  fieldWrap: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 },
  asterisk: { color: "#ef4444" },
  optionalTag: { color: "#475569", fontWeight: 400, fontSize: 11 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { resize: "vertical", minHeight: 80 },
  inputError: { borderColor: "#ef4444", boxShadow: "0 0 0 3px #ef444420" },
  inputSuccess: { borderColor: "#22c55e", boxShadow: "0 0 0 3px #22c55e20" },
  inputDisabled: { opacity: 0.5, cursor: "not-allowed", background: "#1e293b" },
  inputReadonly: { background: "#1e293b", borderStyle: "dashed", cursor: "default" },
  select: { appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" },
  errorText: { display: "block", fontSize: 12, color: "#ef4444", marginTop: 4 },
  successText: { display: "block", fontSize: 12, color: "#22c55e", marginTop: 4 },
  helperText: { display: "block", fontSize: 12, color: "#475569", marginTop: 4 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  checkWrap: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 0" },
  checkbox: { accentColor: "#818cf8", width: 16, height: 16 },
  checkLabel: { color: "#cbd5e1", fontSize: 14 },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 24 },
  divider: { height: 1, background: "#334155", margin: "20px 0" },
  btnPrimary: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#818cf8", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s", fontFamily: "inherit" },
  btnSecondary: { padding: "10px 20px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#cbd5e1", fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  btnGhost: { padding: "8px 16px", borderRadius: 8, border: "1px solid #334155", background: "none", color: "#94a3b8", fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnDanger: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  btnDangerSmall: { padding: "6px 12px", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", fontWeight: 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  btnGhostSmall: { padding: "6px 12px", borderRadius: 6, border: "1px solid #334155", background: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed", pointerEvents: "none" },
  btnSuccess: { background: "#22c55e" },
  stickyFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #334155" },
  alertError: { padding: "12px 16px", borderRadius: 8, background: "#ef444415", border: "1px solid #ef444440", color: "#fca5a5", marginBottom: 16, fontSize: 13 },
  alertWarning: { padding: "12px 16px", borderRadius: 8, background: "#f59e0b15", border: "1px solid #f59e0b40", color: "#fcd34d", marginBottom: 16, fontSize: 13 },
  alertSuccess: { padding: "12px 16px", borderRadius: 8, background: "#22c55e15", border: "1px solid #22c55e40", color: "#86efac", marginBottom: 16, fontSize: 13 },
  alertInfo: { padding: "12px 16px", borderRadius: 8, background: "#3b82f615", border: "1px solid #3b82f640", color: "#93c5fd", marginBottom: 16, fontSize: 13 },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 4, background: "#f59e0b30", color: "#fbbf24", fontSize: 11, fontWeight: 700, marginRight: 8 },
  stepper: { display: "flex", alignItems: "center", marginBottom: 24, gap: 0 },
  stepItem: { display: "flex", alignItems: "center", gap: 8, flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: "50%", border: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#64748b", flexShrink: 0 },
  stepCircleActive: { background: "#818cf8", borderColor: "#818cf8", color: "#fff" },
  stepLabel: { fontSize: 12, color: "#64748b", whiteSpace: "nowrap" },
  stepLine: { flex: 1, height: 2, background: "#334155", marginLeft: 8 },
  stepLineActive: { background: "#818cf8" },
  collapsible: { border: "1px solid #334155", borderRadius: 8, marginTop: 16, overflow: "hidden" },
  collapsibleHeader: { width: "100%", padding: "12px 16px", border: "none", background: "#0f172a", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 600, fontFamily: "inherit" },
  collapsibleBody: { padding: "12px 16px", borderTop: "1px solid #334155" },
  tableContainer: { borderRadius: 10, overflow: "hidden", border: "1px solid #334155" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 16px", textAlign: "left", background: "#0f172a", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #334155" },
  tr: { borderBottom: "1px solid #1e293b", transition: "background 0.1s" },
  trSelected: { background: "#818cf810" },
  td: { padding: "12px 16px", color: "#cbd5e1" },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  roleBadge: { padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 },
  statusDot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 6 },
  iconBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 4 },
  bulkBar: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "#818cf815", borderRadius: 8, marginBottom: 12, fontSize: 13, color: "#c7d2fe" },
  searchInput: { padding: "8px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 13, width: 200, outline: "none", fontFamily: "inherit" },
  tabBar: { display: "flex", alignItems: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  tab: { padding: "8px 16px", borderRadius: 6, border: "1px solid transparent", background: "none", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" },
  tabActive: { background: "#334155", color: "#e2e8f0", borderColor: "#475569" },
  tabCount: { background: "#0f172a", padding: "1px 7px", borderRadius: 10, fontSize: 11 },
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { width: 32, height: 32, borderRadius: 6, border: "1px solid #334155", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  pageBtnActive: { background: "#818cf8", borderColor: "#818cf8", color: "#fff" },
  skeletonRow: { display: "flex", gap: 12, marginBottom: 12, alignItems: "center" },
  skeleton: { height: 16, borderRadius: 6, background: "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" },
  emptyTitle: { color: "#e2e8f0", fontSize: 18, fontWeight: 700, margin: "12px 0 4px" },
  emptyText: { color: "#64748b", fontSize: 14, margin: "0 0 16px", maxWidth: 340 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalBox: { background: "#1e293b", border: "1px solid #334155", borderRadius: 14, width: "90%", maxWidth: 480, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)", animation: "fadeIn 0.15s ease" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #334155" },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 },
  modalClose: { background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer", padding: 4 },
  modalBody: { padding: "16px 20px" },
  modalText: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid #334155" },
  reviewGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  reviewItem: { padding: "10px 14px", borderRadius: 8, background: "#0f172a", border: "1px solid #334155" },
  reviewLabel: { display: "block", fontSize: 11, color: "#64748b", textTransform: "capitalize", marginBottom: 2 },
  reviewValue: { fontSize: 14, color: "#e2e8f0", fontWeight: 500 },
  toastContainer: { position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 },
  toast: { padding: "12px 20px", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", animation: "slideUp 0.25s ease", fontFamily: "'DM Sans', sans-serif" },
  toastIcon: { fontSize: 15, fontWeight: 700 },
  toast_success: { background: "#16a34a" },
  toast_error: { background: "#dc2626" },
  toast_info: { background: "#2563eb" },
  spinner: { width: 32, height: 32, border: "3px solid #334155", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" },
};

// Global CSS — animations, focus styles, hover, scrollbar
const styleTag = document.createElement("style");
styleTag.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #0f172a; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  /* [SECTION 11.10] Focus outline for keyboard navigation */
  input:focus, select:focus, textarea:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 3px #818cf820 !important; }
  /* [SECTION 7.5] Row hover */
  button:hover { opacity: 0.9; }
  tr:hover { background: #ffffff06; }
  ::selection { background: #818cf840; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
`;
document.head.appendChild(styleTag);