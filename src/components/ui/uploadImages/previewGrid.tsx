import { SortableItem } from "react-easy-sort";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "~/utils/shadcn/utils";

interface PreviewItemProps {
  image: string;
  index: number;
}

const PreviewItem: React.FC<PreviewItemProps> = ({ image, index }) => {
  return (
    <SortableItem>
      <div className="pointer-events-none relative aspect-square w-full select-none overflow-hidden rounded-2xl">
        <Image
          unoptimized
          src={image}
          alt={`Product Image - ${index + 1}`}
          fill
          className="object-cover"
        />
      </div>
    </SortableItem>
  );
};

interface PreviewGridProps {
  images: string[];
  onDelete: (index: number) => void;
}
const PreviewGrid: React.FC<PreviewGridProps> = ({ images, onDelete }) => {
  const [hideDelete, setHideDelete] = useState(false);
  return (
    <div className="my-4 grid w-full grid-cols-3 grid-rows-3 gap-2">
      {Array(9)
        .fill(null)
        .map((_, index) => {
          const image = images[index];
          if (image)
            return (
              <div
                onPointerDown={() => setHideDelete(true)}
                onPointerUp={() => setHideDelete(false)}
                className="relative"
                key={index}
              >
                <PreviewItem image={image} index={index} />
                <span
                  className={cn(
                    "absolute right-0 top-0 cursor-pointer rounded-es-xl rounded-se-xl bg-destructive p-1.5 text-accent",
                    hideDelete && "opacity-0",
                  )}
                  onClick={() => onDelete(index)}
                >
                  <X className="h-4 w-4" />
                </span>
              </div>
            );
          return (
            <div
              key={index}
              className="aspect-square w-full rounded-2xl bg-accent"
            />
          );
        })}
    </div>
  );
};

export default PreviewGrid;
