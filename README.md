# 💧 Nacimiento · Juego de agua 3D

Simulador interactivo de flujos de agua en 3D. Un manantial nace en la cima de una montaña y la corriente cae por gravedad, erosionando el terreno y formando ríos, cascadas, lagos o jardines japoneses en miniatura.

## Jugar

Abrir `index.html` en cualquier navegador moderno. Sin dependencias de build, es un único archivo HTML con Three.js.

## Características

- Simulación de agua en tiempo real (modelo de tuberías / shallow water) sobre malla de 128x128
- Erosión hidráulica: el agua transporta sedimento y transforma la montaña en valles y mesetas
- Herramientas de esculpido: elevar, excavar, aplanar (mesetas), suavizar
- Manantiales colocables con caudal ajustable
- Objetos que alteran el flujo: rocas (desvían la corriente), pinos, cerezos, faroles de piedra
- 3 escenarios: Montaña, Valle y Jardín zen
- Zoom continuo desde vista aérea hasta microambientes (arroyos y jardines diminutos)
- Lluvia, sonido de agua procedural, espuma en cascadas, nieve en cumbres

## Controles

- Clic izquierdo: aplicar herramienta seleccionada
- Clic derecho: orbitar cámara
- Rueda: zoom
- Shift + arrastrar: desplazar
- Doble clic: centrar y acercar

## Stack

Three.js r128, JavaScript vanilla, un solo archivo. Sin backend.
