import Image from "next/image";
import Link from 'next/link';
import Head from 'next/head';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Richguessr',
};

export default function Home() {
  return (

    <main className="flex min-h-screen flex-col items-center justify-between p-24 gradient-bg">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          >
            <span className="dark:invert">
              First there was Geoguessr. Then there was Chronophoto. Then there was Timeguessr. And now...
            </span>
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold text-center">Happy Birthday Rich!</h1>
      </div>

        <Link href="/game">
          <button className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Play Richguessr{" "}
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
