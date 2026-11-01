
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  LayoutDashboard, MapPin, ClipboardList, BarChart3, Settings, Bell, Search,
  Plus, ArrowUpRight, CheckCircle2, Clock3, AlertTriangle, Menu, X,
  Sparkles, TrendingUp, Filter, ChevronDown, MapPinned, Zap, ShieldCheck,
  Trash2, Construction, Lightbulb, Droplets, SlidersHorizontal, UserRound,
  Moon, Mail, Download, Activity, CalendarDays, ArrowRight, CircleHelp
} from "lucide-react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "https://civiclens-api-39xh.onrender.com/api";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Issue Reports", icon: ClipboardList },
  { label: "Community Map", icon: MapPin },
  { label: "Analytics", icon: BarChart3 },
];

const categoryIcons = {
  Roads: Construction,
  Sanitation: Trash2,
  Electricity: Lightbulb,
  "Water Supply": Droplets,
  "Public Spaces": MapPinned,
  "Public Safety": ShieldCheck,
  Other: CircleHelp,
};

function formatIssue(issue) {
  return {
    ...issue,
    id: `CL-${String(issue.id).padStart(4, "0")}`,
    date: issue.created_at
      ? new Date(issue.created_at).toLocaleDateString()
      : "Recently",
    votes: issue.votes ?? 0,
  };
}

