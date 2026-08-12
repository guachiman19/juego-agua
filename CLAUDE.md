# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Archivo de contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener actualizado tras cada cambio relevante.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma del producto y del proyecto: español.

## Estado actual: v2 (2026-08-05)

- v2 verificada en Chromium headless: 0 errores de consola, 58 fps vista general y 22-28 fps en primer plano con software rendering (en GPU real irá mucho mejor).
- Novedades v2: malla 256x256 (4x resolución), física visible del caudal (rizado y vetas por velocidad, lagos espejo, splash al pie de cascadas), puentes rojos auto-orientados al cauce, compuertas que bloquean el flujo (clic abre/cierra), bambú y arbustos, guardar/cargar a archivo JSON + autosave localStorage, deshacer (12 niveles, Ctrl+Z), warmup de simulación al cargar preset (el río ya fluye al abrir).
- Repo GitHub: `guachiman19/juego-agua` (rama `main`). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/. Producción: NO desplegada, requiere OK explícito de Jaime. Vercel MCP con token expirado y el item de 1Password "Vercel access token (chatbot)" está vacío.
- El PAT "GitHub API token for Claude" de 1Password NO tiene acceso a este repo (fine-grained restringido), los commits se hacen vía conector Composio GitHub. Verificar integridad con sha256 contra raw.githubusercontent tras cada push.
- index.html del repo referencia Three.js r128 desde cdnjs. Variante autocontenida (three.min.js de npm three@0.128.0 incrustado, ~650 KB) para entregas offline/artifacts.

## Arquitectura (todo en index.html)

- Grid 256x256 sobre mundo de 220x220. Arrays tipados: terrain, water, sed, flujos fL/fR/fT/fB, vX/vY, wet, spd, wVis, wTmp, gateH.
- Simulación: modelo de tuberías con DT=0.14, DAMP=0.985, clamp K por volumen, difusión 0.88/0.03, evaporación 0.9993, drenaje en bordes. Las compuertas suman gateH al terreno efectivo del cálculo de flujos. Erosión cada 2 substeps (dt doble), protegida cerca de manantiales (radio 6) y bajo compuertas.
- Render: normales por diferencias finitas (fastNormals, nada de computeVertexNormals), colores de terreno por franjas rotativas (1/8 por frame). Agua ShaderMaterial con atributos aCol/aAlpha/aSpd/aDir: amplitud de rizado según velocidad (lagos espejo, rápidos agitados), vetas de corriente advectadas en dirección del flujo, especular variable, gate de alpha para no brillar en celdas secas. Espuma/salpicaduras: Points con tamaño por partícula (máx 2000), spray en rápidos y splash radial al pie de cascadas (drop>3.5 detectado por vecino alto vertiendo).
- carveChannel: camina el descenso sobre terreno intacto y talla después (dos fases, evita atascarse en su propio pozo). carveTo: cauce garantizado entre dos puntos con meandro, lecho monótono 1.2 bajo el terreno local calculado en pasada previa (evita retroalimentación). bridgeFromPath coloca puente sobre el path con orientación del segmento.
- Presets: montaña (río desde cumbre + puente), valle (2 fuentes + puente), jardín (arroyo manantial->estanque + puente + bambú/arbustos/faroles/cerezos). Warmup 170 substeps (jardín 340) dentro de applyPreset.
- Estructuras: puentes y compuertas como THREE.Group individuales (no instanced), reposicionadas al terreno cada 12 frames. Compuerta: panel animado, rebuildGateField escribe muro de 9*t en gateH transversal al flujo. flowRotAt orienta según vX/vY local.
- Guardar: serializeGame JSON con Float32 en base64 (f32b64/b64f32), botón descarga archivo + localStorage autosave cada 25 s. Cargar: file picker (Shift+clic restaura autosave). Deshacer: pila de 12 snapshots (terrain + objetos + fuentes + estructuras), Ctrl+Z, se limpia al cambiar preset.
- Cámara orbital propia: target pegado al terreno, colisión con terreno, pan Shift, pinch, doble clic centra.

## Build y verificación (sesión Cowork)

- Fuentes en parts/: p1.html (HTML+CSS+núcleo+presets+carve), p2.js (escena/shaders/normales/colores), p3.js (objetos+estructuras+sim+espuma+guardado+undo), p4.js (cámara/entrada/UI/bucle). index.html = concatenación.
- verify.js: 3 capturas (montaña, zoom, jardín). verify2.js: compuerta sobre el río, serializeGame y undo.

## Convenciones del proyecto

- Staging primero, producción solo con OK explícito de Jaime.
- Vercel plan Hobby: agrupar cambios en un solo commit/push, no spamear deploys, si un deploy sale ERROR sin logs esperar 15-20 min.
- Mantener local + GitHub + staging sincronizados.
- Respuestas a Jaime: directas, con subtítulos y viñetas, estimación de tiempo antes de empezar, resumen y próximos pasos al final.

## Pendientes / ideas

- Reconectar Vercel (o guardar token válido en 1Password) si Jaime quiere staging/producción en Vercel.
- Ideas v3: ciclo día/noche, biomas pintables, peces/animales, más tipos de puente, compartir escenas por URL, modo foto.
