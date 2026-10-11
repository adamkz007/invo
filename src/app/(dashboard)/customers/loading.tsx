import { CustomersPageSkeleton } from '@/components/ui/page-skeletons';

export default function Loading() {
  return (
    <div className="invo-loading-delay">
      <CustomersPageSkeleton />
    </div>
  );
}
