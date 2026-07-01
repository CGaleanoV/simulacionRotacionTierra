# Simulador de la rotación de la orbita de la Tierra
Simulador interactivo en 3D de la órbita terrestre alrededor del Sol. Desarrollado con JavaScript y Three.js, implementa las leyes de Kepler, inclinación axial estricta y sincronización temporal física.

# Simulador de Órbita Terrestre 3D

Este proyecto es una aplicación web interactiva en 3D que simula la mecánica orbital de la Tierra alrededor del Sol de manera matemáticamente estricta. El simulador modela la traslación elíptica y la rotación diaria del planeta bajo una escala de tiempo física sincronizada.

## Características Principales

* **Física Kepleriana Real:** La órbita es una elipse con una excentricidad real de `0.0167`. La velocidad orbital varía dinámicamente según la Segunda Ley de Kepler (movimiento más rápido en el perihelio y más lento en el afelio).
* **Sincronización Temporal Estricta:** El simulador mantiene una proporción astronómica del 100% de realismo entre el día y el año. A velocidad `1x`, 1 día equivale a exactamente 1 segundo real de simulación, y un año completo toma exactamente 365.25 segundos.
* **Inclinación Axial Realista:** La Tierra cuenta con su inclinación fija de `23.5°` respecto a las estrellas de fondo durante toda su trayectoria orbital.
* **Control de Tiempo Integrado:** Incluye un control deslizante para acelerar la velocidad del tiempo (de 1x hasta 1000x) manteniendo la sincronía física entre días y meses.
* **Selector Bidireccional de Meses:** Permite al usuario saltar instantáneamente a la posición orbital de cualquier mes del año, y de igual manera actualiza de forma automática el mes en pantalla a medida que la Tierra avanza por la órbita.
* **Interfaz Científica y Minimalista:** Panel UI con telemetría en tiempo real que calcula la distancia y la velocidad orbital instantánea respecto al Sol.

## Tecnologías Utilizadas

* **HTML5** y **CSS3** para el diseño responsivo de la interfaz.
* **JavaScript (ES6+)** para la lógica matemática y física.
* **Three.js (v0.160.0)** para el renderizado del entorno gráfico 3D.
* **OrbitControls** para permitir la libre rotación, zoom y paneo de la cámara en el espacio.

## Instalación y Ejecución Local

1. Clona este repositorio en tu máquina local.
2. Asegúrate de incluir los archivos de textura correspondientes (`sol.jpg` y `tierra.jpg`) en el directorio raíz.
3. Debido a las políticas de seguridad de los navegadores modernos para la carga de texturas locales (CORS), se requiere ejecutar el proyecto a través de un servidor web local (por ejemplo, utilizando la extensión *Live Server* en Visual Studio Code).
