export const FormaPago = {
  EFECTIVO: "EFECTIVO",
  TARJETA: "TARJETA",
} as const;

export type FormaPago = (typeof FormaPago)[keyof typeof FormaPago];
