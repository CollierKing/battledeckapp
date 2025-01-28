import { Trash2 } from "lucide-react";
import {
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
import { Slide } from "@/types/slides";
import Image from "next/image";
import TextResult from "@/components/ui/text-result";


interface ViewProps<T> {
  items: T[];
  onItemClick?: (id: string | number) => void;
  onDeleteClick?: (item: T) => void;
  search: string;
}

// MARK: - List View
const ListView = <T extends Slide>({
  items,
  onDeleteClick,
  search,
}: ViewProps<T>) => (
  <ul className="space-y-4">
    {items.map((item) => (
      <div key={item.id} className="flex space-x-4 items-center">
        <CardDescription>
          {TextResult(item.caption, search, "line-clamp-5 break-words")}
        </CardDescription>
        <div className="flex space-x-2 ml-auto">
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
const GridView = <T extends Slide>({
  items,
  onDeleteClick,
  search,
}: ViewProps<T>) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
    {items.map((item) => (
      <Card key={item.id} className="overflow-hidden relative">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.id.toString()}
            width={200}
            height={96}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No preview available</span>
          </div>
        )}
        <CardHeader className="mb-4">
          <CardDescription className="line-clamp-5 break-words">
            {TextResult(item.caption, search, "line-clamp-5 break-words")}
          </CardDescription>
        </CardHeader>

        <div className="absolute bottom-4 left-5 space-x-2">
          {onDeleteClick && (
            <Trash2
              className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
              onClick={() => onDeleteClick(item)}
            />
          )}
        </div>
      </Card>
    ))}
  </div>
);

// MARK: - Carousel View
const CarouselView = <T extends Slide>({
  items,
  onDeleteClick,
  search,
}: ViewProps<T>) => (
  <div className="pl-10 w-11/12">
    <Carousel className="max-w-5xl mx-auto">
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.id}>
            <Card>
              <CardContent className="p-0">
                <div className="relative h-[600px] w-full">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.id.toString()}
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
                        {/* <div className="text-3xl font-bold text-gray-300 mb-2">
                          {item.name.charAt(0)}
                        </div> */}
                        <span className="text-sm text-gray-400">
                          No preview available
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                    <CardDescription className="text-gray-200">
                      {TextResult(item.caption, search, "text-gray-200")}
                    </CardDescription>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex space-x-2">
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
