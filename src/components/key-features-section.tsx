
import { Smartphone, BrainCircuit, GraduationCap } from 'lucide-react';
import React from 'react';

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-4 p-6 rounded-xl border bg-background/50 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export function KeyFeaturesSection() {
    return (
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Your All-in-One Platform
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                From essential digital services to groundbreaking AI learning tools, we've got you covered.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <FeatureCard
                icon={<Smartphone className="w-8 h-8 text-primary" />}
                title="Data Solutions"
                description="Instantly buy cheap data, top up airtime, and manage your TV subscriptions for all major Nigerian providers."
              />
              <FeatureCard
                icon={<BrainCircuit className="w-8 h-8 text-primary" />}
                title="Advanced AI Tools"
                description="Experience our powerful AI integrations designed to streamline your tasks and enhance your productivity."
              />
              <FeatureCard
                icon={<GraduationCap className="w-8 h-8 text-primary" />}
                title="Educational Resources"
                description="Get ready for AI-powered tutoring, access to past questions, and comprehensive exam preparation tools. (Coming Soon!)"
              />
            </div>
          </div>
        </section>
    );
}