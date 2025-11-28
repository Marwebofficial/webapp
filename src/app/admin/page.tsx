
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { networkProviders } from '@/lib/data-plans';
import { tvProviders } from '@/lib/tv-plans';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';

interface Plan {
  id: string;
  label: string;
  price: number;
  validity?: string;
}

const ADMIN_EMAIL = 'samuelmarvel21@gmail.com';

function PlanForm({
  plan,
  networkId,
  collectionName,
  onSave,
  isTvPlan = false,
}: {
  plan?: Plan;
  networkId: string;
  collectionName: string;
  onSave: () => void;
  isTvPlan?: boolean;
}) {
  const firestore = useFirestore();
  const [label, setLabel] = useState(plan?.label || '');
  const [price, setPrice] = useState(plan?.price || 0);
  const [validity, setValidity] = useState(plan?.validity || '');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!label || price <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill out all fields correctly.',
        variant: 'destructive',
      });
      return;
    }
    const planId = plan?.id || doc(collection(firestore, 'dummy')).id;
    const planRef = doc(firestore, collectionName, networkId, 'plans', planId);
    const data: Omit<Plan, 'id'> = { label, price };
    if (!isTvPlan) {
      data.validity = validity;
    }

    await setDocumentNonBlocking(planRef, data, { merge: true });
    toast({ title: 'Success', description: 'Plan saved successfully!' });
    onSave();
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="label" className="text-right">
          Label
        </Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Price (₦)
        </Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="col-span-3"
        />
      </div>
      {!isTvPlan && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="validity" className="text-right">
            Validity
          </Label>
          <Input
            id="validity"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            className="col-span-3"
            placeholder="e.g., 30 Days"
          />
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleSave}>Save Plan</Button>
      </DialogFooter>
    </div>
  );
}

function PlansManager({
  title,
  providers,
  collectionName,
  isTvPlan = false,
}: {
  title: string;
  providers: { id: string; name: string }[];
  collectionName: string;
  isTvPlan?: boolean;
}) {
  const [selectedProvider, setSelectedProvider] = useState(providers[0].id);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>(undefined);
  const firestore = useFirestore();
  const { toast } = useToast();

  const plansQuery = useMemoFirebase(
    () => collection(firestore, collectionName, selectedProvider, 'plans'),
    [firestore, collectionName, selectedProvider]
  );
  const { data: plans, isLoading } = useCollection<Plan>(plansQuery);

  const handleDelete = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const planRef = doc(firestore, collectionName, selectedProvider, 'plans', planId);
      await deleteDocumentNonBlocking(planRef);
      toast({ title: 'Success', description: 'Plan deleted successfully.' });
    }
  };
  
  const openForm = (plan?: Plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlan(undefined);
  }

  const colSpan = isTvPlan ? 3 : 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Select a provider to view and manage their plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => openForm()}>Add New Plan</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingPlan ? 'Edit' : 'Add'} Plan</DialogTitle>
                </DialogHeader>
                <PlanForm
                    plan={editingPlan}
                    networkId={selectedProvider}
                    collectionName={collectionName}
                    onSave={closeForm}
                    isTvPlan={isTvPlan}
                />
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Price</TableHead>
              {!isTvPlan && <TableHead>Validity</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : plans && plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.label}</TableCell>
                  <TableCell>₦{plan.price.toLocaleString()}</TableCell>
                  {!isTvPlan && <TableCell>{plan.validity}</TableCell>}
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openForm(plan)}>
                        Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  No plans found for this provider.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

type NetworkStatusType = 'Online' | 'Degraded' | 'Offline';
interface NetworkStatus {
    id: string;
    name: string;
    status: NetworkStatusType;
}

function NetworkStatusManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const statuses: NetworkStatusType[] = ['Online', 'Degraded', 'Offline'];

    const networkStatusQuery = useMemoFirebase(
        () => collection(firestore, 'networkStatus'),
        [firestore]
    );
    const { data: networkStatuses, isLoading } = useCollection<NetworkStatus>(networkStatusQuery);

    const handleStatusChange = (networkId: string, status: NetworkStatusType) => {
        const statusRef = doc(firestore, 'networkStatus', networkId);
        setDocumentNonBlocking(statusRef, { status, lastChecked: serverTimestamp() }, { merge: true });
        toast({ title: 'Success', description: 'Network status updated.' });
    };
    
    useEffect(() => {
        // Initialize statuses if they don't exist
        if (!isLoading && firestore) {
            const existingIds = networkStatuses?.map(s => s.id) || [];
            networkProviders.forEach(provider => {
                if (!existingIds.includes(provider.id)) {
                    const statusRef = doc(firestore, 'networkStatus', provider.id);
                    setDocumentNonBlocking(statusRef, {
                        id: provider.id,
                        name: provider.name,
                        status: 'Online',
                        lastChecked: serverTimestamp(),
                    }, { merge: true });
                }
            });
        }
    }, [isLoading, networkStatuses, firestore]);

    const getStatusVariant = (status: string) => {
        switch (status) {
          case 'Online':
            return 'default';
          case 'Degraded':
            return 'secondary';
          case 'Offline':
            return 'destructive';
          default:
            return 'outline';
        }
      };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Network Status</CardTitle>
                <CardDescription>
                    Update the operational status of the mobile networks.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Network</TableHead>
                            <TableHead>Current Status</TableHead>
                            <TableHead className="text-right">Change Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : networkStatuses && networkStatuses.length > 0 ? (
                            networkStatuses.map(network => (
                                <TableRow key={network.id}>
                                    <TableCell className="font-medium">{network.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(network.status)}>{network.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm"><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update {network.name} Status</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Select onValueChange={(value) => handleStatusChange(network.id, value as NetworkStatusType)} defaultValue={network.status}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">No network statuses found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 md:p-12 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <NetworkStatusManager />
      <PlansManager title="Data Plans" providers={networkProviders} collectionName="dataPlans" />
      <PlansManager title="TV Subscriptions" providers={tvProviders} collectionName="tvPlans" isTvPlan />
    </div>
  );
}

    