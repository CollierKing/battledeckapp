"use client";

import {
  BellIcon,
  ChartBar,
  HomeIcon,
  LogOut,
  LucideArrowLeftFromLine,
  LucideArrowRightFromLine,
  Moon,
  PlusCircleIcon,
  Presentation,
  Search,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarContext,
} from "@/components/ui/sidebar";
import CreateDeckForm from "../forms/create-deck";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { DialogTitle } from "@radix-ui/react-dialog";
import NotificationsContext from "@/contexts/notifications/context";
import Image from "next/image";
import { Deck, DeckStatusResponse } from "@/types/decks";
import { cn } from "@/lib/utils";
import SearchDialog from "../forms/search-dialog";
import { Session } from "next-auth";
import { Button } from "../ui/button";
import { logout } from "@/server/actions";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

// MARK: - CONSTANTS
export function AppSidebar({ session }: { session: Session | null }) {
  // console.log("AppSidebar.session", session);

  const { state, toggleSidebar, isMobile } = useSidebarContext();

  // MARK: - State
  const [topItems] = useState([
    {
      title: "Home",
      path: "/",
      icon: HomeIcon,
      dialog: false,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
      dialog: true,
    },
    {
      title: "Decks",
      path: "/decks",
      icon: Presentation,
      dialog: false,
    },
    {
      title: "New Deck",
      path: "#",
      icon: PlusCircleIcon,
      dialog: true,
    },
  ]);

  const [bottomItems] = useState(() => {
    const items = [
      {
        title: "Notifications",
        url: "#",
        icon: BellIcon,
        dialog: true,
      },
      {
        title: "Theme",
        url: "#",
        icon: Sun,
        dialog: false,
      },
      {
        title: "Logout",
        url: "#",
        icon: LogOut,
        dialog: true,
      },
    ];

    // Add analytics for admin
    if (process.env.NEXT_PUBLIC_ADMIN_EMAIL === session?.user?.email) {
      items.unshift({
        title: "Analytics",
        url: "/analytics",
        icon: ChartBar,
        dialog: false,
      });
    }

    return items;
  });

  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({});
  const [hasUnHackedDecks, setHasUnHackedDecks] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // MARK: - Context
  const { notifications, updateNotifications } =
    useContext(NotificationsContext);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // MARK: - Handlers
  const handleDialogChange = (title: string, open: boolean) => {
    setDialogStates((prev) => ({ ...prev, [title]: open }));
  };

  const handleCheckStatus = async () => {
    const response = await fetch("/api/deck", {
      method: "POST",
      body: JSON.stringify({
        action: "get_decks",
      }),
    });

    const data = (await response.json()) as DeckStatusResponse;
    const { decks } = data;

    // if no pending decks, stop checking
    if (decks.filter((e) => e.wf_status === "pending").length === 0) {
      updateNotifications({ notifications: false, decks: decks as Deck[] });
    } else {
      updateNotifications({ notifications: true, decks: decks as Deck[] });
    }
  };

  // MARK: - SWR
  const { mutate } = useSWR(
    notifications.notifications ? "checkdecks" : null, // Conditionally activate
    handleCheckStatus,
    {
      refreshInterval: 5_000,
      revalidateOnFocus: false,
    }
  );

  // MARK: - Effects
  useEffect(() => {
    // set an interval
    if (!notifications.notifications) {
      //Stop the revalidation
      mutate();
    }

    // if we didnt pass filters and any docs in Completed status, show notification
    if (!notifications.decks) return;

    if (
      notifications.decks.filter((e) => e.wf_status === "completed").length ===
      0
    ) {
      setHasUnHackedDecks(false);
    } else {
      setHasUnHackedDecks(true);
    }
  }, [notifications, mutate]);

  // MARK: - Render
  if (!mounted) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="relative h-[calc(100vh-4rem)]">
              <div className="px-1 flex">
                <Link
                  href="/"
                  className="cursor-pointer hover:opacity-80 transition-opacity rounded-md hover:bg-secondary"
                >
                  <Image
                    src="/battledeck-logo-circle.png"
                    alt="Battledeck Banner"
                    width={35}
                    height={15}
                    className="w-auto h-auto mr-2"
                  />
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <>
      {isMobile ? (
        <Sheet>
          <SheetTrigger
            asChild
            className="fixed -top-1 -left-1 z-[100] bg-transparent rounded-r-lg data-[state=open]:hidden"
          >
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar collapsible="none" className="w-full">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent className="relative h-[calc(100vh-4rem)]">
                    <div className="px-1 flex">
                      <SidebarMenuButton
                        tooltip={"Close"}
                        asChild
                        className={cn(
                          "absolute dark:text-white bg-white dark:invert z-50",
                          "right-0 top-0 w-8 h-8"
                        )}
                      >
                        <SheetClose className="">
                          <X className="dark:invert dark:text-white" />
                        </SheetClose>
                      </SidebarMenuButton>
                      <Link
                        href="/"
                        className="cursor-pointer transition-opacity rounded-md "
                      >
                        <Image
                          src={`/website_banner_${theme}.png`}
                          alt="Battledeck Banner"
                          width={200}
                          height={150}
                          className="w-auto h-auto mr-2"
                        />
                      </Link>
                    </div>
                    <SidebarMenu className="mt-4">
                      {topItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          {item.dialog ? (
                            <Dialog
                              open={dialogStates[item.title]}
                              onOpenChange={(open) =>
                                handleDialogChange(item.title, open)
                              }
                            >
                              <DialogTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </SidebarMenuButton>
                              </DialogTrigger>
                              <DialogContent>
                                {
                                  {
                                    "New Deck": (
                                      <CreateDeckForm
                                        onOpenChange={(open) =>
                                          handleDialogChange(item.title, open)
                                        }
                                      />
                                    ),
                                    Search: <SearchDialog />,
                                  }[item.title]
                                }
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="w-full">
                              <SidebarMenuButton tooltip={item.title}>
                                <Link href={item.path} className="flex w-full items-center gap-2">
                                  <item.icon className="h-4 w-4" />
                                  {(isMobile || !state || state !== "collapsed") && <span>{item.title}</span>}
                                </Link>
                              </SidebarMenuButton>
                            </div>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>

                    <SidebarMenu className="absolute bottom-0 left-0 w-full">
                      {bottomItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          {item.title === "Analytics" ? (
                            <div className="w-full">
                              <SidebarMenuButton tooltip={item.title}>
                                <Link href={item.url} className="flex w-full items-center gap-2">
                                  <item.icon className="h-4 w-4" />
                                  {(isMobile || !state || state !== "collapsed") && <span>{item.title}</span>}
                                </Link>
                              </SidebarMenuButton>
                            </div>
                          ) : item.title === "Theme" ? (
                            <SidebarMenuButton
                              onClick={() =>
                                setTheme(theme === "light" ? "dark" : "light")
                              }
                              tooltip={item.title}
                            >
                              {theme === "light" ? <Moon /> : <Sun />}
                              <span>
                                {theme === "light" ? "Dark Mode" : "Light Mode"}
                              </span>
                            </SidebarMenuButton>
                          ) : item.dialog ? (
                            <Dialog
                              open={dialogStates[item.title]}
                              onOpenChange={(open) =>
                                handleDialogChange(item.title, open)
                              }
                            >
                              <DialogTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                  <item.icon />
                                  {
                                    {
                                      Notifications: hasUnHackedDecks && (
                                        <div
                                          className={
                                            "rounded-xl w-2 h-2 bg-green-500 absolute top-1 left-5"
                                          }
                                        />
                                      ),
                                    }[item.title]
                                  }
                                  <span className="flex items-center">
                                    {item.title}
                                  </span>
                                </SidebarMenuButton>
                              </DialogTrigger>
                              <DialogContent>
                                {
                                  {
                                    Notifications: (
                                      <DialogTitle>
                                        <div>
                                          <p>
                                            You have{" "}
                                            {
                                              notifications.decks?.filter(
                                                (e) =>
                                                  e.wf_status === "completed"
                                              ).length
                                            }{" "}
                                            new decks.
                                          </p>
                                          <div className="max-h-[200px] overflow-y-auto relative flex flex-col gap-2 mt-4">
                                            {notifications.decks
                                              ?.filter(
                                                (e) =>
                                                  e.wf_status === "completed"
                                              )
                                              .map((deck) => (
                                                <DialogClose
                                                  key={deck.id}
                                                  asChild
                                                >
                                                  <Link
                                                    href={`/decks/${deck.id}?status=completed`}
                                                    key={deck.id}
                                                    className="bg-transparent text-primary hover:underline hover:bg-secondary dark:hover:bg-gray-900 py-1"
                                                  >
                                                    {deck.name}
                                                  </Link>
                                                </DialogClose>
                                              ))}
                                          </div>
                                        </div>
                                      </DialogTitle>
                                    ),
                                    Logout: (
                                      <DialogTitle>
                                        <div>
                                          <p>
                                            Are you sure you want to log out?
                                          </p>
                                          <div className="flex relative gap-2 mt-4">
                                            <DialogClose asChild>
                                              <Button
                                                variant="outline"
                                                type="button"
                                              >
                                                Cancel
                                              </Button>
                                            </DialogClose>
                                            <div className="flex-grow" />
                                            <Button onClick={() => logout()}>
                                              Logout
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogTitle>
                                    ),
                                  }[item.title]
                                }
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <SidebarMenuButton asChild tooltip={item.title}>
                              <a href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="relative h-[calc(100vh-4rem)]">
                <div className="px-1 flex">
                  <SidebarMenuButton
                    tooltip={"Expand"}
                    onClick={toggleSidebar}
                    className={cn(
                      "absolute dark:text-white",
                      state !== "collapsed"
                        ? "right-2 top-0 w-8 h-8"
                        : "right-0 top-44 mt-1 text-gray-600 w-5 h-5"
                    )}
                  >
                    {state !== "collapsed" ? (
                      <LucideArrowLeftFromLine />
                    ) : (
                      <LucideArrowRightFromLine />
                    )}
                  </SidebarMenuButton>
                  <Link
                    href="/"
                    className="cursor-pointer transition-opacity rounded-md "
                  >
                    {state === "collapsed" ? (
                      <Image
                        src="/battledeck-logo-circle.png"
                        alt="Battledeck Banner"
                        width={35}
                        height={15}
                        className="w-auto h-auto mr-2"
                      />
                    ) : (
                      <Image
                        src={`/website_banner_${theme}.png`}
                        alt="Battledeck Banner"
                        width={200}
                        height={150}
                        className="w-auto h-auto mr-2"
                      />
                    )}
                  </Link>
                </div>
                <SidebarMenu className="mt-4">
                  {topItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.dialog ? (
                        <Dialog
                          open={dialogStates[item.title]}
                          onOpenChange={(open) =>
                            handleDialogChange(item.title, open)
                          }
                        >
                          <DialogTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              <item.icon />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </DialogTrigger>
                          <DialogContent>
                            {
                              {
                                "New Deck": (
                                  <CreateDeckForm
                                    onOpenChange={(open) =>
                                      handleDialogChange(item.title, open)
                                    }
                                  />
                                ),
                                Search: <SearchDialog />,
                              }[item.title]
                            }
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="w-full">
                          <SidebarMenuButton tooltip={item.title}>
                            <Link href={item.path} className="flex w-full items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {(isMobile || !state || state !== "collapsed") && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuButton>
                        </div>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>

                <SidebarMenu className="absolute bottom-0 left-0 w-full">
                  {bottomItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.title === "Analytics" ? (
                        <div className="w-full">
                          <SidebarMenuButton tooltip={item.title}>
                            <Link href={item.url} className="flex w-full items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {(isMobile || !state || state !== "collapsed") && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuButton>
                        </div>
                      ) : item.title === "Theme" ? (
                        <SidebarMenuButton
                          onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                          }
                          tooltip={item.title}
                        >
                          {theme === "light" ? <Moon /> : <Sun />}
                          <span>
                            {theme === "light" ? "Dark Mode" : "Light Mode"}
                          </span>
                        </SidebarMenuButton>
                      ) : item.dialog ? (
                        <Dialog
                          open={dialogStates[item.title]}
                          onOpenChange={(open) =>
                            handleDialogChange(item.title, open)
                          }
                        >
                          <DialogTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              <item.icon />
                              {
                                {
                                  Notifications: hasUnHackedDecks && (
                                    <div
                                      className={
                                        "rounded-xl w-2 h-2 bg-green-500 absolute top-1 left-5"
                                      }
                                    />
                                  ),
                                }[item.title]
                              }
                              <span className="flex items-center">
                                {item.title}
                              </span>
                            </SidebarMenuButton>
                          </DialogTrigger>
                          <DialogContent>
                            {/* <VisuallyHidden> */}
                            <DialogTitle>{item.title}</DialogTitle>
                            {/* </VisuallyHidden> */}
                            {
                              {
                                Notifications: (
                                  <DialogTitle>
                                    <div>
                                      <p>
                                        You have{" "}
                                        {
                                          notifications.decks?.filter(
                                            (e) => e.wf_status === "completed"
                                          ).length
                                        }{" "}
                                        new decks.
                                      </p>
                                      <div className="max-h-[200px] overflow-y-auto relative flex flex-col gap-2 mt-4">
                                        {notifications.decks
                                          ?.filter(
                                            (e) => e.wf_status === "completed"
                                          )
                                          .map((deck) => (
                                            <DialogClose key={deck.id} asChild>
                                              <Link
                                                href={`/decks/${deck.id}?status=completed`}
                                                key={deck.id}
                                                className="bg-transparent text-primary hover:underline hover:bg-secondary dark:hover:bg-gray-900 py-1"
                                              >
                                                {deck.name}
                                              </Link>
                                            </DialogClose>
                                          ))}
                                      </div>
                                    </div>
                                  </DialogTitle>
                                ),
                                Logout: (
                                  <DialogTitle>
                                    <div>
                                      <p>Are you sure you want to log out?</p>
                                      <div className="flex relative gap-2 mt-4">
                                        <DialogClose asChild>
                                          <Button
                                            variant="outline"
                                            type="button"
                                          >
                                            Cancel
                                          </Button>
                                        </DialogClose>
                                        <div className="flex-grow" />
                                        <Button onClick={() => logout()}>
                                          Logout
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogTitle>
                                ),
                              }[item.title]
                            }
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      )}
    </>
  );
}
