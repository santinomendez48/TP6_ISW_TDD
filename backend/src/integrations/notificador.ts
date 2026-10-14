export interface Mail {
  destinatario: string;
  asunto: string;
  cuerpo: string;
}

export interface Notificador {
  enviar(mail: Mail): Promise<void>;
}
