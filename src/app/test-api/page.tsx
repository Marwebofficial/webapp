"use client";

import { useState } from 'react';
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

export default function TestApiPage() {
  const [networkId, setNetworkId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [planId, setPlanId] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          network_id: networkId,
          mobile_number: mobileNumber,
          plan_id: planId,
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
          <CardTitle>API Test Page</CardTitle>
          <CardDescription>Test the /api/data endpoint</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="networkId">Network ID</Label>
              <Input
                id="networkId"
                value={networkId}
                onChange={(e) => setNetworkId(e.target.value)}
                placeholder="e.g., mtn"
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="planId">Plan ID</Label>
              <Input
                id="planId"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                placeholder="e.g., 204"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Send Request'}
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
