'use client';

import { useState, useRef } from 'react';
import { useStorage, useUser } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy } from 'lucide-react';

export function ImageUploader() {
    const storage = useStorage();
    const { user } = useUser();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadedUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !storage || !user) {
            toast({
                title: 'Error',
                description: 'Please select a file to upload and ensure you are logged in.',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        const fileId = `${Date.now()}-${selectedFile.name}`;
        const storageRef = ref(storage, `uploads/${user.uid}/${fileId}`);

        try {
            const uploadResult = await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            setUploadedUrl(downloadURL);
            toast({
                title: 'Upload Successful',
                description: 'The image URL has been copied to your clipboard.',
            });
            await navigator.clipboard.writeText(downloadURL);
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const copyToClipboard = async () => {
        if (!uploadedUrl) return;
        await navigator.clipboard.writeText(uploadedUrl);
        toast({ title: 'Copied!', description: 'The URL has been copied to your clipboard.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Image Uploader</CardTitle>
                <CardDescription>Upload an image and get its public URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="max-w-sm"
                />
                <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>

                {uploadedUrl && (
                    <div className="space-y-2 pt-4">
                        <p className="text-sm font-medium">Uploaded Image URL:</p>
                        <div className="flex items-center gap-2">
                             <Input type="text" readOnly value={uploadedUrl} className="flex-grow"/>
                             <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                             </Button>
                        </div>
                        <div className="relative mt-2 aspect-video w-full max-w-sm rounded-lg overflow-hidden border">
                            <img src={uploadedUrl} alt="Uploaded preview" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}