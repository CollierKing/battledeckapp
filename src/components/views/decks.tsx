"use client";

import { useContext, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Deck } from "@/types/decks";
import {
  ListView,
  GridView,
  CarouselView,
} from "@/components/views/view-types-deck";
import { useRouter } from "next/navigation";
import NotificationsContext from "@/contexts/notifications/context";
import CreateDeckForm from "@/components/forms/create-deck";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { PlusCircleIcon, Loader2 as Spinner } from "lucide-react";
import SearchInput from "@/components/ui/search-input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Decks({ decks }: { decks: Deck[] }) {
  // MARK: - State
  const [viewType, setViewType] = useState<"list" | "grid" | "carousel">(
    "list"
  );
  const router = useRouter();
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>(decks);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

  // MARK: - Context
  const { notifications, updateNotifications } =
    useContext(NotificationsContext);

  // MARK: - Handlers
  const handleDeckClick = (id: number) => {
    router.push(`/decks/${id}`);
  };

  const handleDeleteClick = (deck: Deck) => {
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const handleDeckCtx = (decks: Deck[]) => {
    console.log("handleDeckCtx.decks", decks);
    // if no pending decks, stop checking
    if (decks.filter((e) => e.wf_status === "pending").length === 0) {
      updateNotifications({ notifications: false, decks: decks });
    } else {
      updateNotifications({ notifications: true, decks: decks });
    }
    setFilteredDecks(decks);
  };

  const handleDeleteConfirm = async () => {
    setIsLoadingDelete(true);

    const response = await fetch("/api/deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_deck",
        deck_id: deckToDelete?.id,
      }),
    });
    const data = (await response.json()) as { decks: Deck[] };

    if (data.decks.length > 0) {
      const updatedDecks = notifications.decks.filter(
        (deck) => deck.id !== deckToDelete?.id
      );
      handleDeckCtx(updatedDecks);
      setFilteredDecks(updatedDecks);
    }

    setIsLoadingDelete(false);
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  // MARK: - Effects
  useEffect(() => {
    // update the context with most recent source of truth
    handleDeckCtx(decks);
  }, [decks]);

  useEffect(() => {
    if (!search || search === "") {
      setFilteredDecks(decks || notifications.decks);
      return;
    }
    const filteredDecks = notifications.decks.filter((deck) => {
      // check if search is in the name or description
      return (
        deck.name.toLowerCase().includes(search.toLowerCase()) ||
        deck.ai_prompt?.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredDecks(filteredDecks);
  }, [search]);

  useEffect(() => {
    if (notifications.decks?.length > 0) {
      // Update filteredDecks when a deck's status changes from pending to completed
      setFilteredDecks((prevFilteredDecks) =>
        prevFilteredDecks.map((filteredDeck) => {
          // Find matching deck in notifications
          const notificationDeck = notifications.decks.find(
            (d) => d.id === filteredDeck.id
          );

          // If we found a matching deck and its status changed from pending to completed
          if (
            notificationDeck &&
            filteredDeck.wf_status === "pending" &&
            notificationDeck.wf_status === "completed"
          ) {
            return { ...filteredDeck, wf_status: "completed" };
          }

          return filteredDeck;
        })
      );
    }
  }, [notifications.decks]);

  // MARK: - Render
  return (
    <div className="">
      <div className="w-full bg-background fixed top-8 z-50 pb-0.5 pl-4 border-b border-secondary">
        <div className="mt-4 mb-2 flex space-x-2">
          <SearchInput
            className="w-36"
            search={search}
            setSearch={setSearch}
            placeholder="Search Decks"
          />
          <Select
            value={viewType}
            onValueChange={(value: typeof viewType) => setViewType(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={openDialog}
            onOpenChange={(open) => setOpenDialog(open)}
          >
            <DialogTrigger asChild>
              <SidebarMenuButton
                className="h-9 w-9 md:w-36"
                tooltip={"Create a New BattleDeck!"}
              >
                <PlusCircleIcon />
                <span className="hidden sm:inline">New Deck</span>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent>
              <VisuallyHidden>
                <DialogTitle>Create a New BattleDeck!</DialogTitle>
              </VisuallyHidden>
              <CreateDeckForm onOpenChange={(open) => setOpenDialog(open)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* MARK: - Views */}
      <div className="pl-4 mt-28">
        {viewType === "list" && (
          <ListView
            items={filteredDecks}
            onItemClick={handleDeckClick}
            onDeleteClick={handleDeleteClick}
            search={search}
          />
        )}
        {viewType === "grid" && (
          <GridView
            items={filteredDecks}
            onItemClick={handleDeckClick}
            onDeleteClick={handleDeleteClick}
            search={search}
          />
        )}
        {viewType === "carousel" && (
          <CarouselView
            items={filteredDecks}
            onItemClick={handleDeckClick}
            onDeleteClick={handleDeleteClick}
            search={search}
          />
        )}
      </div>

      {/* MARK: - Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deckToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className={isLoadingDelete ? "opacity-50 cursor-not-allowed" : ""}
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
