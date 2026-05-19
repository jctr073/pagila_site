/**
 * Intercepted rental drawer — `/rentals/[id]` when navigated to FROM
 * `/rentals`. The `(.)` prefix is the same-level interceptor per Next
 * 16's intercepting-routes doc.
 */

import { notFound } from "next/navigation";

import { RentalDrawer, RentalDrawerShell } from "@/components/rentals";
import { getRentalDetail } from "@/lib/queries/rentals";

export default async function InterceptedRentalDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rentalId = Number.parseInt(id, 10);
  if (!Number.isFinite(rentalId) || rentalId <= 0) notFound();

  const rental = await getRentalDetail(rentalId);
  if (!rental) notFound();

  return (
    <RentalDrawerShell>
      <RentalDrawer rental={rental} />
    </RentalDrawerShell>
  );
}
