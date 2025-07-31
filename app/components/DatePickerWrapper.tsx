'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerWrapperProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  dateFormat?: string;
  placeholderText?: string;
  isClearable?: boolean;
  filterDate?: (date: Date) => boolean;
  className?: string;
  id?: string;
  showMonthYearPicker?: boolean;
  showYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  scrollableYearDropdown?: boolean;
  popperClassName?: string;
  wrapperClassName?: string;
}

const DatePickerWrapper: React.FC<DatePickerWrapperProps> = (props) => {
  return <DatePicker {...props} />;
};

export default DatePickerWrapper;
