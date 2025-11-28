
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto p-4 py-8 md:p-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-lg max-w-none">
          <p>
            Welcome to DataConnect Nigeria. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
          </p>

          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            We may collect personal information from you in a variety of ways, including when you register on the site, place an order, or fill out a form. The information we collect may include:
          </p>
          <ul>
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number.</li>
            <li><strong>Transaction Information:</strong> Details about the services you purchase, such as data plans, airtime amounts, TV subscription details, and transaction history.</li>
            <li><strong>Device Information:</strong> We may collect information about the device you use to access our services.</li>
          </ul>

          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process your transactions and deliver the services you request.</li>
            <li>Communicate with you about your orders, our services, and promotional offers.</li>
            <li>Improve our website and services.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold">3. Use of WhatsApp for Purchase Completion</h2>
          <p>
            To complete your purchases, you will be redirected to WhatsApp. This is a crucial part of our service delivery process. When you are redirected to WhatsApp, you will be interacting with our official business account to finalize payment and confirm your transaction.
          </p>
          <p>
            Please note that your interaction on WhatsApp is also governed by WhatsApp's own Privacy Policy. We are responsible for the information you provide to us through that channel for the purpose of completing your transaction.
          </p>

          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
          
          <h2 className="text-2xl font-semibold">5. Your Consent</h2>
          <p>
            By using our site and signing up for an account, you consent to our Privacy Policy and agree to its terms.
          </p>

          <h2 className="text-2xl font-semibold">6. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
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
