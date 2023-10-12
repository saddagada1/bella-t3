import Avatar from "boring-avatars";
import Image from "next/image";
import { type DetailedHTMLProps, type HTMLAttributes, useState } from "react";
import { Skeleton } from "./skeleton";
import { cn } from "~/utils/shadcn/utils";

interface LoadingImageProps {
  url: string;
  alt: string;
  width: number;
  priority?: boolean;
}

const LoadingImage: React.FC<LoadingImageProps> = ({
  url,
  alt,
  width,
  priority,
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Image
        unoptimized
        priority={priority}
        src={url}
        alt={alt}
        fill
        sizes={`${width}px`}
        className={cn("object-cover", !loaded && "opacity-0")}
        onLoadingComplete={() => setLoaded(true)}
      />
      {!loaded && <Skeleton className="absolute h-full w-full" />}
    </>
  );
};

interface SafeImageProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  url?: string | null;
  alt: string;
  width: number;
  square?: boolean;
  priority?: boolean;
  loading?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({
  url,
  alt,
  width,
  square,
  priority,
  loading,
  ...DetailedHTMLProps
}) => {
  const { className, ...props } = DetailedHTMLProps;

  if (!!loading) {
    return (
      <Skeleton
        {...props}
        style={{ width, height: width }}
        className={cn("relative", className)}
      />
    );
  }

  return (
    <div style={{ width }} {...props} className={cn("relative", className)}>
      {url ? (
        <LoadingImage url={url} priority={priority} alt={alt} width={width} />
      ) : (
        <Avatar size={width} name={alt} variant="marble" square={square} />
      )}
    </div>
  );
};
export default SafeImage;
