# PRÁCTICO 6 - TDD (Evaluable)

| | |
|---|---|
| **Unidad** | **Unidad Nro. 4: Aseguramiento de Calidad de Proceso y de Producto** |
| **Consigna** | Implementar una funcionalidad determinada utilizando el enfoque de *Desarrollo Conducido por Pruebas (TDD)*, en el lenguaje de programación elegido por el grupo, utilizando el enfoque Red-Green-Refactor para construir el código desde las pruebas. |
| **Objetivo** | Aplicar el enfoque TDD para diseñar y construir software a partir de pruebas automatizadas, poniendo en práctica buenas prácticas de diseño y desarrollo orientado a la calidad desde el inicio. |
| **Propósito** | Familiarizarse con el ciclo TDD (Red-Green-Refactor), incorporando buenas prácticas de diseño y testing, y fortaleciendo la disciplina del desarrollo guiado por pruebas como base para un código de calidad. |

## Entradas

- Conceptos teóricos sobre el tema desarrollados en clase.
- Bibliografía referenciada sobre el tema.
- Enunciado del Trabajo Práctico 2: EcoHarmony Park.
- Definición completa de las User Stories correspondientes al Trabajo Práctico 2 "Requerimientos Ágiles – User Stories y Estimaciones".
- Reglas de estilo de código seleccionadas por el grupo para el Trabajo Práctico 2.

## Salida

- Implementación funcional de la User Story asignada.
- Conjunto de pruebas automatizadas que cubren los distintos casos definidos.
- Documento que justifique las decisiones de diseño tomadas.

## Instrucciones

- Seleccionar una User Story a implementar de entre las siguientes opciones:
  - *Comprar entradas* **(grupos impares)**
  - *Inscribirme a actividad* **(grupos pares)**
- Utilizando el lenguaje y documento de estilos de código seleccionado para el Trabajo Práctico 2 "Requerimientos Ágiles – User Stories y Estimaciones", implementar la funcionalidad aplicando el ciclo TDD:
  - **Red:** Escribir una prueba que falle.
  - **Green:** Implementar el código mínimo para que pase.
  - **Refactor:** Mejorar el diseño del código sin romper las pruebas.

---

# EcoHarmony Park: Descripción del dominio

Los dueños del bioparque "EcoHarmony Park" están evaluando el desarrollo de una aplicación móvil (Android, iOS) ya que la cantidad de visitantes anuales aumentaron significativamente al igual que los avances tecnológicos. La misma tiene como objetivo mejorar la experiencia de los visitantes al proporcionar información útil y enriquecedora sobre las exhibiciones, los horarios de alimentación de los animales, los senderos para caminar y otros aspectos del parque como la autogestión al momento de realizar la compra de entradas.

Hemos tenido el privilegio de entablar una conversación con Miguel Rodríguez, uno de los propietarios de EcoHarmony Park, y a continuación, compartimos los detalles de la interacción:

**El Doce:** ¡Hola! Estoy aquí en el hermoso bioparque "EcoHarmony Park" con el Sr. Rodríguez, para hablar sobre una emocionante novedad: ¡una nueva aplicación móvil que mejorará la experiencia de los visitantes aquí en el parque! ¿Me podrías contar brevemente en qué consiste la aplicación?

**Miguel:** ¡Hola! Gracias por tomarte el tiempo para hablar conmigo. Estoy encantado de compartir más detalles sobre la idea de nuestra aplicación. En primer lugar, ofrecerá a los visitantes mapas interactivos que les ayudarán a explorar el parque de manera más eficiente. Asimismo, proporcionará información detallada sobre cada exhibición y horario de alimentación de cada especie que cuidamos. También se podrá autogestionar la compra de entradas al parque, pudiendo realizar directamente el pago a través de la pasarela de Mercado Pago, lo que permitirá agilizar el ingreso. Por último, los visitantes pueden inscribirse a las diferentes actividades diarias que posee el parque.

