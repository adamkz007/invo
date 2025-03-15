// Custom type declarations for local UI components
declare module '@/components/ui/textarea' {
  import React from 'react';
  export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
  const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
  export { Textarea };
}

declare module '@/components/ui/calendar' {
  import React from 'react';
  import { DayPicker } from 'react-day-picker';
  export type CalendarProps = React.ComponentProps<typeof DayPicker>;
  const Calendar: React.FC<CalendarProps>;
  export { Calendar };
}
