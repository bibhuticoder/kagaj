/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module 'ad-bs-converter' {
  export interface BSDateDetails {
    year: string;
    month: string;
    day: string;
    strMonth: string;
    strShortMonth: string;
    dayOfWeek: string;
    strDayOfWeek: string;
    strShortDayOfWeek: string;
    strMinDayOfWeek: string;
    totalDaysInMonth: string;
  }

  export interface ConversionResult {
    ne: BSDateDetails;
    en: {
      year: number;
      month: number;
      day: number;
      strMonth: string;
      strShortMonth: string;
      dayOfWeek: number;
      strDayOfWeek: string;
      strShortDayOfWeek: string;
      strMinDayOfWeek: string;
      totalDaysInMonth: number;
    };
  }

  export function ad2bs(adDateStr: string): ConversionResult;
  export function bs2ad(bsDateStr: string): unknown;
}

declare module 'textarea-caret' {
  export interface CaretCoordinates {
    top: number;
    left: number;
    height: number;
  }

  export default function getCaretCoordinates(
    element: HTMLElement,
    position: number,
    options?: { debug?: boolean }
  ): CaretCoordinates;
}
