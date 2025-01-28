import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { UploadedFile } from "@/types/upload-file";

// MARK: - FileUploadSection
export const FileUploadSection = ({
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  showGenerateCaptions,
  generateCaptions,
  setGenerateCaptions,
}: {
  uploadedFiles: UploadedFile[];
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  showGenerateCaptions: boolean;
  generateCaptions: boolean;
  setGenerateCaptions: (value: boolean) => void;
}) => (
  <div className="flex flex-col space-y-4 w-full">
    <div className="flex justify-between">
      <div className="relative w-3/4">
        <Label>Choose Images</Label>
        <div className="relative">
          <Button type="button" variant="outline" className="w-fit">
            Upload
          </Button>
          <Input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={onFileUpload}
            className="opacity-0 absolute inset-0 w-1/3 h-full cursor-pointer"
          />
          <p className="inline-block ml-2 mt-1.5 text-sm text-muted-foreground">
            {uploadedFiles.length > 0 &&
              `${uploadedFiles.length} files selected`}
          </p>
        </div>
      </div>
      {showGenerateCaptions && (
        <div className="flex items-center space-x-1 self-end">
          <Label className="text-muted-foreground whitespace-nowrap">
            Generate Captions
          </Label>
          <Input
            className="accent-primary h-5 w-5"
            type="checkbox"
            checked={generateCaptions}
            onChange={(e) => setGenerateCaptions(e.target.checked)}
          />
        </div>
      )}
    </div>
    {uploadedFiles.length > 0 && (
      <div className="max-h-96 w-full overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 overflow-y-auto">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group mt-3 mr-2">
              <Button
                onClick={() => onRemoveFile(index)}
                className="h-5 w-1 shadow-lg absolute z-[9999] -top-2 -right-2 bg-primary rounded-full shadow-sm "
                type="button"
                aria-label="Remove image"
              >
                <X />
              </Button>
              <Image
                src={file.preview}
                alt={`Preview ${index + 1}`}
                width={200}
                height={96}
                className="w-full h-24 object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
