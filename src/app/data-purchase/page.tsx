'''"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getPlans } from '@/firebase/firestore/plans';

const networkOptions = [
  { id: 1, name: 'mtn' },
  { id: 2, name: 'glo' },
  { id: 3, name: '9mobile' },
  { id: 4, name: 'airtel' },
];

interface Plan {
  id: string;
  name: string;
  amount: number;
  plan_id: string;
}

export default function DataPurchasePage() {
  const [networkId, setNetworkId] = useState<number | '''>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [planId, setPlanId] = useState<string | '''>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!networkId) return;
      setIsFetchingPlans(true);
      try {
        const networkName = networkOptions.find(n => n.id === networkId)?.name;
        if (!networkName) return;
        const res = await fetch(`/api/plans?network=${networkName}`);
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]);
      } finally {
        setIsFetchingPlans(false);
      }
    };

    fetchPlans();
  }, [networkId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: networkId,
          mobile_number: mobileNumber,
          plan: planId,
          Ported_number: true,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 py-8 md:p-12 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Data Purchase</CardTitle>
          <CardDescription>Purchase data</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Network</Label>
              <div className="grid grid-cols-2 gap-4">
                {networkOptions.map((network) => (
                  <Button
                    key={network.id}
                    variant={networkId === network.id ? 'default' : 'outline'}
                    onClick={() => {
                      setNetworkId(network.id);
                      setPlanId('');
                      setPlans([]);
                    }}
                    type="button"
                  >
                    {network.name}
                  </Button>
                ))}
              </div>
            </div>
            {isFetchingPlans && <p>Fetching plans...</p>}
            {plans.length > 0 && (
              <div className="space-y-2">
                <Label>Plan</Label>
                <div className="grid grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <Button
                      key={plan.id}
                      variant={planId === plan.plan_id ? 'default' : 'outline'}
                      onClick={() => setPlanId(plan.plan_id)}
                      type="button"
                    >
                      {plan.name} - {plan.amount}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g., 08012345678"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading || isFetchingPlans || !planId}>
              {isLoading ? 'Loading...' : 'Purchase'}
            </Button>
            {response && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-bold mb-2">Response:</h3>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
'''