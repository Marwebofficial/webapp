
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <main className="container mx-auto p-4 py-8 md:p-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-lg max-w-none">
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the DataConnect Nigeria website (the "Service") operated by us.
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>
          
          <h2 className="text-2xl font-semibold">1. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>

          <h2 className="text-2xl font-semibold">2. Purchases and Transaction Completion</h2>
          <p>
            If you wish to purchase any product or service made available through the Service ("Purchase"), you will be asked to supply certain information relevant to your Purchase.
          </p>
          <p>
            <strong>Important:</strong> To finalize your transaction, you will be redirected to the DataConnect Nigeria official WhatsApp page. This is a required step for payment and service delivery. By initiating a purchase, you agree to complete the transaction process via WhatsApp.
          </p>

          <h2 className="text-2xl font-semibold">3. Service Availability</h2>
          <p>
            Our services are actively processed during the following hours:
          </p>
          <ul>
            <li><strong>Weekdays (Monday - Friday):</strong> 9:00 AM - 8:00 PM</li>
            <li><strong>Weekends (Saturday & Sunday):</strong> 12:00 PM - 6:00 PM</li>
          </ul>
          <p>
            Transactions initiated outside of these hours will be processed on the next active business day. While our website is available 24/7, the fulfillment of services is subject to these operational hours.
          </p>

          <h2 className="text-2xl font-semibold">4. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-semibold">5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold">6. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
