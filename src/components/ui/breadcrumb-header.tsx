import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  type: "link" | "page";
  text: string;
  href?: string;
}

interface BreadcrumbHeaderProps {
  children: BreadcrumbItem[];
}

export function BreadcrumbHeader({ children }: BreadcrumbHeaderProps) {
  return (
    <div className="flex items-center space-x-1">
      {children.map((item, index) => (
        <div key={index}>
          {item.type === "link" ? (
            <BreadcrumbLink href={item.href!}>{item.text}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{item.text}</BreadcrumbPage>
          )}
          {index < children.length - 1 && <BreadcrumbSeparator />}
        </div>
      ))}
    </div>
  );
}
