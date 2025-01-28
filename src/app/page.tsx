import Image from "next/image";
import Link from "next/link";
import { AppWindowIcon, GithubIcon, PresentationIcon } from "lucide-react";
import { TrackableLink } from "@/components/forms/trackable-link";
import { auth } from "@/auth";

export const runtime = "edge";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen items-center">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-center">
          <Image
            src="/hero.png"
            alt="Battledeck Banner"
            width={750}
            height={500}
            className="w-11/12 h-auto object-cover mt-6"
          />
        </div>

        <main className="flex-1 flex flex-col gap-8 items-center p-8 w-full">
          <article className="prose lg:prose-xl dark:prose-invert">
            <h3 className="text-center text-primary dark:text-white">
              Welcome to BattleDeck.app
            </h3>
            <p className="text-center text-primary dark:text-white">
              What is a{" "}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 dark:text-sky-400 underline"
                href="https://en.wikipedia.org/wiki/PowerPoint_karaoke"
              >
                Battle Deck
              </Link>
              ?
            </p>
            <p className="bg-secondary text-center text-base italic p-2 rounded-lg text-primary dark:text-white">
              &quot;PowerPoint karaoke, or battle decks, is an improvisational
              activity in which a participant must deliver a presentation based
              on a set of slides that they have never seen before.&quot;
              -Wikipedia
            </p>
          </article>

          <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-primary dark:text-white">
            <li className="mb-2">
              Get started by creating a new deck with AI or saved images.
            </li>
            <li className="mb-2">Add or remove slides in the deck.</li>
            <li className="mb-2">Present your deck to your audience.</li>
            <li className="mb-2">
              Search saved decks & slides by description or caption.
            </li>
          </ol>

          <h2 className="text-center text-2xl font-bold text-primary dark:text-white">
            Resources & Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center">
            <TrackableLink
              href="https://docs.google.com/presentation/d/1ZNVXzT5b_ak9GMqsGRG_AnOSY-6MGyJya-5spEBI6SA"
              className="w-48 border p-2 rounded-lg flex items-center justify-center bg-transparent text-primary dark:text-white hover:bg-secondary dark:hover:bg-gray-900"
              blobs={[
                "https://docs.google.com/presentation/d/1ZNVXzT5b_ak9GMqsGRG_AnOSY-6MGyJya-5spEBI6SA",
              ]}
              doubles={[1]}
              indexes={[session.user.email]}
            >
              <span className="flex items-center gap-2 w-full justify-center">
                <PresentationIcon className="w-4 h-4" />
                <span>ATXJS Deck</span>
              </span>
            </TrackableLink>
            <Link
              className="text-center w-48 border p-2 rounded-lg flex items-center justify-center bg-transparent text-primary dark:text-white hover:bg-secondary dark:hover:bg-gray-900"
              href="https://github.com/CollierKing/battledeckapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-2 w-full justify-center">
                <GithubIcon className="w-4 h-4" />
                <span>App Repo</span>
              </span>
            </Link>
            <Link
              className="text-center w-48 border p-2 rounded-lg flex items-center justify-center bg-transparent text-primary dark:text-white hover:bg-secondary dark:hover:bg-gray-900"
              href="https://github.com/huijing/ppt-karaoke"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-2 w-full justify-center">
                <GithubIcon className="w-4 h-4" />
                <span>Inspiration Repo</span>
              </span>
            </Link>
            <Link
              className="text-center w-48 border p-2 rounded-lg flex items-center justify-center bg-transparent text-primary dark:text-white hover:bg-secondary dark:hover:bg-gray-900"
              href="https://huijing.github.io/ppt-karaoke/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-2 w-full justify-center">
                <AppWindowIcon className="w-4 h-4" />
                <span>Inspiration App</span>
              </span>
            </Link>
          </div>
        </main>

        <footer className="flex gap-6 flex-wrap items-center justify-center p-4 text-primary dark:text-white w-full">
          <p className="flex items-center gap-2">
            Built with
            <Image
              src="/cloudflare-color.svg"
              alt="Cloudflare Logo"
              width={25}
              height={25}
            />
            by
            <Link
              className="text-sky-600 dark:text-sky-400 underline"
              href="https://github.com/CollierKing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Collier
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