**El Doce:** ¡Wow! Qué interesante. ¿Podrías explicarme cómo puede un visitante acceder a los horarios de alimentación a través de la aplicación?

**Miguel:** ¡Claro! Una vez que descarguen la aplicación y la abran, encontrarán una sección dedicada a "Horarios de Alimentación disponibles". Cada horario estará detallado de manera clara, indicando la especie, nombre del animal, edad, hora programada, sector del parque (terrestres, acuáticos o aéreos) y cuidador encargado (nombre y apellido). Por otra parte, aquellos que estén próximos a comenzar (faltando una hora) los mostraremos con un mensaje que diga: ¡Apúrate que ya comienza! Es importante considerar que los horarios se mostrarán en orden, comenzando con los más próximos a la fecha actual y extendiéndose hasta una semana en el futuro. Para que sea más amigable la interfaz pensamos en proporcionar la posibilidad de filtrar por la fecha en la que el visitante estará en el parque y que se visualicen únicamente los horarios correspondientes a la misma. Además, en una versión posterior, los visitantes podrán configurar notificaciones para recibir recordatorios de los horarios de alimentación que deseen seguir de cerca.

**El Doce:** ¡Eso suena muy útil! ¡Al igual que el mapa interactivo! ¿Podrías comentarme cuáles serán los elementos y características del parque que estarán disponibles para visualizar en él? ¿Qué acciones podrán llevar a cabo los visitantes a través de esta herramienta?

**Miguel:** Este mapa ofrece una vista panorámica de todo el parque, dividido en sectores diferenciados por colores. Asimismo, el mapa contiene íconos informativos: "Inodoro" para identificar los baños distribuidos en el parque, una "Bolsa" para indicar los puntos de venta, y un "Micrófono" para el show especial del día. Los visitantes pueden hacer click en este último ícono para obtener el nombre del show y su horario, en caso de que haya un show programado. En una futura mejora pensamos incluir en este mapa la ubicación del visitante en tiempo real.

**El Doce:** Para alguien como yo, con un sentido de la orientación no muy desarrollado, suena como una herramienta imprescindible, ¡jaja! ¿Hay otros aspectos del parque que también planean ofrecer a través de la aplicación? Habías mencionado la inscripción a las actividades, ¿no es cierto?

**Miguel:** ¡Sí! Me estaba olvidando de comentarlo. El parque ofrece la posibilidad de realizar actividades de una hora sumamente enriquecedoras para los visitantes, entre las que se encuentran "Tirolesa", "Safari", "Palestra" y "Jardinería". Para poder realizar la inscripción deben seleccionar del conjunto de actividades la que desean realizar, eligiendo en primer lugar el horario y completando luego los datos del visitante: nombre, DNI, edad y talla de vestimenta si la actividad lo demanda. Finalmente, para concluir el proceso de inscripción, pedimos a los visitantes que acepten los términos y condiciones específicos de la actividad en la que participarán, enviando el resumen de la inscripción con un QR al mail del visitante. Nos interesa gestionar la inscripción de las actividades porque tienen cupos limitados y es muy útil para planificarlas con anterioridad según los inscriptos que tengamos.

**El Doce:** Para finalizar esta pequeña entrevista, ¿podrías explicarme el proceso de compra de entradas a través de la app?

**Miguel:** ¡Pero claro! Para realizar la compra de entradas el visitante debe registrarse en la aplicación, ingresando un mail y una contraseña. A continuación, debe ingresar a la sección "Comprar entradas" y allí indicar la fecha de visita deseada, la cantidad de entradas requeridas (que no puede superar las 10) y la edad de cada visitante. Finalmente, el sistema mostrará el monto total y se debe seleccionar la forma de pago: efectivo en caso de querer pagar en boletería o con tarjeta, donde se redirigirá al usuario a la página de Mercado Pago para completar el proceso de forma segura. Finalmente, recibirán un mensaje de confirmación vía mail y sus entradas serán verificadas al momento de ingresar al parque. La posibilidad de comprar las entradas mediante la aplicación nos parece fundamental para comenzar a probar la recepción de la aplicación, incluyendo el pago electrónico ya que creemos que será el más usado.

