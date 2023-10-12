import { Camera } from "lucide-react";
import { type Accept, useDropzone } from "react-dropzone";

interface DropzoneProps {
  onDrop: <T extends File>(acceptedFiles: T[]) => void;
  accept: Accept;
  maxFiles: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop, accept, maxFiles }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
    maxFiles: maxFiles,
  });

  return (
    <div
      className="aspect-[16/5] w-full rounded-2xl border border-dashed border-input lg:rounded-3xl"
      {...getRootProps()}
    >
      <input className="dropzone-input" {...getInputProps()} />
      <div className="flex h-full w-full flex-col items-center justify-center text-xs text-input">
        <p className="flex items-center">
          <Camera className="mr-2 h-4 w-4" />
          Upload up to {maxFiles} Images
        </p>
        {isDragActive ? (
          <p>Release to Upload</p>
        ) : (
          <p>Drag & Drop or Click to Select Images</p>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
