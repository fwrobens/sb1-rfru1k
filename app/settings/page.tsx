"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscription, setSubscription] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setName(userData.name || '');
      setEmail(user.email || '');
      setSubscription(userData.subscription || 'Free');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
      });
      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        subscription: 'Free',
      });
      setSubscription('Free');
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', user.uid));
        await signOut();
        router.push('/');
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!user) {
    return <div>Please sign in to access settings.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="name" className="block mb-1">Name</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <Input
            id="email"
            value={email}
            disabled
          />
        </div>
        <div>
          <label htmlFor="subscription" className="block mb-1">Subscription</label>
          <Input
            id="subscription"
            value={subscription}
            disabled
          />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
      <div className="mt-8 space-y-4">
        <Button onClick={handleCancelSubscription} variant="outline" className="w-full">
          Cancel Subscription
        </Button>
        <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
          Delete Account
        </Button>
      </div>
    </div>
  );
}