**El Doce:** ¡Muy claro! Parece que la aplicación requiere mucha atención. ¿Tienen previsto contratar personal adicional para mantener actualizados los horarios, las actividades y todo lo que implica?

**Miguel:** No, no hay problema en ese aspecto. Planeamos gestionar esa tarea por fuera de la aplicación, a través de nuestro equipo de administradores, que se encargará de mantener todo actualizado.

**El Doce:** Ah, entiendo. ¡Gracias por compartir todos estos emocionantes detalles! Más adelante coordinamos otra nota para ver esta aplicación en funcionamiento.

---

# ECO HARMONY PARK

Esto es una guía de respuestas a preguntas frecuentes que surgen de aclarar el dominio con lxs PO. Hay preguntas que corresponden para ambas users y otras para una user en específico! Leer bien cada caso.

En caso de tener una consulta fuera de este compendio, se admiten consultas al equipo docente correspondiente a SU comisión.

### 1- ¿Qué días abre el parque?
Todos los días, menos:
- Lunes.
- Días festivos: 25 de diciembre y 1 de enero.

### 2- ¿Qué se debe mostrar cuando la fecha seleccionada corresponde a un día en que el parque está cerrado?
Si el campo es un calendar, debería marcar el día como deshabilitado, o no dejar seleccionarlo.

### 3- ¿Qué paleta de colores y fuente usar?
- Paleta: https://coolors.co/palette/386641-6a994e-a7c957-f2e8cf-bc4749

  | Color | Nombre | Hex |
  |---|---|---|
  | 🟩 | Hunter Green | `#386641` |
  | 🟩 | Sage Green | `#6A994E` |
  | 🟩 | Yellow Green | `#A7C957` |
  | ⬜ | Champagne Mist | `#F2E8CF` |
  | 🟥 | Blushed Brick | `#BC4749` |

- Fuente: Lato

### 4- Al redirigir hacia Mercado Pago, ¿podemos simularlo mostrando una pantalla que diga por ejemplo: "Mercado Pago Compra Exitosa"?
- Desarrollo.

### 5- Al enviar mail, ¿podemos simularlo mostrando un modal que diga por ejemplo: "Mail enviado a tu@email.com"?
- Desarrollo.

### 6- Precio entradas
- VIP: $20.000.
- Común: $10.000.

### 7- Descuentos por edad
- Menores o iguales a 3 años: No pagan.
- Menores o iguales a 15 años: 50% off.
- Mayores o iguales a 60 años: 50% off.

### 8- Visibilidad de cupos
- El user puede ver cupos disponibles.

### 9- Actividades que requieren vestimenta
- Palestra.
- Tirolesa.

### 11- Horario Parque
- De 8:30 a 19.

### 12- Horario Actividades
- De 9 a 18, 1 turno por hora. A las 18:00 no hay turno, es la cota superior.

### 13- Cupos x actividad
- Safari: 8
- Palestra: 12
- Jardinería: 12
- Tirolesa: 10

### 14- Talles
- XS
- S
- M
- L
- XL
- XXL

### 15- Límite de edad x actividad
- Jardinería y Safari: Todas las edades.
- Palestra: 12 o más.
- Tirolesa: 8 o más.

### 16- Términos y condiciones
- Uno diferente por cada actividad. Lo tienen que diseñar y mandar para su validación.

### 17- Logo
- Tienen que diseñarlo y mandarlo para su validación.

### 18- ¿Qué información debe incluir el mail de confirmación (INSCRIBIRME A ACTIVIDAD)? (número de orden, detalle de visitantes, QR de acceso)
Esa información, más los subtotales y el total.

### 19- El registro/login del usuario, ¿es parte de esta US o lo asumimos como que el usuario ya está logueado cuando compra?
No hace falta, pueden comenzar con la sesión y el usuario mockeados.

