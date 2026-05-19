/**
 * Standalone rental detail — rendered when /rentals/[id] is hard-loaded
 * (cold visit, refresh, or shared link). Same data fetch as the
 * intercepted drawer but laid out inside the admin shell as a page.
 */

import { notFound } from "next/navigation";

import {
  RentalDrawer,
  StandaloneRentalDrawerPage,
} from "@/components/rentals";
import { getRentalDetail } from "@/lib/queries/rentals";

export default async function StandaloneRentalPage({
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
    <StandaloneRentalDrawerPage
      title={`Rental #${String(rental.id).padStart(5, "0")}`}
    >
      <RentalDrawer rental={rental} standalone />
    </StandaloneRentalDrawerPage>
  );
}
