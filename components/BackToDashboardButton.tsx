import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function BackToDashboardButton() {
  return (
    <Link href="/admin">
      <Button variant="outline" className="flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </Link>
  );
}
