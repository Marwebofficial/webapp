
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentPolicyPage() {
  return (
    <main className="container mx-auto p-4 py-8 md:p-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Payment Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-lg max-w-none">
          <p>
            This Payment Policy outlines the terms related to payments for services on DataConnect Nigeria. By using our services and making a payment, you agree to this policy.
          </p>

          <h2 className="text-2xl font-semibold">1. General Terms</h2>
          <p>
            All prices for our services (Data, Airtime, TV Subscriptions, etc.) are listed in Nigerian Naira (NGN). We reserve the right to change the prices for services at any time without prior notice.
          </p>

          <h2 className="text-2xl font-semibold">2. Wallet Funding</h2>
          <ul>
            <li>Your DataConnect wallet can be funded via automated bank transfer to the account details provided in the "Fund Wallet" section of your dashboard.</li>
            <li>A processing fee of 1% is applied to all wallet funding transactions. For example, if you transfer ₦1,000, your wallet will be credited with ₦990.</li>
            <li>It is your responsibility to transfer the exact amount and to the correct account details provided. DataConnect Nigeria is not liable for funds transferred to the wrong account.</li>
            <li>Wallet funding is typically confirmed and credited within minutes, but may be subject to delays from payment processing partners.</li>
          </ul>

          <h2 className="text-2xl font-semibold">3. Service Payments</h2>
          <p>
            All purchases for services are deducted from your DataConnect wallet balance. You must have sufficient funds in your wallet to cover the cost of the service you wish to purchase.
          </p>

          <h2 className="text-2xl font-semibold">4. Service Delivery</h2>
          <p>
            We strive to deliver all services instantly. However, service delivery is dependent on third-party providers (e.g., mobile networks, TV providers). Delays or failures from these providers may affect the delivery of your service. In such cases, we will work to resolve the issue, but we cannot be held liable for failures outside of our direct control.
          </p>

          <h2 className="text-2xl font-semibold">5. Refunds</h2>
          <p>
            All transactions are final. Refunds are not provided for successfully completed transactions. If a service is not delivered due to a fault from our system, your wallet will be automatically credited with the full transaction amount. Refunds will not be issued for errors made by the user, such as purchasing a data plan for the wrong phone number or subscribing to the wrong TV plan.
          </p>

           <h2 className="text-2xl font-semibold">6. Airtime to Cash</h2>
          <p>
            The Airtime to Cash service is subject to specific rates and fees which will be communicated during the transaction process on WhatsApp. The final amount you receive will be after the deduction of our service charge.
          </p>

          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about this Payment Policy or a specific transaction, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
