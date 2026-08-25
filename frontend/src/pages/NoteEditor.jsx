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
const ITEM_TYPES = ["checklist", "todo", "goal"];

const generateId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const emptyItem = () => ({ id: generateId(), text: "", checked: false });

const escapeHtml = (str = "") =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildItemsHtml = (items, noteType) => {
  if (noteType === "todo") {
    return `<ul class="dot-list">${items
      .map((item) => `<li><span>${escapeHtml(item.text)}</span></li>`)
      .join("")}</ul>`;
  }
  return items
    .map(
      (item) =>
        `<div class="task-item"><input type="checkbox" ${item.checked ? "checked" : ""} /><span>${escapeHtml(item.text)}</span></div>`,
    )
    .join("");
};


const parseItemsFromHtml = (html = "", noteType) => {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (noteType === "todo") {
    return Array.from(doc.querySelectorAll(".dot-list li")).map((li) => ({
      id: generateId(),
      text: li.querySelector("span")?.textContent || li.textContent || "",
      checked: false,
    }));
  }
  return Array.from(doc.querySelectorAll(".task-item")).map((row) => ({
    id: generateId(),
    text: row.querySelector("span")?.textContent || "",
    checked: Boolean(row.querySelector("input")?.hasAttribute("checked")),
  }));
};

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const itemRefs = useRef({});
  const isEditing = Boolean(id);
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [color, setColor] = useState("purple");
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [colorManuallySelected, setColorManuallySelected] = useState(false);
  const [goalPeriod, setGoalPeriod] = useState("weekly");
  const [items, setItems] = useState([]);
  const [pendingFocusId, setPendingFocusId] = useState(null);

  useEffect(() => {
    if (!isEditing) return undefined;

    const loadNote = setTimeout(() => {
      api.get(`/notes/${id}`)
        .then((response) => {
          const note = response.data.data.note;
          const type = note.noteType || "note";
          setTitle(note.title || "");
          setNoteType(type);
          setColor(note.color || "purple");
          setGoalPeriod(note.goalPeriod || "weekly");
          setPinned(Boolean(note.pinned));

          if (ITEM_TYPES.includes(type)) {
            const parsed = parseItemsFromHtml(note.content, type);
            setItems(parsed.length ? parsed : [emptyItem()]);
          } else {
            setInitialContent(note.content || "");
          }
        })
        .catch(() => {
          setLoadFailed(true);
          setError("This note could not be loaded. Please return to your dashboard.");
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(loadNote);
  }, [id, isEditing]);

  // useEffect(() => {
  //   const updateFormats = () => {
  //     if (!editorRef.current) return;
  //     const selection = window.getSelection();
  //     if (!selection || !selection.anchorNode || !editorRef.current.contains(selection.anchorNode)) return;
  //     setActiveFormats({
  //       bold: document.queryCommandState("bold"),
  //       italic: document.queryCommandState("italic"),
  //     });
  //   };
  //   document.addEventListener("selectionchange", updateFormats);
  //   return () => document.removeEventListener("selectionchange", updateFormats);
  // }, []);

  useEffect(() => {
    if (pendingFocusId && itemRefs.current[pendingFocusId]) {
      itemRefs.current[pendingFocusId].focus();
      setPendingFocusId(null);
    }
  }, [items, pendingFocusId]);


  const selectType = (type) => {
    setNoteType(type.value);
    if (!colorManuallySelected) setColor(type.color);

    if (ITEM_TYPES.includes(type.value) && items.length === 0) {
      const first = emptyItem();
      setItems([first]);
      setPendingFocusId(first.id);
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

  const updateItemText = (itemId, text) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, text } : item)));
  };

  const toggleItemChecked = (itemId) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)));
  };

  const addItemAfter = (afterId) => {
    const newItem = emptyItem();
    setItems((current) => {
      const index = current.findIndex((item) => item.id === afterId);
      if (index === -1) return [...current, newItem];
      const next = [...current];
      next.splice(index + 1, 0, newItem);
      return next;
    });
    setPendingFocusId(newItem.id);
  };

  const removeItem = (itemId, focusPreviousId) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
    if (focusPreviousId) setPendingFocusId(focusPreviousId);
  };

  // Enter creates a new row right after this one and focuses it. Backspace
  // on an already-empty row deletes it and returns focus to the row above —
  // both are the standard behavior for any checklist/to-do app.
  const handleItemKeyDown = (event, item, index) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addItemAfter(item.id);
      return;
    }
    if (event.key === "Backspace" && item.text === "" && items.length > 1) {
      event.preventDefault();
      const previous = items[index - 1];
      removeItem(item.id, previous?.id);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    setError("");

    const content = ITEM_TYPES.includes(noteType)
      ? buildItemsHtml(items, noteType)
      : editorRef.current?.innerHTML || "";

    const payload = {
      title: title.trim() || "Untitled Note",
      content,
      noteType,
      color,
      pinned,
      ...(noteType === "goal" ? { goalPeriod } : {}),
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
  if (loadFailed) return <div className="editor-error">Failed to load the note. Please try again.</div>;

  const isItemType = ITEM_TYPES.includes(noteType);

  return (
    <main className="editor-page">
      <header className="editor-header">
        <button type="button" className="back-button" onClick={() => navigate("/dashboard")}>← <span>All notes</span></button>
        <div className="editor-actions">
          <button type="button" className="cancel-button" onClick={() => navigate("/dashboard")}>Cancel</button>
          <button type="button" className="primary-button" onClick={saveNote} disabled={saving || loadFailed}>{saving ? "Saving…" : "Save note"}</button>
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

        {noteType === "goal" && (
          <span className="goal-title-badge">{goalPeriod === "monthly" ? "Monthly Goal" : "Weekly Goal"}</span>
        )}

        <input id="note-title" name="title" className="note-title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your note a title" aria-label="Note title" />

        <div className="type-picker" aria-label="Note type">
          {NOTE_TYPES.map((type) => <button key={type.value} type="button" className={noteType === type.value ? "type-active" : ""} onClick={() => selectType(type)}><b>{type.icon}</b><span>{type.label}<small>{type.description}</small></span></button>)}
        </div>

        {noteType === "goal" && (
          <div className="goal-period-picker">
            <button type="button" className={goalPeriod === "weekly" ? "active" : ""} onClick={() => setGoalPeriod("weekly")}>Weekly</button>
            <button type="button" className={goalPeriod === "monthly" ? "active" : ""} onClick={() => setGoalPeriod("monthly")}>Monthly</button>
          </div>
        )}

        {!isItemType && (
          <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
            <button type="button" onClick={() => applyFormat("bold")} aria-label="Bold"><b>B</b></button>
            <button type="button" onClick={() => applyFormat("italic")} aria-label="Italic"><i>I</i></button>
            <button type="button" onClick={() => applyFormat("formatBlock", "h3")} aria-label="Heading">H</button>
            <button type="button" onClick={() => applyFormat("insertUnorderedList")} aria-label="Bulleted list">☷</button>
            <button type="button" onClick={() => applyFormat("insertOrderedList")} aria-label="Numbered list">≣</button>
          </div>
        )}

        {isItemType ? (
          <div className="items-editor">
            {items.map((item, index) => (
              <div key={item.id} className={`item-row ${noteType === "todo" ? "dot-row" : "check-row"}`}>
                {noteType === "todo" ? (
                  <span className="row-dot" aria-hidden="true" />
                ) : (
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItemChecked(item.id)}
                    aria-label={noteType === "goal" ? "Milestone complete" : "Task complete"}
                  />
                )}
                <input
                  type="text"
                  id={`item-${item.id}`}
                  name={`item-${item.id}`}
                  className={`item-text ${item.checked ? "is-done" : ""}`}
                  value={item.text}
                  placeholder={noteType === "goal" ? "Milestone" : "Task"}
                  onChange={(event) => updateItemText(item.id, event.target.value)}
                  onKeyDown={(event) => handleItemKeyDown(event, item, index)}
                  ref={(el) => { itemRefs.current[item.id] = el; }}
                />
              </div>
            ))}
            <button type="button" className="add-item-button" onClick={() => addItemAfter(items[items.length - 1]?.id)}>
              + Add {noteType === "goal" ? "milestone" : "item"}
            </button>
          </div>
        ) : (
          <div
            ref={editorRef}
            className="rich-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start writing here…"
            role="textbox"
            aria-multiline="true"
            dangerouslySetInnerHTML={{ __html: initialContent }}
          />
        )}

        <footer className="editor-footer">
          <div className="color-picker" aria-label="Note colour">
            <span>Card colour</span>
            {COLORS.map((tone) => <button key={tone} type="button" aria-label={tone} className={`color-dot color-${tone} ${color === tone ? "selected" : ""}`} onClick={() => { setColor(tone); setColorManuallySelected(true); }} />)}
          </div>
          <span className="editor-hint">Tip: use the toolbar to make your note your own.</span>
        </footer>
        {error && <p className="editor-error" role="alert">{error}</p>}
      </section>
    </main>
  );
};

export default NoteEditor;