function App() {
  // CivicLens demo profile; no login or signup is required.
  const user = {
    name: "CivicLens Demo",
    email: "demo@civiclens.com",
  };

  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All status");

  // Load issue reports from the backend when the user logs in.
  useEffect(() => {
    async function fetchIssues() {
      setIssuesLoading(true);
      setIssuesError("");

      try {
        const response = await axios.get(`${API_URL}/issues`);

        setIssues(response.data.map(formatIssue));
      } catch (error) {
        console.error("Failed to load issues:", error);
        setIssuesError(
          error.response?.data?.detail ||
          "Could not load issue reports. Please try refreshing."
        );
      } finally {
        setIssuesLoading(false);
      }
    }

    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => issues.filter((issue) =>
    `${issue.title} ${issue.location} ${issue.category} ${issue.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  ), [issues, search]);

  const resolvedCount = issues.filter(
    (issue) => issue.status === "Resolved"
  ).length;

  const activeCount = issues.filter(
    (issue) => issue.status !== "Resolved"
  ).length;

  const highCount = issues.filter(
    (issue) => issue.priority === "High"
  ).length;

  // Submit a new report to the backend.
  async function addIssue(issue) {
    try {
      const response = await axios.post(
        `${API_URL}/issues`,
        {
          title: issue.title,
          location: issue.location,
          category: issue.category,
          priority: issue.priority,
        }
      );

      let savedIssue = formatIssue(response.data.issue);
      // Upload the selected photo after the issue has been created
      if (issue.photo) {
  const formData = new FormData();
  formData.append("file", issue.photo);

  const uploadResponse = await axios.post(
    `${API_URL}/issues/${response.data.issue.id}/upload-photo`,
    formData,
  );

  // Attach the saved photo URL to the issue
  savedIssue.photo_url = `https://civiclens-api-39xh.onrender.com${uploadResponse.data.photo_url}`;
}

      setIssues((previous) => [savedIssue, ...previous]);
      setShowReportForm(false);
      setActivePage("Issue Reports");
    } catch (error) {
      console.error("Failed to submit issue:", error);
      alert(
        error.response?.data?.detail ||
        "Failed to submit report. Please try again."
      );
    }
  }

  function navigate(page) {
    setActivePage(page);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Sparkles size={22} /></div>
          <div>
            <h1>CivicLens</h1>
            <span>Community intelligence</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-section-label">WORKSPACE</div>
        <nav className="nav-menu">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  activePage === item.label ? "active" : ""
                }`}
                onClick={() => navigate(item.label)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === "Issue Reports" && (
                  <span className="nav-count">{issues.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="nav-section-label nav-section-spaced">
          PREFERENCES
        </div>

        <button
          className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
          onClick={() => navigate("Settings")}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Zap size={16} /></div>
            <strong>Make an impact</strong>
            <p>
              Every report brings your community one step closer to better.
            </p>
            <button onClick={() => setShowReportForm(true)}>
              Report an issue <ArrowRight size={14} />
            </button>
          </div>

          <div className="profile">
            <div className="avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="profile-info">
              <strong>{user.name}</strong>
              <span>Resident account</span>
            </div>
            <span className="profile-more" title="Demo mode">
              <CheckCircle2 size={16} />
            </span>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CivicLens..."
              />
              <kbd>⌘ K</kbd>
            </div>
            <button className="notification-button" aria-label="Notifications">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <button
              className="top-avatar"
              onClick={() => navigate("Settings")}
              aria-label="Open profile"
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </button>
          </div>
        </header>

        <div className="page-content">
          {issuesError && (
            <div className="error-message">
              {issuesError}
            </div>
          )}

          {activePage === "Dashboard" && (
            <Dashboard
              issues={filteredIssues}
              allIssues={issues}
              resolvedCount={resolvedCount}
              activeCount={activeCount}
              highCount={highCount}
              onReport={() => setShowReportForm(true)}
              onNavigate={navigate}
              loading={issuesLoading}
            />
          )}

          {activePage === "Issue Reports" && (
            <IssueReports
              issues={filteredIssues}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onReport={() => setShowReportForm(true)}
              loading={issuesLoading}
            />
          )}

          {activePage === "Community Map" && (
            <CommunityMap issues={filteredIssues} />
          )}

          {activePage === "Analytics" && (
            <Analytics
              issues={issues}
              resolvedCount={resolvedCount}
              activeCount={activeCount}
            />
          )}

          {activePage === "Settings" && (
            <SettingsPage user={user} />
          )}

          <footer className="page-footer">
            <span>© 2026 CivicLens</span>
            <span>
              Built for better communities <span className="footer-spark">✦</span>
            </span>
          </footer>
        </div>
      </main>

      {showReportForm && (
        <ReportModal
          onClose={() => setShowReportForm(false)}
          onSubmit={addIssue}
        />
      )}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          {eyebrow}
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </section>
  );
}

function Dashboard({
  issues,
  allIssues,
  resolvedCount,
  activeCount,
  highCount,
  onReport,
  onNavigate,
  loading
}) {
  const resolution = allIssues.length
    ? Math.round(resolvedCount / allIssues.length * 100)
    : 0;

  return (
    <>
      <PageHeading
        eyebrow="COMMUNITY OVERVIEW"
        title={<>See your community<br /><span>in a better light.</span></>}
        description="Report local issues, follow their progress, and help make your neighborhood better."
        action={
          <button className="primary-button" onClick={onReport}>
            <Plus size={17} /> Report an issue
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard
          icon={ClipboardList}
          label="Total reports"
          value={allIssues.length}
          description="Community submissions"
          color="violet"
          trend="Saved reports"
        />
        <StatCard
          icon={Clock3}
          label="Active issues"
          value={activeCount}
          description="Awaiting resolution"
          color="amber"
          trend="Needs attention"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedCount}
          description="Marked as resolved"
          color="pink"
          trend={`${resolution}% resolution rate`}
        />
        <StatCard
          icon={AlertTriangle}
          label="High priority"
          value={highCount}
          description="Needs attention"
          color="blue"
          trend="Priority queue"
        />
      </div>

      <section className="content-grid">
        <div className="panel issues-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent issue reports</h3>
              <p>Latest reports from your community</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Issue Reports")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="issue-list">
            {loading ? (
              <div className="empty-state">Loading reports...</div>
            ) : issues.length ? (
              issues.slice(0, 5).map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))
            ) : (
              <div className="empty-state">
                No issue reports yet. Submit your first report!
              </div>
            )}
          </div>
        </div>

        <div className="panel community-panel">
          <div className="panel-heading">
            <div>
              <h3>Community impact</h3>
              <p>Your neighborhood at a glance</p>
            </div>
            <span className="panel-orb"><Activity size={16} /></span>
          </div>

          <div className="impact-number">
            <strong>{resolvedCount}</strong>
            <span>issues resolved</span>
          </div>
          <div className="impact-progress">
            <div
              className="impact-progress-fill"
              style={{ width: `${resolution}%` }}
            />
          </div>
          <p className="impact-caption">
            {resolution}% of community reports resolved so far.
          </p>

          <div className="impact-footer">
            <div className="impact-icon"><CheckCircle2 size={19} /></div>
            <div>
              <strong>Every report matters.</strong>
              <p>Small actions make better communities.</p>
            </div>
          </div>

          <button
            className="community-link"
            onClick={() => onNavigate("Analytics")}
          >
            Explore community insights <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel mini-panel">
          <div className="panel-heading">
            <div>
              <h3>Issue activity</h3>
              <p>Reports submitted this week</p>
            </div>
            <span className="chart-label">THIS WEEK</span>
          </div>
          <MiniChart />
        </div>

        <div className="panel mini-panel map-preview">
          <div className="panel-heading">
            <div>
              <h3>Community map</h3>
              <p>Issues across your neighborhood</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Community Map")}
            >
              Explore <ArrowUpRight size={15} />
            </button>
          </div>
          <MiniMap issues={allIssues} />
        </div>
      </section>
    </>
  );
}

function StatCard({ icon: Icon, label, value, description, color, trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-description">{description}</div>
      <div className="stat-trend"><TrendingUp size={12} />{trend}</div>
    </div>
  );
}

function IssueRow({ issue }) {
  const Icon = categoryIcons[issue.category] || MapPin;

  return (
    <div className="issue-row">
      <div className="issue-marker"><Icon size={17} /></div>
      <div className="issue-info">
        <strong>{issue.title}</strong>
        <div className="issue-meta">
          <span>{issue.id}</span>
          <span>·</span>
          <span>{issue.location}</span>
        </div>
      </div>
      <div className="issue-right">
        <span className={`status-badge ${issue.status.replaceAll(" ", "-").toLowerCase()}`}>
          {issue.status}
        </span>
        <span className={`priority ${issue.priority.toLowerCase()}`}>
          {issue.priority} priority
        </span>
      </div>
    </div>
  );
}

function IssueReports({
  issues,
  statusFilter,
  setStatusFilter,
  onReport,
  loading
}) {
  const visible = statusFilter === "All status"
    ? issues
    : issues.filter((issue) => issue.status === statusFilter);

  return (
    <>
      <PageHeading
        eyebrow="ISSUE MANAGEMENT"
        title={<>Issue <span>reports.</span></>}
        description="Browse, track, and manage reported issues in your community."
        action={
          <button className="primary-button" onClick={onReport}>
            <Plus size={17} /> Report an issue
          </button>
        }
      />

      <div className="report-summary">
        <div>
          <span className="summary-label">ALL REPORTS</span>
          <strong>{issues.length}</strong>
        </div>
        <div>
          <span className="summary-label">UNDER REVIEW</span>
          <strong>{issues.filter(i => i.status === "Under Review").length}</strong>
        </div>
        <div>
          <span className="summary-label">IN PROGRESS</span>
          <strong>{issues.filter(i => i.status === "In Progress").length}</strong>
        </div>
        <div>
          <span className="summary-label">RESOLVED</span>
          <strong>{issues.filter(i => i.status === "Resolved").length}</strong>
        </div>
      </div>

      <section className="panel report-table-panel">
        <div className="panel-heading">
          <div>
            <h3>All reports</h3>
            <p>Manage and track community submissions</p>
          </div>
          <div className="filter-control">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>All status</option>
              <option>Under Review</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <div className="report-table-wrap">
          {loading ? (
            <div className="empty-state">Loading reports...</div>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>ISSUE</th>
                  <th>CATEGORY</th>
                  <th>LOCATION</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>REPORTED</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(issue => (
                  <tr key={issue.id}>
                    <td>
                      <div className="table-issue">
                        {issue.photo_url && (
                          <img
                            className="issue-photo-thumbnail"
                            src={
                              issue.photo_url?.startsWith("http")
                                ? issue.photo_url
                                : `https://civiclens-api-39xh.onrender.com${issue.photo_url}`
                            }
                            alt={`Photo for ${issue.title}`}
                          />
                        )}

                        <span className="table-id">{issue.id}</span>
                        <strong>{issue.title}</strong>
                      </div>
                    </td>
                    <td><span className="category-pill">{issue.category}</span></td>
                    <td>{issue.location}</td>
                    <td>
                      <span className={`priority ${issue.priority.toLowerCase()}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${issue.status.replaceAll(" ", "-").toLowerCase()}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>{issue.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && visible.length === 0 && (
            <div className="empty-state">
              No reports found for this filter.
            </div>
          )}
        </div>
      </section>
    </>
  );
}


function CommunityMap({ issues }) {
  const [selected, setSelected] = useState(null);
  const puneCenter = [18.5204, 73.8567];

  // Pune center coordinates
  // Approximate coordinates for common Pune neighborhoods
const locationCoordinates = {
  "wakad": [18.5992, 73.7639],
  "tathawade": [18.6186, 73.7495],
  "hinjewadi": [18.5912, 73.7389],
  "baner": [18.5590, 73.7868],
  "pimple saudagar": [18.5986, 73.8030],
  "pimple nilakh": [18.5808, 73.7890],
  "aundh": [18.5602, 73.8077],
  "kothrud": [18.5074, 73.8077],
  "hadapsar": [18.5089, 73.9260],
  "shivajinagar": [18.5308, 73.8475],
  "kharadi": [18.5515, 73.9348],
  "viman nagar": [18.5679, 73.9143],
};

  return (
    <>
      <PageHeading
        eyebrow="NEIGHBORHOOD EXPLORER"
        title={<>Community <span>map.</span></>}
        description="Explore reported issues and see where your community needs attention."
        action={
          <div className="map-live">
            <span /> Live map
          </div>
        }
      />

      <div className="map-stat-row">
        <div>
          <MapPinned size={16} />
          <strong>{issues.length}</strong>
          <span>community reports</span>
        </div>

        <div>
          <span className="legend-dot high-dot" />
          <strong>
            {issues.filter(i => i.priority === "High").length}
          </strong>
          <span>high priority</span>
        </div>

        <div>
          <span className="legend-dot resolved-dot" />
          <strong>
            {issues.filter(i => i.status === "Resolved").length}
          </strong>
          <span>resolved</span>
        </div>
      </div>

      <section className="map-layout">
        <div className="panel map-panel">
          <div className="map-toolbar">
            <div className="map-search">
              <Search size={15} />
              <span>Explore Pune neighborhoods</span>
            </div>
          </div>

          <MapContainer
            center={puneCenter}
            zoom={12}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {issues.map((issue) => {
  const locationKey = issue.location?.toLowerCase().trim();

  // Find coordinates for this issue's location
  const coordinates = Object.entries(locationCoordinates).find(
    ([location]) => locationKey?.includes(location)
  )?.[1];

  // Skip issues whose location isn't mapped yet
  if (!coordinates) return null;

  // Marker color based on issue priority
  const markerColor =
    issue.priority === "High"
      ? "#ef4444"
      : issue.priority === "Medium"
      ? "#f59e0b"
      : "#22c55e";

  const markerIcon = L.divIcon({
    className: "custom-issue-marker",
    html: `<div style="
      background:${markerColor};
      width:16px;
      height:16px;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  return (
    <Marker
      key={issue.id}
      position={coordinates}
      icon={markerIcon}
      eventHandlers={{
        click: () => setSelected(issue),
      }}
    >
      <Popup>
        <strong>{issue.title}</strong>
        <br />
        {issue.location}
        <br />
        Priority: {issue.priority}
        <br />
        Status: {issue.status}
      </Popup>
    </Marker>
  );
})}
          </MapContainer>
        </div>

        <div className="panel map-issues-panel">
          <div className="panel-heading">
            <div>
              <h3>Nearby reports</h3>
              <p>Issues reported by the community</p>
            </div>

            <span className="count-pill">{issues.length}</span>
          </div>

          <div className="map-issue-list">
            {issues.map(issue => (
              <button
                key={issue.id}
                className="map-issue-item"
                onClick={() => setSelected(issue)}
              >
                <span
                  className={`priority-dot ${issue.priority.toLowerCase()}`}
                />

                <span>
                  <strong>{issue.title}</strong>
                  <small>{issue.location}</small>
                </span>

                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>

          {selected && (
            <IssueDetail
              issue={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      </section>
    </>
  );
}


function IssueDetail({ issue, onClose }) {
  return (
    <div className="issue-detail">
      <span className={`status-badge ${issue.status.replaceAll(" ", "-").toLowerCase()}`}>
        {issue.status}
      </span>
      <h4>{issue.title}</h4>

        {issue.photo_url && (
          <img
            className="issue-detail-photo"
            src={
              issue.photo_url.startsWith("http")
                ? issue.photo_url
                : `https://civiclens-api-39xh.onrender.com${issue.photo_url}`
            }
            alt={`Photo for ${issue.title}`}
          />
        )}

<p>{issue.location}</p>
      <div className="detail-meta">
        <span>{issue.id}</span>
        <span>{issue.category}</span>
        <span className={`priority ${issue.priority.toLowerCase()}`}>
          {issue.priority} priority
        </span>
      </div>
      <button className="text-button" onClick={onClose}>
        Back to reports <ArrowRight size={14} />
      </button>
    </div>
  );
}

function MiniMap({ issues }) {
  return (
    <div className="mini-map">
      <div className="mini-map-river" />
      <div className="mini-map-road mroad1" />
      <div className="mini-map-road mroad2" />
      <div className="mini-map-road mroad3" />
      {issues.slice(0, 4).map((issue, i) => (
        <span key={issue.id} className={`mini-map-pin mp${i + 1}`} />
      ))}
      <span className="mini-map-label">PUNE</span>
    </div>
  );
}


function MiniChart({ issues = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create dates for the last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));

    return date;
  });

  // Count reports created on each day
  const values = days.map((day) => {
    return issues.filter((issue) => {
      if (!issue.created_at) return false;

      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);

      return issueDate.getTime() === day.getTime();
    }).length;
  });

  // Set chart scale based on actual report counts
  const maxValue = Math.max(1, ...values);
  const chartMax = Math.ceil(maxValue / 5) * 5 || 5;

  const labels = days.map((day) =>
    day.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)
  );

  return (
    <div className="mini-chart">
      <div className="chart-y-labels">
        <span>{chartMax}</span>
        <span>{Math.round(chartMax / 2)}</span>
        <span>0</span>
      </div>

      <div className="chart-bars">
        {values.map((value, i) => (
          <div className="chart-bar-group" key={i}>
            <div
              className={`chart-bar ${i === 6 ? "highlight" : ""}`}
              style={{
                height: `${(value / chartMax) * 100}%`,
                minHeight: value > 0 ? "4px" : "0",
              }}
              title={`${value} reports`}
            />

            <span>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function Analytics({ issues, resolvedCount, activeCount }) {
  const categories = [
    "Roads", "Sanitation", "Electricity", "Water Supply", "Public Spaces", "Other"
  ];

  const max = Math.max(
    1,
    ...categories.map(c => issues.filter(i => i.category === c).length)
  );

  const resolution = issues.length
    ? Math.round(resolvedCount / issues.length * 100)
    : 0;

  return (
    <>
      <PageHeading
        eyebrow="COMMUNITY INSIGHTS"
        title={<>Data that drives<br /><span>change.</span></>}
        description="Understand local issue patterns, resolution progress, and community needs."
        action={
          <button className="secondary-button" onClick={() => window.print()}>
            <Download size={16} /> Export overview
          </button>
        }
      />

      <div className="stats-grid analytics-stats">
        <StatCard icon={Activity} label="Total reports" value={issues.length} description="All submitted issues" color="violet" trend="Community activity" />
        <StatCard icon={CheckCircle2} label="Resolution rate" value={`${resolution}%`} description="Reports marked resolved" color="pink" trend="Resolution progress" />
        <StatCard icon={Clock3} label="Open issues" value={activeCount} description="Awaiting resolution" color="amber" trend="Active workload" />
        <StatCard icon={TrendingUp} label="Avg. community votes" value={issues.length ? Math.round(issues.reduce((a, i) => a + i.votes, 0) / issues.length) : 0} description="Engagement per report" color="blue" trend="Resident engagement" />
      </div>

      <div className="analytics-grid">
        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div><h3>Reports by category</h3><p>Distribution of community issues</p></div>
            <span className="chart-label">ALL TIME</span>
          </div>
          <div className="category-chart">
            {categories.map((cat, i) => {
              const count = issues.filter(issue => issue.category === cat).length;

              return (
                <div className="category-row" key={cat}>
                  <div className="category-row-label">
                    <span>{cat}</span><strong>{count}</strong>
                  </div>
                  <div className="category-track">
                    <div className={`category-fill fill-${i}`} style={{ width: `${count / max * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div><h3>Resolution progress</h3><p>Community reports closed</p></div>
            <span className="chart-label">OVERVIEW</span>
          </div>
          <div className="resolution-ring" style={{ "--progress": `${resolution * 3.6}deg` }}>
            <div><strong>{resolution}%</strong><span>resolved</span></div>
          </div>
          <div className="ring-legend">
            <span><i className="legend-dot resolved-dot" />Resolved <strong>{resolvedCount}</strong></span>
            <span><i className="legend-dot high-dot" />Active <strong>{activeCount}</strong></span>
          </div>
        </section>
      </div>

      <section className="panel analytics-panel trend-panel">
        <div className="panel-heading">
          <div>
            <h3>Weekly activity</h3>
            <p>Actual report volume over the last 7 days</p>
          </div>
          <span className="chart-label">LAST 7 DAYS</span>
        </div>

  <MiniChart issues={issues} />
</section>
    </>
  );
}

function SettingsPage({ user }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [issueUpdates, setIssueUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [appearance, setAppearance] = useState("Midnight Aurora");

  return (
    <>
      <PageHeading
        eyebrow="PREFERENCES"
        title={<>Your space,<br /><span>your settings.</span></>}
        description="Manage your profile, notifications, and CivicLens experience."
      />

      <div className="settings-layout">
        <div className="settings-main">
          <section className="panel settings-panel">
            <div className="settings-section-title">
              <div className="settings-icon"><UserRound size={17} /></div>
              <div><h3>Profile</h3><p>Your resident account information</p></div>
            </div>

            <div className="profile-edit">
              <div className="large-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
              <div>
                <strong>{user.name}</strong>
                <span>Resident account · Pune, India</span>
                <button className="text-button">Edit profile <ArrowUpRight size={14} /></button>
              </div>
            </div>

            <div className="settings-field">
              <label>Display name</label>
              <input defaultValue={user.name || ""} />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input defaultValue={user.email || ""} readOnly />
            </div>
            <div className="settings-field">
              <label>Location</label>
              <input defaultValue="Pune, Maharashtra" />
            </div>
          </section>

          <section className="panel settings-panel">
            <div className="settings-section-title">
              <div className="settings-icon"><Bell size={17} /></div>
              <div><h3>Notifications</h3><p>Choose what updates you'd like to receive</p></div>
            </div>
            <ToggleRow title="Email notifications" description="Receive important community updates by email" checked={emailNotifications} onChange={setEmailNotifications} />
            <ToggleRow title="Issue status updates" description="Get notified when your reported issue changes status" checked={issueUpdates} onChange={setIssueUpdates} />
            <ToggleRow title="Weekly community digest" description="A weekly summary of reports and resolutions" checked={weeklyDigest} onChange={setWeeklyDigest} />
          </section>

          <section className="panel settings-panel">
            <div className="settings-section-title">
              <div className="settings-icon"><Moon size={17} /></div>
              <div><h3>Appearance</h3><p>Personalize your workspace</p></div>
            </div>
            <label className="settings-field">
              <span>Color theme</span>
              <select value={appearance} onChange={e => setAppearance(e.target.value)}>
                <option>Midnight Aurora</option>
                <option>System default</option>
              </select>
            </label>
            <div className="theme-preview">
              <span className="theme-swatch swatch-midnight" />
              <span className="theme-swatch swatch-violet" />
              <span className="theme-swatch swatch-pink" />
              <span className="theme-preview-label">{appearance}</span>
            </div>
          </section>
        </div>

        <aside className="settings-side">
          <div className="panel settings-help">
            <div className="help-orb"><Sparkles size={20} /></div>
            <h3>Need a hand?</h3>
            <p>We're here to help you make the most of CivicLens.</p>
            <button className="secondary-button"><Mail size={15} /> Contact support</button>
          </div>
          <div className="settings-side-note">
            <ShieldCheck size={16} />
            <span>Your community data is treated with care. Settings are saved locally in this demo.</span>
          </div>
        </aside>
      </div>
    </>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div><strong>{title}</strong><p>{description}</p></div>
      <button
        className={`toggle ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span />
      </button>
    </div>
  );
}

function ReportModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Roads");
  const [priority, setPriority] = useState("Medium");
  const [photo, setPhoto] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !location.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      location: location.trim(),
      category,
      priority,
      photo,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="report-modal"
        onSubmit={handleSubmit}
        onClick={event => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />NEW SUBMISSION
            </div>
            <h3>Report an issue</h3>
            <p>Tell us what needs attention in your community.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <label>
          Issue title
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Broken streetlight"
            required
          />
        </label>

        <label>
          Location
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Baner, Pune"
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>Roads</option>
            <option>Sanitation</option>
            <option>Electricity</option>
            <option>Water Supply</option>
            <option>Public Safety</option>
            <option>Public Spaces</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Priority
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>

        <label>
        Attach a photo (optional)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0] || null)}
        />
      </label>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            <Plus size={16} /> Submit report
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
