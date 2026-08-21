import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/NoteEditor.css";

const NOTE_TYPES = [
  { value: "note", label: "Note", icon: "✦", color: "purple", description: "Free writing" },
  { value: "checklist", label: "Checklist", icon: "✓", color: "teal", description: "Tick things off" },
  { value: "todo", label: "To-do", icon: "○", color: "orange", description: "Plan your tasks" },
  { value: "goal", label: "Goal", icon: "↗", color: "navy", description: "Move forward" },
];

const COLORS = ["purple", "teal", "orange", "navy", "cream", "blue", "mustard"];

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const isEditing = Boolean(id);
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [color, setColor] = useState("purple");
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    if (!isEditing) return undefined;

    const loadNote = setTimeout(() => {
      api.get(`/notes/${id}`)
        .then((response) => {
          const note = response.data.data.note;
          setTitle(note.title || "");
          setNoteType(note.noteType || "note");
          setColor(note.color || "purple");
          setPinned(Boolean(note.pinned));
          setInitialContent(note.content || "");
        })
        .catch(() => setError("This note could not be loaded. Please return to your dashboard."))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(loadNote);
  }, [id, isEditing]);

  const selectType = (type) => {
    setNoteType(type.value);
    setColor(type.color);

    const isEmpty = !editorRef.current?.innerText.trim();
    if (!isEmpty) return;

    if (type.value === "checklist") {
      editorRef.current.innerHTML =
        '<div class="task-item"><input type="checkbox" /> <span>New task</span></div>';
    }
    if (type.value === "todo") {
      editorRef.current.innerHTML = '<ul class="dot-list"><li>New task</li></ul>';
    }
    if (type.value === "goal") {
      editorRef.current.innerHTML =
        '<div class="goal-frequency"><label>Track this goal</label>' +
        '<select><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>' +
        '<div class="task-item"><input type="checkbox" /> <span>Milestone</span></div>';
    }
  };
const togglePin = async () => {
  if (!isEditing) return; // can't pin a note that doesn't exist in the DB yet

  const nextPinned = !pinned;
  setPinned(nextPinned); // instant visual feedback

  try {
    await api.put(`/notes/${id}`, { pinned: nextPinned });
  } catch {
    setPinned(!nextPinned); // roll back if the request fails
    setError("Could not update the pin. Please try again.");
  }
};

  const applyFormat = (command, value) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const addTask = () => {
    editorRef.current?.focus();
    if (noteType === "todo") {
      document.execCommand("insertHTML", false, '<ul class="dot-list"><li>New task</li></ul>');
      return;
    }
    document.execCommand(
      "insertHTML",
      false,
      '<div class="task-item"><input type="checkbox" /> <span>New task</span></div>',
    );
  };

  const persistCheckboxState = (event) => {
    if (event.target.matches('input[type="checkbox"]')) {
      event.target.toggleAttribute("checked", event.target.checked);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    setError("");
    const payload = {
      title: title.trim() || "Untitled Note",
      content: editorRef.current?.innerHTML || "",
      noteType,
      color,
      pinned,
    };

    try {
      if (isEditing) {
        await api.put(`/notes/${id}`, payload);
      } else {
        await api.post("/notes", payload);
      }
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Your note could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="editor-loading">Opening your note…</div>;

  return (
    <main className="editor-page">
      <header className="editor-header">
        <button type="button" className="back-button" onClick={() => navigate("/dashboard")}>← <span>All notes</span></button>
        <div className="editor-actions">
          <button type="button" className="cancel-button" onClick={() => navigate("/dashboard")}>Cancel</button>
          <button type="button" className="primary-button" onClick={saveNote} disabled={saving}>{saving ? "Saving…" : "Save note"}</button>
        </div>
      </header>

      <section className={`editor-shell editor-${color}`}>
        <div className="editor-topline">
          <span className="eyebrow">{isEditing ? "Keep shaping your thought" : "A fresh page for your thoughts"}</span>
          <button
            type="button"
            className={`pin-toggle ${pinned ? "is-pinned" : ""}`}
            onClick={togglePin}
            aria-pressed={pinned}
            disabled={!isEditing}
            title={!isEditing ? "Save your note first, then you can pin it" : ""}
          >
            <span>⌁</span> {pinned ? "Pinned" : "Pin note"}
          </button>
        </div>

        <input className="note-title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your note a title" aria-label="Note title" />

        <div className="type-picker" aria-label="Note type">
          {NOTE_TYPES.map((type) => <button key={type.value} type="button" className={noteType === type.value ? "type-active" : ""} onClick={() => selectType(type)}><b>{type.icon}</b><span>{type.label}<small>{type.description}</small></span></button>)}
        </div>

        <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
          <button type="button" onClick={() => applyFormat("bold")} aria-label="Bold"><b>B</b></button>
          <button type="button" onClick={() => applyFormat("italic")} aria-label="Italic"><i>I</i></button>
          <button type="button" onClick={() => applyFormat("formatBlock", "h3")} aria-label="Heading">H</button>
          <button type="button" onClick={() => applyFormat("insertUnorderedList")} aria-label="Bulleted list">☷</button>
          <button type="button" onClick={() => applyFormat("insertOrderedList")} aria-label="Numbered list">≣</button>
          {noteType === "checklist" && <button type="button" onClick={addTask} aria-label="Add checkbox">☐</button>}
          {noteType === "todo" && <button type="button" onClick={addTask} aria-label="Add task dot">•</button>}
        </div>

        <div ref={editorRef} className="rich-editor" contentEditable suppressContentEditableWarning data-placeholder="Start writing here…" role="textbox" aria-multiline="true" onClick={persistCheckboxState} dangerouslySetInnerHTML={{ __html: initialContent }} />

        <footer className="editor-footer">
          <div className="color-picker" aria-label="Note colour">
            <span>Card colour</span>
            {COLORS.map((tone) => <button key={tone} type="button" aria-label={tone} className={`color-dot color-${tone} ${color === tone ? "selected" : ""}`} onClick={() => setColor(tone)} />)}
          </div>
          <span className="editor-hint">Tip: use the toolbar to make your note your own.</span>
        </footer>
        {error && <p className="editor-error" role="alert">{error}</p>}
      </section>
    </main>
  );
};

export default NoteEditor;