
import { BrainCircuit, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function FutureFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
    return (
        <Card className="text-center p-6 border-0 shadow-lg bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <CardHeader className="items-center p-0">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export function FutureUpdatesSection() {
    return (
        <section id="ai-tools" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm text-primary font-semibold">
                Coming Soon
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                The Future of Learning is Here
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                We're building a suite of AI-powered tools to revolutionize the way you learn and prepare for exams.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FutureFeatureCard
                icon={<BrainCircuit className="w-8 h-8 text-primary" />}
                title="Personalized AI Tutor"
                description="Get instant, one-on-one help with complex subjects, tailored to your learning style."
              />
              <FutureFeatureCard
                icon={<BookOpen className="w-8 h-8 text-primary" />}
                title="Interactive Exam Prep"
                description="Access a vast library of past questions and get real-time feedback on your performance."
              />
              <FutureFeatureCard
                icon={<GraduationCap className="w-8 h-8 text-primary" />}
                title="Goal-Oriented Learning"
                description="Set your academic goals and let our AI create a customized study plan to help you succeed."
              />
            </div>
          </div>
        </section>
    );
}