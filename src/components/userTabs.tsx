import { useWindowSize } from "usehooks-ts";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { lgBreakpoint } from "~/utils/constants";

const UserTabs = () => {
  const { width } = useWindowSize();
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">
          {width > lgBreakpoint ? "All Products" : "All"}
        </TabsTrigger>
        <TabsTrigger value="selling">
          {width > lgBreakpoint ? "Currently Selling" : "Selling"}
        </TabsTrigger>
        <TabsTrigger value="sold">
          {width > lgBreakpoint ? "Products Sold" : "Sold"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default UserTabs;
