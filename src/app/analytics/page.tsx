"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { runAnalyticsQuery } from "@/server/actions";
import { AnalyticsState } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queries } from "./queries";
import { Copy, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export const runtime = "edge";

const initialState: AnalyticsState = {
  status: "idle",
  message: "Results will appear here after running a query",
  formData: new FormData(),
  queryType: "graphql",
};

const rowCount = 20;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running...
        </>
      ) : (
        "Run Query"
      )}
    </Button>
  );
}

function AnalyticsEditor() {
  const [state, formAction] = useActionState(runAnalyticsQuery, initialState);
  const [selectedQuery, setSelectedQuery] = useState<string>("");
  const [queryText, setQueryText] = useState<string>("");
  const [queryType, setQueryType] = useState<"sql" | "graphql">("graphql");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // MARK: - HANDLERS
  const handleSubmit = (formData: FormData) => {
    formData.set("queryType", queryType);
    formData.set("query", queryText);
    formAction(formData);
  };

  // Pre-populate with empty lines to show initial line numbers
  const initialLines = Array(rowCount).fill("");

  const formatResult = () => {
    if (state.status === "success") {
      try {
        // If message is a string, try to parse it, otherwise use directly
        const data =
          typeof state.message === "string"
            ? JSON.parse(state.message)
            : state.message;
        return JSON.stringify(data, null, 2);
      } catch (e) {
        console.log("formatResult.error", e);
        return state.message;
      }
    }
    return state.message;
  };

  const handleCopy = () => {
    if (state.status === "success") {
      navigator.clipboard.writeText(formatResult());
    }
  };

  // MARK: - EFFECTS
  useEffect(() => {
    if (selectedQuery) {
      setQueryText(
        "#" +
          queries.find((q) => q.name === selectedQuery)?.name +
          "\n" +
          queries.find((q) => q.name === selectedQuery)?.query || ""
      );
    }
  }, [selectedQuery]);

  // MARK: - RENDER
  return (
    <div className="w-11/12  space-y-8">
      <form action={handleSubmit}>
        <div className="flex w-full border border-input rounded-md bg-muted font-mono min-w-[800px]">
          <div className="p-2 border-r border-input bg-muted/50 select-none">
            {initialLines.map((_, i) => (
              <div
                key={i + 1}
                className="text-muted-foreground text-right pr-2 text-sm leading-6"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            name="query"
            className="flex-grow p-2 border-none bg-background text-sm leading-6 resize-y min-h-[200px] outline-none font-mono"
            placeholder="Enter your query here..."
            rows={rowCount}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
        </div>
        <div className="flex justify-end items-center gap-4 mt-4">
          <Select onValueChange={setSelectedQuery}>
            <SelectTrigger>
              <SelectValue placeholder="Example Queries" />
            </SelectTrigger>
            <SelectContent>
              {queries.map((q) => (
                <SelectItem key={q.name} value={q.name}>
                  Example: {q.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            name="queryType" 
            value={queryType}
            onValueChange={(value: "sql" | "graphql") => setQueryType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select query type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="graphql">GraphQL Analytics</SelectItem>
              <SelectItem value="sql">Analytics Engine (SQL)</SelectItem>
            </SelectContent>
          </Select>
          <SubmitButton />
        </div>
      </form>

      <div className="relative">
        {state.status === "success" && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 z-10"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
          {formatResult()}
        </pre>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="m-6 w-full items-center space-y-2">
      <Label className="w-full text-2xl font-bold mb-2">Analytics Query Editor</Label>
      <AnalyticsEditor />
    </div>
  );
}
