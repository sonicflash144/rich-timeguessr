"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const { folderName } = await res.json();
      localStorage.setItem('folderName', folderName);
      
      const res_metadata = await fetch('/api/run_python_script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderName }),
      });

      if (res_metadata.ok) {
        router.push('/game');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gradient-bg">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          >
            <span className="dark:invert">
              Upload your own photos to create a custom Timeguessr! Photos must have location and datetime metadata to work.
            </span>
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold text-center">Create Your Own Custom Timeguessr!</h1>
      </div>

      <form onSubmit={handleUpload} className="flex flex-col items-center">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4"
        />
        <button type="submit" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          Upload Photos
        </button>
      </form>

      <Link href="/game">
        <button className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Play{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Guess the location and time of the image.
          </p>
        </button>
      </Link>

    </main>
  );
}