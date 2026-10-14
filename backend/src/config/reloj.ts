import type { Momento } from "../entities/momento";

export interface Reloj {
  ahora(): Momento;
}
