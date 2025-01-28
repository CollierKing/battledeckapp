import { Input } from "./input";
import { Button } from "./button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SearchInput = ({
  search,
  setSearch,
  placeholder,
  className,
}: {
  search: string;
  setSearch: (search: string) => void;
  placeholder: string;
  className?: string;
}) => (
  <div className={cn("relative flex flex-col space-y-1.5", className)}>
    {/* <Label htmlFor="name">Name</Label> */}
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value.toLowerCase())}
      id="name"
      placeholder={placeholder}
    />
    {search && (
      <Button
        className="h-6 w-2 absolute rounded-2xl bg-transparent border-none top-0 right-1"
        variant="outline"
        onClick={() => setSearch("")}
      >
        <XIcon />
      </Button>
    )}
  </div>
);

export default SearchInput;
