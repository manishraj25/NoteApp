import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Notes() {
    const { token } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [editNoteId, setEditNoteId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await axios.get("http://localhost:8081/api/notes", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotes(res.data);
            } catch (err) {
                if (err.response?.status === 403) navigate("/login");
            }
        };
        fetchNotes();
    }, [token, navigate]);

    const addNote = async () => {
        if (!newTitle.trim() || !newNote.trim()) return;

        const res = await axios.post(
            "http://localhost:8081/api/notes",
            {
                title: newTitle,
                content: newNote
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes([...notes, res.data]);
        setNewTitle("");
        setNewNote("");
    };

    const deleteNote = async (id) => {
        await axios.delete(`http://localhost:8081/api/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(notes.filter((note) => note.id !== id));
    };

    const startEdit = (note) => {
        setEditNoteId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
    };

    const saveEdit = async (id) => {
        if (!editTitle.trim() || !editContent.trim()) return;

        const res = await axios.put(
            `http://localhost:8081/api/notes/${id}`,
            { title: editTitle, content: editContent },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes(notes.map((n) => (n.id === id ? res.data : n)));
        setEditNoteId(null);
        setEditTitle("");
        setEditContent("");
    };

    return (
        <div className=" mx-auto md:mt-5 p-6 md:rounded-lg bg-gray-400 w-full min-h-[100vh] md:min-h-[87vh]    md:w-[80vw] ">
            <div className="flex justify-center">
                <h2 className="sm:text-2xl text-xl font-bold mb-6 text-gray-800 md:text-3xl">Welcome to Note App📝</h2>
            </div>

            {/* Add Note */}
            <div className="flex text-xs sm:text-sm md:text-lg justify-center">

                <div className="flex flex-col gap-2 mb-6 border-2 p-4 w-[80%] sm:w-[70%]">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title..."
                        className="flex-grow px-4 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write a note..."
                        className="flex-grow px-4 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                        onClick={addNote}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-md transition"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <h2 id="noteList" className="sm:text-xl text-lg font-bold mb-3 text-gray-800 md:text-2xl">📝 Your Notes</h2>
            {notes.length === 0 ? (
                <p className="text-gray-500 italic px-2 text-sm md:text-base"> No notes yet. Start by adding one!</p>
            ) : (
                <ul className="space-y-4 sm:text-sm text-xs md:text-base overflow-y-scroll h-full " >
                    {notes.map((note) => (
                        <li
                            key={note.id}
                            className="flex justify-between items-center bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex flex-col flex-grow">
                                {editNoteId === note.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="px-3 py-1 mb-1 border rounded-lg focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="text"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-400"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-semibold text-gray-900">{note.title}</h3>
                                        <p className="text-gray-700">{note.content}</p>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2 ml-3">
                                {editNoteId === note.id ? (
                                    <>
                                        <button
                                            onClick={() => saveEdit(note.id)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md shadow-sm transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditNoteId(null)}
                                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1.5 rounded-md shadow-sm transition"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEdit(note)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md shadow-sm transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded-md shadow-sm transition"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
