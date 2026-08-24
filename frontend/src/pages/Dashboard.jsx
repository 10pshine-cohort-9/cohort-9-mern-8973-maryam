
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/DashboardControls.css";

const NOTE_DETAILS = {
  note: { label: "Note", icon: "✦", color: "purple" },
  checklist: { label: "Checklist", icon: "✓", color: "teal" },
  todo: { label: "To-do", icon: "○", color: "orange" },
  goal: { label: "Goal", icon: "↗", color: "navy" },
};

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, "");
const formatDate = (date) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));

const getPreviewItems = (html = "", noteType) => {
  if (!html || (noteType !== "checklist" && noteType !== "goal" && noteType !== "todo")) return null;
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (noteType === "todo") {
    const items = Array.from(doc.querySelectorAll(".dot-list li")).slice(0, 3).map((li) => ({
      text: li.querySelector("span")?.textContent?.trim() || li.textContent.trim(),
    }));
    if (items.length) return { kind: "dot", items };
    const plainText = stripHtml(html).trim();
    return plainText ? { kind: "dot", items: [{ text: plainText }] } : null;
  }

  const items = Array.from(doc.querySelectorAll(".task-item")).slice(0, 3).map((item) => ({
    text: item.querySelector("span")?.textContent?.trim() || "",
    checked: Boolean(item.querySelector("input")?.hasAttribute("checked")),
  }));
  if (items.length) return { kind: "task", items };

  const plainText = stripHtml(html).trim();
  return plainText ? { kind: "task", items: [{ text: plainText, checked: false }] } : null;
};

const goalLabel = (period) => (period === "monthly" ? "Monthly Goal" : "Weekly Goal");

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [menuOpen]);

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notes");
      setNotes(response.data.data.notes);
    } catch {
      setError("Could not load your notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadNotes = setTimeout(() => { void fetchNotes(); }, 0);
    return () => clearTimeout(loadNotes);
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((currentNotes) => currentNotes.filter((note) => note._id !== id));
      setDeleteId(null);
    } catch {
      setError("Could not delete note. Please try again.");
      setDeleteId(null);
    }
  };

  const togglePin = async (note) => {
    try {
      const response = await api.put(`/notes/${note._id}`, { pinned: !note.pinned });
      setNotes((currentNotes) => currentNotes.map((item) => (item._id === note._id ? response.data.data.note : item)));
    } catch {
      setError("Could not update the pin. Please try again.");
    }
  };

  const name = user?.name?.split(" ")[0] || "there";

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/dashboard" className="brand"><span className="brand-mark">✦</span> NoteNest</Link>
        <div className="header-actions">
  <span className="user-greeting">Hello, {name}</span>
  <div className="user-menu" ref={menuRef}>
    <button 
      type="button" 
      className="avatar" 
      onClick={(event) => { 
        event.stopPropagation(); 
        setMenuOpen((value) => !value); 
      }} 
      aria-haspopup="true" 
      aria-expanded={menuOpen} 
      aria-label="Account menu"
    >
      {name.charAt(0).toUpperCase()}
    </button>
    {menuOpen && (
      <div className="user-dropdown" role="menu">
        <button 
          type="button" 
          className="dropdown-logout" 
          role="menuitem" 
          onClick={logout}
        >
          Log out <span>→</span>
        </button>
      </div>
    )}
  </div>
</div>

      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <span className="eyebrow">Your personal collection</span>
            <h1>Ready to write<br />something <em>new?</em></h1>
            <p>Keep your ideas, tasks, and goals together in one bright little space.</p>
          </div>
          <div className="hero-doodle" aria-hidden="true"><span>✎</span><i /><b /></div>
        </section>

        <section className="notes-toolbar" aria-label="Notes overview">
          <div><h2>Your notes <span>{notes.length}</span></h2><p>Pin the things you want to keep close.</p></div>
          <button type="button" className="primary-button new-note-button" onClick={() => navigate("/notes/new")}><span>+</span> New note</button>
        </section>

        {loading ? <div className="notes-message"><div className="loading-orbit" />Loading your notes…</div>
          : error ? <div className="notes-message notes-error"><span>!</span><p>{error}</p><button type="button" onClick={fetchNotes}>Try again</button></div>
            : notes.length === 0 ? <div className="empty-notes"><div>✦</div><h2>Your page is waiting.</h2><p>Start with a thought, a plan, or a tiny reminder for later.</p><button type="button" className="primary-button" onClick={() => navigate("/notes/new")}>Create your first note</button></div>
              : <section className="notes-grid" aria-label="Your notes">
                {[...notes].sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1)).map((note) => {
                  const details = NOTE_DETAILS[note.noteType] || NOTE_DETAILS.note;
                  const color = note.color || details.color;
                  const label = note.noteType === "goal" ? goalLabel(note.goalPeriod) : details.label;
                  const preview = getPreviewItems(note.content, note.noteType);
                  return <article key={note._id} className={`note-card note-card-${color}`}>
                    <Link to={`/notes/${note._id}`} className="note-card-link" aria-label={`Open ${note.title}`}>
                      <div className="note-card-topline"><span className="note-type"><b>{details.icon}</b>{label}</span></div>
                      <h3>{note.title || "Untitled Note"}</h3>
                      {preview ? (
                        <ul className="note-preview-list">
                          {preview.items.map((item, index) => (
                            <li key={index} className={item.checked ? "is-done" : ""}>
                              <span className={preview.kind === "dot" ? "preview-dot" : "preview-check"} />
                              {item.text || "Untitled item"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{stripHtml(note.content) || "A blank page can be a lovely place to begin."}</p>
                      )}
                      <footer><span>Updated {formatDate(note.updatedAt)}</span><span className="card-arrow">↗</span></footer>
                    </Link>
                    <button type="button" className={`pin-card ${note.pinned ? "is-pinned" : ""}`} onClick={() => togglePin(note)} aria-pressed={Boolean(note.pinned)}>{note.pinned ? "Pinned" : "Pin"} <span>⌁</span></button>
                    <button type="button" className="delete-note" onClick={() => setDeleteId(note._id)} aria-label={`Delete ${note.title}`}>×</button>
                  </article>;
                })}
              </section>}
      </main>

      {deleteId && <div className="modal-backdrop" role="presentation"><section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-heading"><span className="modal-icon">×</span><h2 id="delete-heading">Delete this note?</h2><p>It will be removed from your collection permanently.</p><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setDeleteId(null)}>Keep it</button><button type="button" className="danger-button" onClick={() => handleDelete(deleteId)}>Delete note</button></div></section></div>}
    </div>
  );
};

export default Dashboard;