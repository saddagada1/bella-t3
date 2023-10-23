import { type StoreOrder, type UserOrder } from "~/utils/types";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { FormTitle } from "./ui/form";
import { ValueLabel } from "./ui/typography/valueLabel";
import Link from "next/link";
import ProductCard from "./productCard";
import { Button, ButtonLoading } from "./ui/button";
import { calcRelativeTime } from "~/utils/calc";
import { cn } from "~/utils/shadcn/utils";
import { useState, type HTMLAttributes } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";

interface OrderCardProps extends HTMLAttributes<HTMLDivElement> {
  data: UserOrder | StoreOrder;
  onUpdate?: () => void;
  updating?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  data,
  onUpdate,
  updating,
  ...rest
}) => {
  const [order, setOrder] = useState(data);
  const { className, ...props } = rest;
  const { mutateAsync: cancelOrder, isLoading: cancellingOrder } =
    api.orders.cancelOrder.useMutation({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: (response) => {
        setOrder(response);
      },
    });
  return (
    <Card {...props} className={cn("lg:flex", className)}>
      <div className="flex-1">
        <CardHeader className="space-y-0">
          <FormTitle className="mb-4">{`Order #${order.id}`}</FormTitle>
          <div className="flex w-full flex-col text-center text-sm font-medium lg:flex-row lg:items-start lg:text-base">
            <div className="flex flex-1">
              <div className="flex-1 border-r border-input">
                <ValueLabel className="ml-0 lg:ml-0">
                  {"store" in order ? "Seller" : "Buyer"}
                </ValueLabel>
                <Link
                  className="hover:underline"
                  href={`/${
                    "store" in order
                      ? order.store.user.username
                      : order.user.username
                  }`}
                >
                  @
                  {"store" in order
                    ? order.store.user.username
                    : order.user.username}
                </Link>
              </div>
              <div className="flex-1">
                <ValueLabel>Placed</ValueLabel>
                <p>{calcRelativeTime(order.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-1 border-t border-input pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pt-0">
              <div className="flex-1 border-r border-input">
                <ValueLabel className="ml-0">Payment Status</ValueLabel>
                <p
                  className={cn(
                    "capitalize",
                    order.paymentStatus === "failed" && "text-destructive",
                    order.paymentStatus === "completed" && "text-green-600",
                  )}
                >
                  {order.paymentStatus.replace("_", " ")}
                </p>
              </div>
              <div className="flex-1">
                <ValueLabel>Order Status</ValueLabel>
                <p
                  className={cn(
                    "capitalize",
                    order.orderStatus === "cancelled" && "text-destructive",
                    order.orderStatus === "shipped" && "text-green-600",
                  )}
                >
                  {order.orderStatus.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormTitle className="mb-4">Item(s)</FormTitle>
          <div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2">
            {order.orderItems.map((item, index) => (
              <ProductCard
                className="shrink-0 basis-2/5"
                key={index}
                item={item}
              />
            ))}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex-col gap-4 lg:basis-1/3 lg:pt-6">
        <div className="w-full">
          <FormTitle className="mb-4">Shipping</FormTitle>
          <ValueLabel className="ml-0 lg:ml-0">Address</ValueLabel>
          <p className="text-sm font-medium lg:text-base">
            {`${order.address.firstName} ${order.address.lastName}, ${
              order.address.line1
            }${order.address.line2 ? " " + order.address.line2 : ""}, ${
              order.address.city
            }, ${order.address.province}, ${order.address.country}, ${
              order.address.zip
            }`}
          </p>
        </div>
        <div className="mb-4 flex w-full flex-col gap-4 text-sm font-semibold lg:text-base">
          <FormTitle>Payment</FormTitle>
          <div className="flex items-end justify-between border-b border-input pb-2">
            <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
              Item(s)
            </ValueLabel>
            <p>${order.subTotal / 100}</p>
          </div>
          <div className="flex items-end justify-between border-b border-input pb-2">
            <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
              Shipping Total
            </ValueLabel>
            <p>${order.shippingTotal / 100}</p>
          </div>
          <div className="flex items-end justify-between border-b border-input pb-2">
            <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
              Grand Total
            </ValueLabel>
            <p>${order.grandTotal / 100}</p>
          </div>
        </div>
        <div className="flex w-full gap-4">
          {updating ? (
            <ButtonLoading size="form" variant="outline" />
          ) : (
            <Button
              disabled={order.orderStatus !== "in_progress"}
              size="form"
              variant="outline"
              onClick={() => onUpdate && onUpdate()}
            >
              {"store" in order ? "Update" : "Mark as Shipped"}
            </Button>
          )}
          {cancellingOrder ? (
            <ButtonLoading size="form" />
          ) : (
            <Button
              onClick={() => {
                try {
                  void cancelOrder({
                    type: "store" in order ? "user" : "store",
                    id: order.id,
                    storeId: order.storeId,
                    paymentId: order.paymentId,
                  });
                } catch (error) {
                  return;
                }
              }}
              disabled={order.orderStatus !== "in_progress"}
              size="form"
            >
              {order.orderStatus === "cancelled"
                ? "Cancelled"
                : order.orderStatus === "shipped"
                ? "Shipped"
                : "Cancel"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
export default OrderCard;
