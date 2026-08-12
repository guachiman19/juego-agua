# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Archivo de contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener actualizado tras cada cambio relevante.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma: español.

## Estado actual: v3 (2026-08-12)

- v3 verificada en Chromium headless: 0 errores, 58 fps vista general (software rendering).
- v3 (calidad visual): agua con doble capa de ruido advectado en dirección del flujo (técnica flow ping-pong, sin moiré), espuma procedural en parches que viajan, color por absorción Beer según profundidad, orillas con degradado suave, lagos espejo vs rápidos agitados por velocidad. Terreno con detalle por píxel (onBeforeCompile con fbm en color_fragment). Pasto 3D instanciado (~5000 matas, re-sync al esculpir), pinos/rocas/arbustos auto-esparcidos por preset (autoFlora, van a objects y son borrables). Marcador de manantial discreto (gota, sin toro).
- v2: malla 256x256, física visible del caudal, puentes auto-orientados, compuertas (gateH), bambú/arbustos, guardar/cargar JSON + autosave, deshacer 12 niveles, warmup por preset.
- Repo: `guachiman19/juego-agua` (main). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/. Producción: NO desplegada, requiere OK de Jaime. Vercel sin conexión (token expirado, item 1Password vacío).
- Commits vía conector Composio GitHub (el PAT de 1Password no cubre este repo). MÉTODO EFICIENTE para actualizar index.html sin retranscribir: usar COMPOSIO_REMOTE_WORKBENCH: (1) descargar raw.githubusercontent del index actual y verificar sha256, (2) aplicar lista de reemplazos exactos old->new con assert count==1, (3) comparar sha256 contra el build local, (4) subir con run_composio_tool GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS desde el workbench. Verificado en v3.

## Arquitectura (todo en index.html)

- Grid 256x256, mundo 220x220. Arrays: terrain, water, sed, fL/fR/fT/fB, vX/vY, wet, spd, wVis, wTmp, gateH.
- Sim: modelo de tuberías DT=0.14 DAMP=0.985, difusión 0.88/0.03, evaporación 0.9993, drenaje en bordes, compuertas suman gateH al terreno efectivo. Erosión cada 2 substeps, protegida cerca de fuentes (r6) y compuertas.
- Render: normales por diferencias finitas (fastNormals), colores por franjas (1/8 por frame). Agua: ShaderMaterial con aDepth/aSpd/aDir, ruido GLSL h21/vn2/fbm2 (compartido en const GLSLN para el terreno). Espuma/splash: Points (máx 2000) con tamaño por partícula, splash radial si drop>3.5. Paredes diorama + skydome.
- carveChannel (descenso 2 fases) y carveTo (cauce garantizado, lecho monótono -1.2 bajo terreno local, 2 pasadas). bridgeFromPath coloca puentes sobre el path.
- Presets: montaña/valle/jardín con warmup 170/170/340 y autoFlora. Estructuras como THREE.Group, flowRotAt orienta según flujo.
- Guardar: serializeGame JSON base64 de Float32; cargar por file picker (Shift+clic = autosave local). Undo: 12 snapshots.
- Fuentes en parts/ (p1 html+núcleo, p2 render, p3 objetos+sim, p4 UI+bucle), build por concatenación, variante autocontenida con three.min.js inline (npm three@0.128.0). verify.js y verify2.js con Playwright.

## Convenciones

- Staging primero, producción solo con OK explícito de Jaime.
- Vercel Hobby: agrupar cambios en un commit, no spamear deploys, cooldown 15-20 min ante ERROR sin logs.
- Mantener local + GitHub + staging sincronizados (verificar sha256).
- Respuestas a Jaime: directas, subtítulos y viñetas, estimación de tiempo al inicio, resumen y próximos pasos al final.

## Pendientes / ideas

- Reconectar Vercel si Jaime quiere staging/producción ahí.
- Ideas v4: ciclo día/noche, peces/animales, biomas pintables, compartir escenas por URL, modo foto, sonido espacializado.
