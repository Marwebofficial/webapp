
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Wifi } from 'lucide-react';

interface ReceiptProps {
  transaction: {
    type: string;
    network?: string;
    details: string;
    recipientPhone: string;
    status: string;
    createdAt: any; // Consider a more specific type
    transactionId?: string;
  };
  onBack?: () => void;
}

export function Receipt({ transaction, onBack }: ReceiptProps) {
  const downloadPdf = () => {
    const input = document.getElementById('receipt-content');
    if (input) {
      const onBackButton = document.getElementById('on-back-button');
      if(onBackButton) {
        onBackButton.style.display = 'none';
      }
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasAspectRatio = canvas.height / canvas.width;
        const scaledHeight = pdfWidth * canvasAspectRatio;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
        pdf.save("receipt.pdf");
      });
       if(onBackButton) {
        onBackButton.style.display = 'block';
      }
    }
  };

  return (
    <Card id="receipt-content" className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center mx-auto mb-2 w-20 h-20 bg-primary/10 rounded-full">
            <Wifi className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">DataConnect</h1>
        <p className="text-muted-foreground">Transaction Receipt</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-t border-dashed my-4" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transaction Type:</span>
          <span className="font-medium">{transaction.type}</span>
        </div>
        {transaction.network && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">{transaction.network}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Details:</span>
          <span className="font-medium">{transaction.details}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Recipient:</span>
          <span className="font-medium">{transaction.recipientPhone}</span>
        </div>
         <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">{new Date(transaction.createdAt?.toDate()).toLocaleString()}</span>
        </div>
         {transaction.transactionId && (
        <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-medium">{transaction.transactionId}</span>
        </div>
        )}
        <div className="border-t border-dashed my-4" />
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status:</span>
          <span className={`font-bold text-lg ${transaction.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
            {transaction.status}
          </span>
        </div>
      </CardContent>
      <div className="p-6 text-center space-y-4">
        <Button onClick={downloadPdf} className="w-full">Download PDF</Button>
        {onBack && <Button onClick={onBack} variant="outline" id="on-back-button" className="w-full">Back to History</Button>}
      </div>
    </Card>
  );
}
