"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const fetchedNotes: Note[] = [];
    querySnapshot.forEach((doc) => {
      fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
    });
    setNotes(fetchedNotes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), {
          title,
          content,
        });
        setEditingNote(null);
      } else {
        await addDoc(collection(db, 'notes'), {
          userId: user.uid,
          title,
          content,
          createdAt: new Date().toISOString(),
        });
      }
      setTitle('');
      setContent('');
      fetchNotes();
      toast({
        title: editingNote ? "Note Updated" : "Note Created",
        description: editingNote ? "Your note has been updated successfully." : "Your note has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      fetchNotes();
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the note. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-1">Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block mb-1">Content</label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
              />
            </div>
            <Button type="submit">
              {editingNote ? 'Update Note' : 'Create Note'}
            </Button>
            {editingNote && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingNote(null);
                  setTitle('');
                  setContent('');
                }}
                className="ml-2"
              >
                Cancel Edit
              </Button>
            )}
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Notes</h2>
          {notes.length === 0 ? (
            <p>You haven't created any notes yet.</p>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="bg-card p-4 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
                  <p className="mb-4">{note.content}</p>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(note)} variant="outline">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(note.id)} variant="destructive">
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}