### 20- ¿Hay un cupo máximo de visitantes por día? ¿O no hay límite?
No hay máximo de visitantes por día.

### 21- ¿Diferencia entre pase VIP y regular?
Para esta US, solo el precio.

### 22- ¿Pueden agregar el nombre de la persona de la actividad?
Sí, pero opcional.

### 23- ¿Hasta cuándo se puede inscribir (anticipación respecto al turno)?
Se puede reservar dentro de las 24 hs antes del turno. Esto quiere decir que no se pueden inscribir a una actividad del viernes, por ejemplo, siendo martes.

### 24- ¿Tiene que estar adaptada para celulares necesariamente (responsive), o alcanza con que funcione en computadora?
Se pide una app mobile. Pueden hacerla web responsive.

### 25- Horizonte de compra: ¿Hasta cuántos días en adelante se puede seleccionar una fecha de visita en el calendario?
Se pueden comprar las entradas con no más de un mes de anticipación.

### 26- Límite horario de compra: ¿Hasta qué hora del día actual se permite realizar la compra de una entrada para el mismo día?
Hasta 1 hora y media antes del cierre, es decir: hasta las 17:30.

### 27- Validación de cantidad máxima
En la descripción del dominio se menciona que el límite por compra es de hasta 10 entradas (lo cual coincide con los criterios de aceptación), pero es necesario definir si esta regla aplica por usuario logueado por día o únicamente por transacción individual.

Solo puede comprar 10 entradas para una fecha específica, ya sea en una o varias transacciones.

### 28- Info del mail de actividad
Resumen de la inscripción y los QR.

### 29- ¿Puede una persona reservar actividades diferentes que ocurren al mismo tiempo?
No, se debe validar que esa persona no tenga inscripciones en otros turnos del mismo horario.

### 30- ¿Existe una ventana límite de tiempo previa al inicio de la actividad para poder inscribirse (por ejemplo, cierre de cupos 30 minutos antes del inicio)?
Sí, de 15 minutos antes del inicio del turno.

### 31- ¿Existe una cantidad máxima de personas que un titular puede inscribir en una misma transacción?
No, mientras tenga cupo para la actividad en ese horario puede inscribir la cantidad que desee.

### 32- La historia solicita "DNI". Dado que el parque puede recibir turistas extranjeros, ¿se debe ampliar a un campo más genérico como "Documento / Pasaporte" que admita formatos alfanuméricos?
Solo DNI.

---

## User Story: Comprar entradas (Estimación: 8)

**COMO** visitante **QUIERO** comprar una entrada **PARA** asegurar mi visita al parque.

### Criterios de Aceptación
- Debe indicar la fecha de visita deseada, la cantidad de entradas requeridas, la edad de cada visitante y tipo de pase (VIP o regular).
- La fecha de visita guiada puede ser del día actual o futuro.
- Debe enviar un mensaje de confirmación vía mail.
- Debe redirigir a Mercado Pago al confirmar la compra si el pago es con tarjeta de crédito.
- La fecha de la visita debe estar dentro de los días en que el parque está abierto.
- Debe seleccionar la forma de pago: efectivo en caso de querer pagar en boletería o con tarjeta.
- La cantidad de entradas requeridas no debe ser mayor a 10.
- Al finalizar la compra se debe informar la cantidad de entradas compradas y la fecha.
- Se debe permitir la compra de entradas solo a usuarios registrados.

### Pruebas de usuario
- Probar comprar una entrada indicando la fecha de visita dentro de los días disponibles, una cantidad de entradas menor a 10, la edad de todos los visitantes, el tipo de pase, la forma de pago con tarjeta mediante Mercado Pago y recepción del mail de confirmación **(pasa)**.
- Probar comprar entradas sin seleccionar forma de pago **(falla)**.
- Probar comprar entradas ingresando una fecha de visita en la cual el parque se encuentra cerrado **(falla)**.
- Probar comprar entradas ingresando una cantidad de entradas mayor a 10 **(falla)**.
