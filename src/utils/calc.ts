export const calcUsername = (email?: string) => {
  return (
    email?.split("@")[0]?.slice(0, 5) +
      Math.random().toString(36).slice(2, 10) ??
    Math.random().toString(36).slice(0, 13)
  );
};
