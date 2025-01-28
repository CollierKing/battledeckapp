"use client";

import {
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { DialogHeader } from "../ui/dialog";
import SearchInput from "../ui/search-input";
import { useEffect, useState } from "react";
import Image from "next/image";
import TextResult from "../ui/text-result";
import { LucideArrowRightFromLine } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResponse {
  decks: Array<{
    id: string;
    name: string;
    ai_prompt: string;
    hero_image: string;
    matching_captions: Array<{
      text: string;
      image_url: string;
    }>;
  }>;
}

const SearchDialog = () => {
  const router = useRouter();

  // MARK: - State
  const [search, setSearch] = useState<string>("");
  const [decks, setDecks] = useState<SearchResponse["decks"]>([]);

  // MARK: - Handlers
  const handleSearch = async (search: string) => {
    // setSearch(search)
    const response = await fetch("/api/deck", {
      method: "POST",
      body: JSON.stringify({ action: "search_decks", search }),
    });
    const data = (await response.json()) as SearchResponse;
    setDecks(data.decks);
  };

  const handleDeckNavigate = (id: string) => {
    router.push(`/decks/${id}`);
  };

  // MARK: - Effects
  useEffect(() => {
    if (search === "") {
      setDecks([]);
      return;
    }
    setTimeout(() => {
      handleSearch(search);
    }, 400);
  }, [search]);

  // MARK: - Render
  return (
    <div>
      <DialogHeader visually-hidden="true">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>

      <Card className="-mt-4 w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>Search Battle Decks</CardTitle>
          <CardDescription>
            Search Battle Deck descriptions, slide, captions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput
            search={search}
            setSearch={setSearch}
            placeholder="Search Decks"
          />
          {search.length > 0 && (
            <div className="pt-2 italic text-sm text-gray-500">
              {decks.length == 0 ? (
                <p>No results found...</p>
              ) : (
                <p>
                  Found {decks.length} decks with&nbsp;
                  {decks.reduce(
                    (total, deck) => total + deck.matching_captions.length,
                    0
                  )}
                  &nbsp;slides...
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-96 mt-2">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="border-t py-2 border-gray-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="">{deck.name}</h3>
                  <DialogClose asChild>
                    <button
                      title="View Deck"
                      onClick={() => handleDeckNavigate(deck.id)}
                    >
                      <LucideArrowRightFromLine className="h-4 w-4 hover:text-gray-700" />
                    </button>
                  </DialogClose>
                </div>
                <div key={deck.id} className="flex items-center gap-4">
                  {deck.hero_image ? (
                    <Image
                      src={deck.hero_image}
                      alt={deck.name}
                      width={50}
                      height={50}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                      {/* <span className="text-gray-400">No preview available</span> */}
                    </div>
                  )}
                  <div className="flex-1 w-1/2">
                    <CardDescription className="line-clamp-3 break-words">
                      {TextResult(
                        deck.ai_prompt,
                        search,
                        "line-clamp-3 break-words text-xs"
                      )}
                    </CardDescription>
                  </div>
                </div>
                {deck.matching_captions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm w-1/6 truncate">Slides:</h3>
                    <div className=" items-center gap-2 space-y-1 ">
                      {deck.matching_captions.map((caption, idxx) => (
                        <div
                          key={idxx}
                          className="flex-1 flex items-center gap-2"
                        >
                          {caption.image_url ? (
                            <Image
                              src={caption.image_url}
                              alt={deck.name}
                              width={50}
                              height={50}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                              {/* <span className="text-gray-400">No preview available</span> */}
                            </div>
                          )}
                          <CardDescription className="line-clamp-3 break-words">
                            {TextResult(
                              caption.text,
                              search,
                              "line-clamp-3 break-words text-xs"
                            )}
                          </CardDescription>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchDialog;
