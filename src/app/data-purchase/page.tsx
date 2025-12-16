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

export default function DataPurchasePage() {
  const [network, setNetwork] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dataId, setDataId] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
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
              <Label htmlFor="network">Network</Label>
              <Input
                id="network"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
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
              <Label htmlFor="dataId">Data ID</Label>
              <Input
                id="dataId"
                value={dataId}
                onChange={(e) => setDataId(e.target.value)}
                placeholder="e.g., 204"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit">
              Purchase
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
