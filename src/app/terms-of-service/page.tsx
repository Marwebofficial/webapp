
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

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
            Please read these Terms of Service ("Terms") carefully before using the DataConnect Nigeria website (the "Service") operated by us.
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>
          
          <h2 className="text-2xl font-semibold">1. Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>

          <h2 className="text-2xl font-semibold">2. Wallet and Payments</h2>
          <p>
            All purchases are made through your personal wallet on the Service. You are responsible for funding your wallet to use our services. Please refer to our <strong>Payment Policy</strong> for detailed information on wallet funding, fees, and refunds. By using the wallet feature, you agree to the terms outlined in the Payment Policy.
          </p>
          <p>
            For services like Airtime-to-Cash, you may be required to complete the transaction via WhatsApp. By initiating such a transaction, you agree to follow the provided instructions.
          </p>
          
          <h2 className="text-2xl font-semibold">3. Service Availability and Delivery</h2>
          <p>
            While our website is available 24/7, the fulfillment of some services may be subject to the operational hours of our third-party partners (e.g., mobile networks). We strive for instant delivery, but we are not liable for delays or failures caused by these external providers.
          </p>
          <p>
            It is your responsibility to provide correct details (e.g., phone numbers, smart card numbers) for all transactions. We are not responsible for losses incurred due to incorrect information provided by you.
          </p>

          <h2 className="text-2xl font-semibold">4. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease. Any remaining, non-disputed balance in your wallet may be refunded upon request, subject to our verification process.
          </p>

          <h2 className="text-2xl font-semibold">5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold">6. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please see our <Link href="/contact">Contact Us</Link> page.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
