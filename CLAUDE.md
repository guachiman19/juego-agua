# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Archivo de contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener actualizado tras cada cambio relevante.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma: español.

## Estado actual: v6 (2026-08-12, commit 9d5bef7)

- v6 (render GPU): el agua ya NO usa malla CPU por vértice. La sim sigue en 256x256 pero se empaqueta por frame en 2 DataTextures: texSurf (RG 16 bits = superficie terrain+depth, NEAREST, decodificada con filtrado bilineal manual en el vertex shader) y texFlow (RGBA8 LINEAR: depth/8, spd/10, vXn, vYn, filtrada por HW). Una malla estática de RW=512x512 (BufferGeometry manual con uv exactos, índices Uint32) se desplaza en el vertex shader (y=surf+0.04 si dep>0.006, si no surf-0.06: el pegado de bordes sale gratis porque surf es continuo), normales en vertex por forward diff de surfAt, y el fragment muestrea tFlow por píxel (depth con dithering h21 contra banding de 8 bits, spd, dir para la advección del ruido). Resultado: bordes de agua suaves sin facetas ni escalones a cualquier zoom, CPU liberada (sin fastNormals de agua ni uploads de atributos). updateWaterMesh() ahora solo empaqueta texturas.
- v6 también: geometrías de objetos suavizadas (icosaedros detail 2, conos/cilindros 8-12 segmentos, pez 10 seg). Peces solo en aguas calmadas (water>0.5 y spd<1.2).
- IMPORTANTE pregunta respondida: NO existe conector que mejore el render; la calidad visual se resuelve en el motor (shaders/mallas). Lovable u otros builders no aplican a este proyecto de un solo HTML con Three.js.
- v5: ciclo día/noche, peces, biomas. v4: reflejo cubemap + modo foto. v3.x: agua advectada, detalle por píxel, taludes, caudal. v2: malla 256, estructuras, guardar, deshacer.
- Repo: `guachiman19/juego-agua` (main). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ sirviendo v6 verificado por hash. Producción: NO desplegada, requiere OK de Jaime. Vercel sin conexión.
- MÉTODO de parches sin retranscribir (workbench Composio: raw+sha256, reemplazos exactos assert count==1, sha256 vs build local, subir). Verificado v3-v6 (34 parches en v6).

## Arquitectura (todo en index.html)

- Grid sim 256x256, mundo 220x220, malla agua RW 512. Arrays: terrain, water, sed, fL/fR/fT/fB, vX/vY, wet, spd, wVis, wTmp, gateH, biome, wDatS/wDatF.
- Sim: tuberías DT=0.14, difusión, gateH, evaporación por bioma, erosión con tope + relaxSlopes.
- Render: terreno 256 con fastNormals + detalle por píxel onBeforeCompile; agua GPU (ver v6); cielo día/noche; partículas 2000; instancias (pino/cerezo/roca/farol/bambu/arbusto/pasto/lamparas/peces).
- Guardar JSON base64 (terrain, water, biome, objetos, estructuras), undo 12, photoMode, applyDayTime.
- Fuentes en parts/ (p1-p4), build por concatenación, variante autocontenida three.min.js inline. verify*.js con Playwright: screenshots con timeout 150000 (la malla 512 tarda en software rendering la primera vez), clicks de preset/foto vía evaluate.

## Convenciones

- Staging primero, producción solo con OK explícito de Jaime.
- Mantener local + GitHub + staging sincronizados (sha256).
- Respuestas a Jaime: directas, subtítulos y viñetas, estimación al inicio, resumen y próximos pasos.

## Pendientes / ideas

- Reconectar Vercel si Jaime quiere staging/producción ahí.
- Ideas v7: terreno también con malla GPU densa, compartir escenas por URL, luciérnagas, aves, sonido espacializado.
