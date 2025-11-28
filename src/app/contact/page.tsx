'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";

const WhatsAppIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
    >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function ContactPage() {
    const phoneNumber = "2349040367103";
    const emailAddress = "samuelmarvel21@gmail.com";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    const phoneUrl = `tel:${phoneNumber}`;
    const emailUrl = `mailto:${emailAddress}`;

    return (
        <main className="flex min-h-[calc(100vh-10.5rem)] w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
            <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">Get in Touch</CardTitle>
                    <CardDescription>We're here to help. Contact us through any of the channels below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                        <Button asChild className="w-full text-lg py-8 font-bold" size="lg">
                           <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon />
                                <span>Chat on WhatsApp</span>
                           </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full text-lg py-8 font-bold" size="lg">
                            <Link href={phoneUrl}>
                                <Phone />
                                <span>Call Us</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                OR
                            </span>
                        </div>
                    </div>
                    <Button asChild variant="secondary" className="w-full text-lg py-8 font-bold" size="lg">
                         <Link href={emailUrl}>
                            <Mail />
                            <span>Send an Email</span>
                         </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
