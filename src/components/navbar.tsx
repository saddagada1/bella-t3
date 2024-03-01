import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { departments, presetFilters } from "~/utils/constants";
import { api } from "~/utils/api";
import { toast } from "sonner";
import NotificationCard from "./notificationCard";
import { NoContent } from "./ui/typography/noContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const SideMenu: React.FC = () => {
  const { status: sessionStatus } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Sheet open={isOpen} onOpenChange={(o) => setIsOpen(o)}>
      <SheetTrigger asChild>
        <Button variant="link" className="lg:hidden">
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent
        className="no-scrollbar flex h-screen flex-col overflow-y-scroll"
        side="left"
      >
        <h1 className="text-4xl font-bold uppercase">bella</h1>
        {sessionStatus === "authenticated" ? (
          <div className="my-4 grid grid-cols-2 grid-rows-3 gap-2">
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/store">Store</Link>
            </Button>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/orders">Orders</Link>
            </Button>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/search">Search</Link>
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="col-span-2"
              asChild
              variant="outline"
            >
              <Link href="/notifications">Notifications</Link>
            </Button>
          </div>
        ) : (
          <div className="my-4 flex gap-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
              asChild
              variant="outline"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
              asChild
              variant="outline"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
        <div className="space-y-4 border-t border-input pt-6">
          <h2 className="mb-8 font-mono text-xl font-bold uppercase">
            Browse Inventory
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="menswear">
              <AccordionTrigger className="!text-sm uppercase">
                Menswear
              </AccordionTrigger>
              <AccordionContent>
                {departments
                  .find((department) => department.name === "Men")
                  ?.categories.map((category, index) => (
                    <Button
                      onClick={() => setIsOpen(false)}
                      asChild
                      variant="link"
                      key={index}
                      className="pr-0"
                    >
                      <Link
                        className="w-full justify-between"
                        href={{
                          pathname: "/products",
                          query: {
                            filters: JSON.stringify(
                              presetFilters.unisex[category.name.toLowerCase()],
                            ),
                          },
                        }}
                      >
                        {category.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="womenswear">
              <AccordionTrigger className="!text-sm uppercase">
                Womenswear
              </AccordionTrigger>
              <AccordionContent>
                {departments
                  .find((department) => department.name === "Women")
                  ?.categories.map((category, index) => (
                    <Button
                      onClick={() => setIsOpen(false)}
                      asChild
                      variant="link"
                      key={index}
                      className="pr-0"
                    >
                      <Link
                        className="w-full justify-between"
                        href={{
                          pathname: "/products",
                          query: {
                            filters: JSON.stringify(
                              presetFilters.unisex[category.name.toLowerCase()],
                            ),
                          },
                        }}
                      >
                        {category.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="footwear">
              <AccordionTrigger className="!text-sm uppercase">
                Footwear
              </AccordionTrigger>
              <AccordionContent>
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="link"
                  className="pr-0"
                >
                  <Link
                    className="w-full justify-between"
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(presetFilters.footwear.unisex),
                      },
                    }}
                  >
                    Unisex
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="link"
                  className="pr-0"
                >
                  <Link
                    className="w-full justify-between"
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(presetFilters.footwear.men),
                      },
                    }}
                  >
                    Men
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="link"
                  className="pr-0"
                >
                  <Link
                    className="w-full justify-between"
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(presetFilters.footwear.women),
                      },
                    }}
                  >
                    Women
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="mt-auto flex items-center justify-between pt-20">
          <p className="font-mono text-xs uppercase text-muted-foreground">
            Bella &copy; 2023
          </p>
          {sessionStatus === "authenticated" && (
            <Button
              onClick={() => {
                void signOut();
                setIsOpen(false);
              }}
              className="h-fit w-fit py-0 pr-0 text-xs text-destructive"
              variant="link"
            >
              Logout
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Navbar: React.FC = () => {
  const { status: sessionStatus } = useSession();
  const { data: bagItemsCount, error: bagsItemsCountError } =
    api.bags.countBagItems.useQuery(undefined, {
      enabled: sessionStatus === "authenticated",
    });

  const { data: notifications, error: notificationsError } =
    api.notifications.getUserNotifications.useQuery(
      { limit: 10 },
      {
        enabled: sessionStatus === "authenticated",
      },
    );

  if (bagsItemsCountError ?? notificationsError) {
    toast.error("Could Not Fetch Some Data");
  }

  return (
    <>
      <nav className="p container fixed z-50 flex h-20 items-center justify-between bg-background px-0">
        <Button
          variant="link"
          className="font-sans text-2xl font-bold hover:no-underline lg:pl-0 lg:text-4xl"
          asChild
        >
          <Link href="/">bella</Link>
        </Button>
        <div className="hidden items-center lg:flex">
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button variant="link" asChild>
                <p className="cursor-pointer">
                  Menswear
                  <ChevronDown className="ml-2 h-5 w-5" />
                </p>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
              {departments
                .find((department) => department.name === "Men")
                ?.categories.map((category, index) => (
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start"
                    key={index}
                  >
                    <Link
                      href={{
                        pathname: "/products",
                        query: {
                          filters: JSON.stringify(
                            presetFilters.men[category.name.toLowerCase()],
                          ),
                        },
                      }}
                    >
                      {category.name}
                    </Link>
                  </Button>
                ))}
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button variant="link" asChild>
                <p className="cursor-pointer">
                  Womenswear
                  <ChevronDown className="ml-2 h-5 w-5" />
                </p>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
              {departments
                .find((department) => department.name === "Women")
                ?.categories.map((category, index) => (
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start"
                    key={index}
                  >
                    <Link
                      href={{
                        pathname: "/products",
                        query: {
                          filters: JSON.stringify(
                            presetFilters.women[category.name.toLowerCase()],
                          ),
                        },
                      }}
                    >
                      {category.name}
                    </Link>
                  </Button>
                ))}
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button variant="link" asChild>
                <p className="cursor-pointer">
                  Footwear
                  <ChevronDown className="ml-2 h-5 w-5" />
                </p>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
              <Button asChild variant="ghost" className="justify-start">
                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      filters: JSON.stringify(presetFilters.footwear.unisex),
                    },
                  }}
                >
                  Unisex
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      filters: JSON.stringify(presetFilters.footwear.men),
                    },
                  }}
                >
                  Men
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      filters: JSON.stringify(presetFilters.footwear.women),
                    },
                  }}
                >
                  Women
                </Link>
              </Button>
            </HoverCardContent>
          </HoverCard>
          <Button variant="link" asChild>
            <Link href="/search">Search</Link>
          </Button>
        </div>
        <div className="flex justify-end gap-2 lg:col-start-6">
          {sessionStatus === "unauthenticated" ? (
            <>
              <Button asChild variant="link">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button asChild variant="link">
                <Link href="/login">Login</Link>
              </Button>
            </>
          ) : (
            <>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button className="hidden lg:flex" asChild variant="link">
                    <p className="cursor-pointer">
                      Notifications({notifications?.items.length ?? 0})
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </p>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-[300px] flex-col gap-4">
                  {notifications && notifications.items.length > 0 ? (
                    notifications?.items.map((notification, index) => (
                      <NotificationCard
                        className={index !== 0 ? "border-t pt-4" : undefined}
                        key={index}
                        notification={notification}
                      />
                    ))
                  ) : (
                    <NoContent className="py-6 text-center">
                      No Recent Notifications
                    </NoContent>
                  )}
                  <Link
                    className="border-t pt-4 text-center text-sm font-medium hover:underline"
                    href="/notifications"
                  >
                    View All Notifications
                  </Link>
                </HoverCardContent>
              </HoverCard>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button className="hidden lg:flex" asChild variant="link">
                    <p className="cursor-pointer">
                      Profile
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </p>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-fit flex-col gap-4">
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/store">Store</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/orders">Orders</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/profile">View Profile</Link>
                  </Button>
                  <Button
                    onClick={() => void signOut()}
                    variant="ghost"
                    className="justify-start hover:bg-destructive hover:text-background"
                  >
                    Sign Out
                  </Button>
                </HoverCardContent>
              </HoverCard>
              <Button variant="link" asChild className="pr-0">
                <Link href="/bag">
                  Bag(
                  {bagItemsCount ?? 0})
                </Link>
              </Button>
              <SideMenu />
            </>
          )}
        </div>
      </nav>
      <div className="h-20 shrink-0" />
    </>
  );
};

export default Navbar;
