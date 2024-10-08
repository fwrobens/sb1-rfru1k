"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Analytics() {
  const { user } = useAuth();
  const [notesData, setNotesData] = useState<{ date: string; count: number }[]>([]);
  const [storageData, setStorageData] = useState({ used: 0, total: 1000 }); // Assuming 1GB total storage

  useEffect(() => {
    if (user) {
      fetchNotesData();
      fetchStorageData();
    }
  }, [user]);

  const fetchNotesData = async () => {
    if (!user) return;
    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const data: { [key: string]: number } = {};
    querySnapshot.forEach((doc) => {
      const note = doc.data();
      const date = new Date(note.createdAt).toLocaleDateString();
      data[date] = (data[date] || 0) + 1;
    });
    const formattedData = Object.entries(data).map(([date, count]) => ({ date, count }));
    setNotesData(formattedData);
  };

  const fetchStorageData = async () => {
    if (!user) return;
    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    let totalSize = 0;
    querySnapshot.forEach((doc) => {
      const note = doc.data();
      totalSize += (note.content?.length || 0) * 2; // Rough estimate: 2 bytes per character
    });
    setStorageData({ used: totalSize / (1024 * 1024), total: 1000 }); // Convert to MB
  };

  const storageChartData = [
    { name: 'Used', value: storageData.used },
    { name: 'Free', value: storageData.total - storageData.used },
  ];

  if (!user) {
    return <div>Please sign in to view analytics.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Usage Analytics</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Notes Created Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={notesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Storage Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={storageChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {storageChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center mt-4">
            Used: {storageData.used.toFixed(2)} MB / {storageData.total} MB
          </p>
        </div>
      </div>
    </div>
  );
}