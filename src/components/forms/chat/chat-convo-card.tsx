import { Card } from "@/components/ui/card";

export default function ChatConvoCard({
  part,
  isUser,
}: {
  part: any;
  isUser: boolean;
}) {
  return (
    // Render regular text card
    <Card
      className={`p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 ${
        isUser ? "rounded-br-none" : "rounded-bl-none border-assistant-border"
      } ${
        part.text.startsWith("scheduled message") ? "border-accent/50" : ""
      } relative`}
    >
      {part.text.startsWith("scheduled message") && (
        <span className="absolute -top-3 -left-2 text-base">🕒</span>
      )}

      <p className="text-sm whitespace-pre-wrap">
        {part.text.replace(/^scheduled message: /, "")}
      </p>
    </Card>
  );
}
