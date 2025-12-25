'use client';

import { useState } from 'react';
import { useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ImageUploaderProps {
    onUploadComplete: (url: string) => void;
    folder?: string;
}

export function ImageUploader({ onUploadComplete, folder = 'images' }: ImageUploaderProps) {
    const storage = useStorage();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !storage) return;
        setUploading(true);
        const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
        
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            onUploadComplete(downloadURL);
            setFile(null);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Input type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} />
            {file && (
                <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? `Uploading... ${progress.toFixed(0)}%` : 'Upload Image'}
                </Button>
            )}
            {uploading && <Progress value={progress} />}
        </div>
    );
}
