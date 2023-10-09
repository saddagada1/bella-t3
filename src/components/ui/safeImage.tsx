import Avatar from "boring-avatars";
import Image from "next/image";
import { type DetailedHTMLProps, type HTMLAttributes, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Skeleton } from "./skeleton";

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
        className={clsx("object-cover", !loaded && "opacity-0")}
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
}

const SafeImage: React.FC<SafeImageProps> = ({
  url,
  alt,
  width,
  square,
  priority,
  ...DetailedHTMLProps
}) => {
  const { className, ...props } = DetailedHTMLProps;
  return (
    <div
      style={{ width }}
      {...props}
      className={twMerge("relative", className)}
    >
      {url ? (
        <LoadingImage url={url} priority={priority} alt={alt} width={width} />
      ) : (
        <Avatar size={width} name={alt} variant="marble" square={square} />
      )}
    </div>
  );
};
export default SafeImage;
