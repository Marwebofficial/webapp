
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Frown } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-10.5rem)] w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
        <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-4 rounded-full">
                    <Frown className="w-16 h-16 text-destructive" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <CardTitle className="text-4xl font-extrabold">404 - Not Found</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    Oops! The page you are looking for does not exist or has been moved.
                </CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/">Go Back Home</Link>
                </Button>
            </CardContent>
        </Card>
    </main>
  );
}
