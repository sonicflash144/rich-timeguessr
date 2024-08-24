"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import "./globals.css";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(files.length === 0){
      return;
    }

    setIsLoading(true);
    setStatus('Uploading images...');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/python/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setStatus('Images uploaded. Extracting metadata...');
      const { folderName } = await res.json();
      localStorage.setItem('folderName', folderName);
      
      const res_metadata = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/python/metadata?folderName=${folderName}`, {
        method: 'GET'
      });

      if (res_metadata.ok) {
        const data = await res_metadata.json();
        localStorage.setItem('autoImageData', JSON.stringify(data));
        setStatus('Metadata extracted. Starting game...');
        localStorage.removeItem('gameLink');
        localStorage.setItem('round', '1');
        localStorage.removeItem('5_indexes');
        localStorage.removeItem('shownImages');
        localStorage.removeItem('currentImage');
        router.push('/game');
      }
    }
  };

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-8 ${
      isLoading ? 'bg-gray-200' : 'bg-gradient-to-b from-blue-900 to-black background-globe'
    }`}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen text-gray-800">
          <p className="mb-4">{status}</p>
          <div className="loader"></div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white bg-opacity-85 p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">Create a Custom Timeguessr!</h1>
          <p className="text-center text-gray-700 mb-4">
            Photos must have location and datetime metadata to work.
          </p>
          
          <form onSubmit={handleUpload} className="flex flex-col items-center justify-center space-y-4">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
              Play Now
            </button>
          </form>
        </div>
      )}
    </main>
  );
}