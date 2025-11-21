export const filterOptions = (
  input: string,
  option: { children: string }
): boolean => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

export const handleKeyPress = (
  event: KeyboardEvent,
  customFunction: () => void
): void => {
  if (event.key === "Enter") {
    customFunction();
  }
};

export function formatNumberWithDecimal(
  number: number | null | undefined
): string {
  if (number !== null && number !== undefined) {
    const [integerPart, decimalPart] = String(number).split(".");

    const formattedIntegerPart =
      parseFloat(integerPart).toLocaleString("vi-VN");

    if (decimalPart === undefined || parseInt(decimalPart) === 0) {
      return formattedIntegerPart;
    }

    const formattedNumber = `${formattedIntegerPart},${decimalPart}`;

    return formattedNumber;
  }
  return "";
}

export function formatNumberWithDecimalUSD(
  number: number | null | undefined
): string {
  if (number !== null && number !== undefined) {
    const [integerPart, decimalPart] = String(number).split(".");

    const formattedIntegerPart =
      parseFloat(integerPart).toLocaleString("vi-VN");

    if (decimalPart === undefined || parseInt(decimalPart) === 0) {
      return formattedIntegerPart;
    }

    const truncatedDecimalPart = decimalPart.slice(0, 2);

    const formattedNumber = `${formattedIntegerPart},${truncatedDecimalPart}`;

    return formattedNumber;
  }
  return "";
}

export function formatNumberWithDecimalVND(
  number: number | null | undefined
): string {
  if (number !== null && number !== undefined) {
    const [integerPart] = String(number).split(".");

    const formattedIntegerPart =
      parseFloat(integerPart).toLocaleString("vi-VN");

    return formattedIntegerPart;
  }
  return "";
}

export function formatDateDMY(dateStr?: string | null) {
  if (!dateStr) return "-";

  // Detect if has time part
  const hasTime = /T|\d{2}:\d{2}/.test(dateStr);

  let [datePart, timePart] = dateStr.split(" ");

  // Case ISO 2025-11-21T13:00:00
  if (dateStr.includes("T")) {
    [datePart, timePart] = dateStr.split("T");
  }

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return "-";

  if (!hasTime) {
    return `${day}/${month}/${year}`;
  }

  // Handle time not adding timezone
  let hh = "00",
    mm = "00";

  if (timePart) {
    [hh, mm] = timePart.split(":");
  }

  return `${day}/${month}/${year} ${hh}:${mm}`;
}
