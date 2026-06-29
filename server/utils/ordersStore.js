const orders = [];

export function listOrders() {
  return orders;
}

export function createOrder(orderData) {
  const order = {
    id: `order-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...orderData,
  };

  orders.push(order);
  return order;
}
