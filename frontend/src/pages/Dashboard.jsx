import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes");
      setNotes(res.data.data.notes);
    } catch (err) {
      setError("Could not load your notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
      setDeleteId(null);
    } catch (err) {
      setError("Could not delete note. Please try again.");
    }
  };

  const stripHtml = (html) => html.replace(/<[^>]*>/g, "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="bg-white/70 backdrop-blur border-b border-purple-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📝 My Notes</h1>
          <p className="text-sm text-gray-500">Hi, {user?.name}</p>
        </div>
        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 transition">
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </h2>
          <button
            onClick={() => navigate("/notes/new")}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-200 transition"
          >
            + New Note
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-sm border border-red-100">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading your notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🌸</p>
            <p className="text-gray-500">No notes yet — create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-purple-50 p-5 cursor-pointer transition group"
                onClick={() => navigate(`/notes/${note._id}`)}
              >
                <h3 className="font-semibold text-gray-800 mb-2 truncate">{note.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">{stripHtml(note.content) || "No content"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(note._id);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-2">Delete this note?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;