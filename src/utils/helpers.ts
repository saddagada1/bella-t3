export const putImage = async (url: string, file: File) => {
  const response = await fetch(url, { method: "PUT", body: file });
  if (response.status === 200) {
    return true;
  }
  return false;
};

export const removeDuplicates = (values: string[]) => {
  return values.filter(
    (dup, index) => index <= values.findIndex((original) => original === dup),
  );
};
