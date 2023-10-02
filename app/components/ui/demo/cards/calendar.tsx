import dayjs from "dayjs";

import { Calendar } from "@/components/ui/calendar.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

const start = dayjs(new Date(2023, 5, 5));

export function CardsCalendar() {
  return (
    <Card className="max-w-[260px]">
      <CardContent className="p-1">
        <Calendar
          numberOfMonths={1}
          mode="range"
          defaultMonth={start.toDate()}
          selected={{
            from: start.toDate(),
            to: start.add(8, "days").toDate(),
          }}
        />
      </CardContent>
    </Card>
  );
}
