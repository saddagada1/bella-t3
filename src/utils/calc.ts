import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const calcUsername = (email?: string) => {
  return (
    email?.split("@")[0]?.slice(0, 5) +
      Math.random().toString(36).slice(2, 10) ??
    Math.random().toString(36).slice(0, 13)
  );
};

export const calcRelativeTime = (time: Date) => {
  return dayjs(time).fromNow();
};

export const calcCompactValue = (value: number) => {
  return value.toLocaleString(undefined, {
    notation: "compact",
  });
};

export const calcTrimmedString = (str: string) => {
  return str.replace(/\s+/g, " ").trim();
};
