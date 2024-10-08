"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the User interface
interface User {
  id: string;
  email: string;
  subscription: string;
  role: string;
  status: string;
}

// Define the Note interface
interface Note {
  id: string;
  title: string;
  userId: string;
  createdAt: string; // or Date, depending on how you handle date values
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]); // Use the Note type
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchNotes();
    }
  }, [user]);

  const fetchUsers = async () => {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    const fetchedUsers: User[] = []; // Specify the type here
    querySnapshot.forEach((doc) => {
      fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
    });
    setUsers(fetchedUsers);
  };

  const fetchNotes = async () => {
    const q = query(collection(db, 'notes'));
    const querySnapshot = await getDocs(q);
    const fetchedNotes: Note[] = []; // Specify the type here
    querySnapshot.forEach((doc) => {
      fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
    });
    setNotes(fetchedNotes);
  };

  const handleUpdateUser = async (userId: string, field: string, value: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { [field]: value });
      fetchUsers();
      toast({
        title: "User Updated",
        description: `User ${field} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update user ${field}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        fetchUsers();
        toast({
          title: "User Deleted",
          description: "User has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mx-auto px-4 py-8">Access denied. Admin only.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Users ({users.length})</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) => handleUpdateUser(user.id, 'subscription', value)}
                      defaultValue={user.subscription}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subscription" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) => handleUpdateUser(user.id, 'role', value)}
                      defaultValue={user.role || 'user'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) => handleUpdateUser(user.id, 'status', value)}
                      defaultValue={user.status || 'active'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteUser(user.id)} variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Notes ({notes.length})</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.userId}</TableCell>
                  <TableCell>{new Date(note.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
