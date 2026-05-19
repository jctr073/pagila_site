import { notFound } from "next/navigation";

import {
    getStoreDetail,
    listCustomersByStore,
} from "@/lib/queries/stores";

export default async function StoreCustomersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const storeId = Number.parseInt(id, 10);

    if (!Number.isFinite(storeId) || storeId < 0) notFound();

   const store = await getStoreDetail(storeId);
   if (!store) notFound();

   const customers = await listCustomersByStore(storeId, store.customers);

   return (
    <div>
      <h1>
        Customers for {store.name?.trim() || `${store.city}, ${store.country}`}
      </h1>

      <p>
        Showing {customers.length} of {store.customers}
      </p>

      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>
            {customer.name} · {customer.email}
          </li>
        ))}
      </ul>
    </div>
  );
}