import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to NoteNest</h1>
        <p className="text-xl mb-8">Your personal space for organized thoughts and ideas</p>
        <Link href="/signup">
          <Button size="lg">Get Started</Button>
        </Link>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Secure Storage"
            description="Your notes are encrypted and stored securely in the cloud."
          />
          <FeatureCard
            title="Rich Text Editing"
            description="Create beautiful notes with our powerful rich text editor."
          />
          <FeatureCard
            title="Collaboration"
            description="Share and collaborate on notes with team members."
          />
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <PricingCard
            title="Basic"
            price="$4.99"
            features={[
              "Unlimited notes",
              "Basic text formatting",
              "1GB storage",
            ]}
          />
          <PricingCard
            title="Premium"
            price="$9.99"
            features={[
              "Everything in Basic",
              "Advanced formatting options",
              "10GB storage",
              "Collaboration features",
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function PricingCard({ title, price, features }: { title: string; price: string; features: string[] }) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-md text-center">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-4">{price}<span className="text-sm">/month</span></p>
      <ul className="mb-6">
        {features.map((feature, index) => (
          <li key={index} className="mb-2">{feature}</li>
        ))}
      </ul>
      <Link href="/pricing">
        <Button>Choose Plan</Button>
      </Link>
    </div>
  );
}