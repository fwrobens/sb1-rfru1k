"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/lib/auth';

const plans = [
  {
    name: 'Basic',
    price: '$4.99',
    features: [
      'Unlimited notes',
      'Basic text formatting',
      '1GB storage',
    ],
    stripePriceId: 'price_1PgHXX2MWRGKp8gNxxxxxxxx', // Replace with actual Stripe Price ID
  },
  {
    name: 'Premium',
    price: '$9.99',
    features: [
      'Everything in Basic',
      'Advanced formatting options',
      '10GB storage',
      'Collaboration features',
    ],
    stripePriceId: 'price_1PgHXY2MWRGKp8gNyyyyyyyy', // Replace with actual Stripe Price ID
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleSubscribe = async (stripePriceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      router.push('/signin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: stripePriceId, userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error('Failed to load Stripe');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user === null) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-card p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm">/month</span></p>
            <ul className="mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="mb-2">{feature}</li>
              ))}
            </ul>
            <Button
              onClick={() => handleSubscribe(plan.stripePriceId)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}