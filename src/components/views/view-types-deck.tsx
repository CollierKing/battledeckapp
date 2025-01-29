import {
  Trash2,
  Loader2 as Spinner,
  CheckCheck as CheckCheckIcon,
  AlertCircleIcon,
  LucideArrowRightFromLine,
} from "lucide-react";
import {
  CardTitle,
  CardDescription,
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Deck } from "@/types/decks";
import Image from "next/image";
import TextResult from "../ui/text-result";

interface ViewProps<T> {
  items?: T[];
  onItemClick?: (id: string | number) => void;
  onDeleteClick?: (item: T) => void;
  search: string;
}

// MARK: - List View
const ListView = <T extends Deck>({
  items,
  onItemClick,
  onDeleteClick,
  search,
}: ViewProps<T>) => (
  <ul className="w-11/12 space-y-1">
    {items?.map((item) => (
      <div
        key={item.id}
        className="space-x-2 flex border relative items-center gap-2 p-2 hover:bg-secondary rounded-lg"
      >
        {item.hero_image_url ? (
          <Image
            src={item.hero_image_url}
            alt={item.name}
            width={200}
            height={96}
            className="h-10 w-14 object-cover"
          />
        ) : (
          <div className="h-10 w-14 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-300 mb-2">
                {/* {item.name.charAt(0)} */}
                {/* <span className="text-sm text-gray-400">No preview available</span> */}
              </div>
            </div>
          </div>
        )}
        <div className="w-1/6">
          <CardTitle className="break-words whitespace-normal">
            {item.name}
          </CardTitle>
        </div>

        <div className="w-11/12">
          <CardDescription className="w-full line-clamp-3 break-words">
            {TextResult(item.ai_prompt, search, "line-clamp-3 break-words")}
          </CardDescription>
        </div>
        <div className="flex-grow" />

        <div className="flex items-center gap-2">
          {onItemClick && (
            <button
              title={item.wf_status === "pending" ? "Pending" : ""}
              disabled={item.wf_status === "pending"}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onItemClick(item.id)}
            >
              <LucideArrowRightFromLine className="h-4 w-4 hover:text-gray-700" />
            </button>
          )}
          {item.wf_status === "pending" ? (
            <Spinner
              aria-label="pending"
              className="h-4 w-4 text-gray-700 animate-spin"
            />
          ) : item.wf_status === "completed" ? (
            <AlertCircleIcon
              aria-label="completed"
              className="h-4 w-4 text-green-500 hover:text-green-700"
            />
          ) : item.wf_status === "acknowledged" ? (
            <CheckCheckIcon
              aria-label="viewed"
              className="h-4 w-4 text-green-700"
            />
          ) : null}
          {onDeleteClick && (
            <Trash2
              className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
              onClick={() => onDeleteClick(item)}
            />
          )}
        </div>
      </div>
    ))}
  </ul>
);

// MARK: - Grid View
const GridView = <T extends Deck>({
  items,
  onItemClick,
  onDeleteClick,
  search,
}: ViewProps<T>) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
    {items?.map((item) => (
      <Card key={item.id} className="overflow-hidden relative">
        {item.hero_image_url ? (
          <Image
            src={item.hero_image_url}
            alt={item.name}
            width={200}
            height={96}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No preview available</span>
          </div>
        )}
        <CardHeader className="flex-grow">
          <CardTitle>{item.name}</CardTitle>
          <CardDescription className="line-clamp-5 break-words">
            {TextResult(item.ai_prompt, search, "line-clamp-5 break-words")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            {onItemClick && (
              <button
                title={item.wf_status === "pending" ? "Pending" : ""}
                disabled={item.wf_status === "pending"}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onItemClick(item.id)}
              >
                <LucideArrowRightFromLine className="h-4 w-4 hover:text-gray-700" />
              </button>
            )}
            {item.wf_status === "pending" ? (
              <Spinner
                aria-label="pending"
                className="h-4 w-4 text-gray-700 animate-spin"
              />
            ) : item.wf_status === "completed" ? (
              <AlertCircleIcon
                aria-label="completed"
                className="h-4 w-4 text-green-500 hover:text-green-700"
              />
            ) : item.wf_status === "acknowledged" ? (
              <CheckCheckIcon
                aria-label="viewed"
                className="h-4 w-4 text-green-700"
              />
            ) : null}
            {onDeleteClick && (
              <Trash2
                className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => onDeleteClick(item)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// MARK: - Carousel View
const CarouselView = <T extends Deck>({
  items,
  onItemClick,
  onDeleteClick,
  search,
}: ViewProps<T>) => (
  <div className="pl-10 w-11/12">
    <Carousel className="max-w-5xl mx-auto">
      <CarouselContent>
        {items?.map((item) => (
          <CarouselItem key={item.id}>
            <Card>
              <CardContent className="p-0">
                <div className="relative h-[600px] w-full">
                  {item.hero_image_url ? (
                    <Image
                      src={item.hero_image_url}
                      alt={item.name}
                      sizes="(max-width: 320px) 100vw,
                    (max-width: 480px) 90vw,
                    (max-width: 640px) 80vw,
                    (max-width: 768px) 70vw,
                    (max-width: 1024px) 60vw,
                    (max-width: 1100px) 50vw,
                    (max-width: 1200px) 40vw,
                    10vw"
                      fill={true}
                      className="object-cover"
                    />
                  ) : (
                    <div className="min-h-[600px] min-w-[200px] h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-300 mb-2">
                          {item.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">
                          No preview available
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                    <CardTitle className="text-white">{item.name}</CardTitle>
                    <CardDescription className="line-clamp-5 break-words text-white">
                      {TextResult(
                        item.ai_prompt,
                        search,
                        "line-clamp-5 break-words text-white"
                      )}
                    </CardDescription>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex space-x-2">
                        {onItemClick && (
                          <button
                            title={
                              item.wf_status === "pending" ? "Pending" : ""
                            }
                            disabled={item.wf_status === "pending"}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onItemClick(item.id)}
                          >
                            <LucideArrowRightFromLine className="h-4 w-4 hover:text-gray-700" />
                          </button>
                        )}
                        {item.wf_status === "pending" ? (
                          <Spinner
                            aria-label="pending"
                            className="h-4 w-4 text-gray-700 animate-spin"
                          />
                        ) : item.wf_status === "completed" ? (
                          <AlertCircleIcon
                            aria-label="completed"
                            className="h-4 w-4 text-green-500 hover:text-green-700"
                          />
                        ) : item.wf_status === "acknowledged" ? (
                          <CheckCheckIcon
                            aria-label="viewed"
                            className="h-4 w-4 text-green-700"
                          />
                        ) : null}
                        {onDeleteClick && (
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() => onDeleteClick(item)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

export { ListView, GridView, CarouselView };
