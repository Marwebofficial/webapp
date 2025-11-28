
'use client';

import { Megaphone } from 'lucide-react';

export function HoursBanner() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex overflow-x-hidden items-center h-10">
          <div className="animate-marquee whitespace-nowrap flex items-center w-[200%]">
            <div className="flex w-1/2 justify-around items-center">
              <Megaphone className="w-5 h-5 mr-4 flex-shrink-0" />
              <span className="text-sm font-medium mx-4">
                Important Notice: Our services are active on weekdays from 9am - 8pm and on weekends (Sat & Sun) from 12pm - 6pm. Transactions outside these hours will be processed on the next active day.
              </span>
            </div>
            <div className="flex w-1/2 justify-around items-center">
              <Megaphone className="w-5 h-5 mr-4 flex-shrink-0" />
              <span className="text-sm font-medium mx-4">
                Important Notice: Our services are active on weekdays from 9am - 8pm and on weekends (Sat & Sun) from 12pm - 6pm. Transactions outside these hours will be processed on the next active day.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
