# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Archivo de contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener actualizado tras cada cambio relevante.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma: español.

## Estado actual: v4 (2026-08-12, commit 2dc4019)

- v4: reflejo dinámico del entorno en el agua vía CubeCamera (WebGLCubeRenderTarget 128, update cada 40 frames, posicionada en el centro de masa del agua profunda, excluye agua/espuma/marcadores al capturar; el fragment muestrea uEnv con reflect y mezcla por fresnel, nítido en calma y difuminado a cielo en rápidos). Modo foto: botón 📷 y tecla F, render a 2x (cap 4096), toDataURL a Blob y descarga PNG sin UI, con updateEnvMap previo.
- v3.1: vértices secos del borde pegados a la superficie vecina (sin láminas), fbm rotado sin patrón de rejilla, partículas más finas y numerosas a <70 de la cámara, borboteo en manantiales, tope de socavación (-2.5 vs promedio vecinos) y relaxSlopes cada 4 ticks (derrumbe >3.2/celda), slider Caudal (P.flow x0.2-x3.0 multiplica todos los rates).
- v3: agua advectada flow ping-pong, espuma procedural viajera, absorción Beer, terreno con detalle por píxel (onBeforeCompile), pasto 3D (~5000), autoFlora por preset. v2: malla 256, puentes, compuertas (gateH), guardar/cargar, deshacer, warmup.
- Repo: `guachiman19/juego-agua` (main). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ sirviendo v4 verificado por hash. Producción: NO desplegada, requiere OK de Jaime. Vercel sin conexión (token expirado, item 1Password vacío).
- Commits vía Composio GitHub. MÉTODO para actualizar index.html sin retranscribir: COMPOSIO_REMOTE_WORKBENCH: descargar raw + sha256, aplicar reemplazos exactos old->new con assert count==1, comparar sha256 contra build local, subir con run_composio_tool. Verificado en v3, v3.1 y v4.

## Arquitectura (todo en index.html)

- Grid 256x256, mundo 220x220. Arrays: terrain, water, sed, fL/fR/fT/fB, vX/vY, wet, spd, wVis, wTmp, gateH.
- Sim: tuberías DT=0.14 DAMP=0.985, difusión 0.88/0.03, drenaje en bordes, gateH de compuertas. Erosión cada 2 substeps con tope de socavación, protegida cerca de fuentes (r6) y compuertas. relaxSlopes cada 4.
- Render: fastNormals por diferencias finitas, colores por franjas. Agua: ShaderMaterial aDepth/aSpd/aDir + uEnv cubemap, ruido GLSL rotado (GLSLN compartido con el terreno). Partículas Points (2000) con tamaño por partícula y refinamiento por distancia de cámara. Paredes diorama + skydome.
- carveChannel/carveTo/bridgeFromPath. Presets con warmup 170/170/340 y autoFlora. Estructuras THREE.Group.
- Guardar: JSON base64, Shift+clic Cargar = autosave local. Undo 12. Foto: photoMode() en p4.
- Fuentes en parts/ (p1 html+núcleo, p2 render, p3 objetos+sim, p4 UI+bucle). Variante autocontenida: three.min.js inline (npm three@0.128.0). verify.js/2/3/4 con Playwright (v4 prueba descarga de foto con waitForEvent download y click no bloqueante por el coste del render 2x en software).

## Convenciones

- Staging primero, producción solo con OK explícito de Jaime.
- Vercel Hobby: agrupar cambios en un commit, cooldown 15-20 min ante ERROR sin logs.
- Mantener local + GitHub + staging sincronizados (sha256).
- Respuestas a Jaime: directas, subtítulos y viñetas, estimación al inicio, resumen y próximos pasos al final.

## Pendientes / ideas

- Reconectar Vercel si Jaime quiere staging/producción ahí.
- Ideas v5: ciclo día/noche, peces/animales, biomas pintables, compartir escenas por URL, sonido espacializado.
