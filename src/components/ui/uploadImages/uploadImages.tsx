import React, { useCallback, useEffect, useState } from "react";
import Dropzone from "./dropzone";
import PreviewGrid from "./previewGrid";
import SortableList from "react-easy-sort";
import update from "immutability-helper";
import { useIsClient } from "usehooks-ts";

interface UploadImagesProps {
  maxImages: number;
  setImages: (images: File[]) => void;
}

const UploadImages: React.FC<UploadImagesProps> = ({
  maxImages,
  setImages,
}) => {
  const isClient = useIsClient();
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imageURLS, setImageURLS] = useState<string[]>([]);
  const onDrop = useCallback(
    <T extends File>(acceptedFiles: T[]) => {
      acceptedFiles.map((file) => {
        if (productImages.length < maxImages) {
          setProductImages((prevState) => [...prevState, file]);
          setImageURLS((prevState) => [
            ...prevState,
            URL.createObjectURL(file),
          ]);
        }
      });
    },
    [maxImages, productImages],
  );

  useEffect(() => {
    if (productImages.length !== 0) {
      setImages(productImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productImages]);

  if (!isClient) return null;

  return (
    <>
      <Dropzone
        onDrop={onDrop}
        accept={{
          "image/png": [".png"],
          "image/jpg": [".jpg"],
          "image/jpeg": [".jpeg"],
        }}
        maxFiles={maxImages}
      />
      <SortableList
        onSortEnd={(oldIndex, newIndex) => {
          const oldImage = productImages[oldIndex];
          const oldURL = imageURLS[oldIndex];

          if (!oldURL || !oldImage) return;
          setProductImages(
            update(productImages, {
              $splice: [
                [oldIndex, 1],
                [newIndex, 0, oldImage],
              ],
            }),
          );
          setImageURLS(
            update(imageURLS, {
              $splice: [
                [oldIndex, 1],
                [newIndex, 0, oldURL],
              ],
            }),
          );
        }}
      >
        <PreviewGrid
          images={imageURLS}
          onDelete={(index) => {
            const images = productImages.filter((_, i) => index !== i);
            setProductImages(images);
          }}
        />
      </SortableList>
    </>
  );
};
export default UploadImages;
