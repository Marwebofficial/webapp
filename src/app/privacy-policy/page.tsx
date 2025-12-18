"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <main className="container mx-auto p-4 py-8 md:p-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          {lastUpdated && <p className="text-muted-foreground">Last updated: {lastUpdated}</p>}
        </CardHeader>
        <CardContent className="space-y-6 prose prose-lg max-w-none">
          <p>
            Welcome to DataConnect Nigeria. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            We may collect personal information from you in a variety of ways, including when you register on the site, fund your wallet, or place an order. The information we collect may include:
          </p>
          <ul>
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number.</li>
            <li><strong>Transaction Information:</strong> Details about the services you purchase, your wallet funding history, and your transaction history. This includes amounts, service types, and recipient details (phone numbers or smart card numbers).</li>
            <li><strong>Financial Information:</strong> For wallet funding requests, we collect the name of the bank you are transferring from to help us verify your payment. We do not store your bank account number or any card details.</li>
          </ul>

          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Create and manage your account and wallet.</li>
            <li>Process your transactions and deliver the services you request.</li>
            <li>Verify and approve your wallet funding requests.</li>
            <li>Communicate with you about your orders, our services, and promotional offers.</li>
            <li>Maintain a history of your transactions for your reference.</li>
            <li>Improve our website and services.</li>
            <li>Comply with legal and regulatory obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold">3. Use of WhatsApp for Support</h2>
          <p>
            While most transactions are automated, we use WhatsApp for customer support and for specific services like Airtime-to-Cash conversions. When you interact with us on WhatsApp, your conversation is also governed by WhatsApp's own Privacy Policy. We are responsible for the information you provide to us through that channel for the purpose of resolving your issue or completing your transaction.
          </p>

          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures, including Firestore Security Rules, to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>
          
          <h2 className="text-2xl font-semibold">5. Your Consent</h2>
          <p>
            By using our site, creating an account, and agreeing to our Terms of Service, you consent to our Privacy Policy and agree to its terms.
          </p>

          <h2 className="text-2xl font-semibold">6. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and, where appropriate, through other communication channels.
          </p>

          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the details provided on our Contact Us page.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
