# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Archivo de contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener actualizado tras cada cambio relevante.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma: español.

## Estado actual: v5 (2026-08-12, commit b0a946e)

- v5: ciclo día/noche (slider Hora 0-24 + checkbox ciclo automático ~150 s/día; applyDayTime mueve SUNDIR en arco, sol cálido en amanecer/atardecer, luna DirectionalLight azul, cielo con uniforms uNight/uWarm/uMoon: estrellas h21 y disco lunar, niebla y fogC del agua sincronizados, faroles con lampMesh MeshBasic cuya opacity sube de noche). Peces koi: InstancedMesh (cono+esfera+cola), spawnFish escanea celdas water>0.5, updateFish nada con ruido, evita orillas (gradiente), salta con splash (d>1.2), respawn periódico; se regeneran al cambiar mundo (no se serializan). Biomas pintables: Uint8Array biome (0 pradera, 1 arena, 2 musgo=jardín, 3 nieve), herramienta pincel bioma + 4 swatches, paletas BIO en colorRows, arena evapora 0.9975, pasto no crece en arena/nieve, serializado en save y en undo.
- v4: reflejo cubemap dinámico + modo foto (F). v3.1: bordes sin láminas, fbm rotado, partículas por distancia, taludes, slider Caudal. v3: agua advectada, detalle por píxel, pasto, autoFlora. v2: malla 256, puentes, compuertas, guardar, deshacer.
- Repo: `guachiman19/juego-agua` (main). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ sirviendo v5 verificado por hash. Producción: NO desplegada, requiere OK de Jaime. Vercel sin conexión.
- Commits vía Composio GitHub. MÉTODO de parches sin retranscribir (COMPOSIO_REMOTE_WORKBENCH: raw+sha256, reemplazos old->new assert count==1, sha256 vs build local, subir con run_composio_tool). Verificado en v3, v3.1, v4 y v5 (25 parches).

## Arquitectura (todo en index.html)

- Grid 256x256, mundo 220x220. Arrays: terrain, water, sed, fL/fR/fT/fB, vX/vY, wet, spd, wVis, wTmp, gateH, biome (Uint8).
- Sim: tuberías DT=0.14 DAMP=0.985, difusión, drenaje en bordes, gateH compuertas, evaporación por bioma. Erosión cada 2 substeps con tope de socavación, relaxSlopes cada 4.
- Render: fastNormals, colorRows por franjas con paletas BIO, agua ShaderMaterial aDepth/aSpd/aDir + uEnv, cielo día/noche, partículas 2000 con refinamiento por distancia. updateFish/lampMesh/grassMesh instanciados.
- Guardar: JSON base64 (terrain, water, biome, objetos, estructuras). Undo 12 con biome. Foto photoMode.
- Fuentes en parts/ (p1-p4), build por concatenación, variante autocontenida three.min.js inline. verify.js/2/3/4/5 con Playwright. OJO en Playwright: clicks que disparan applyPreset o photoMode hacerlos vía evaluate (bloquean >30 s en software rendering).

## Convenciones

- Staging primero, producción solo con OK explícito de Jaime.
- Vercel Hobby: agrupar cambios en un commit, cooldown 15-20 min ante ERROR sin logs.
- Mantener local + GitHub + staging sincronizados (sha256).
- Respuestas a Jaime: directas, subtítulos y viñetas, estimación al inicio, resumen y próximos pasos al final.

## Pendientes / ideas

- Reconectar Vercel si Jaime quiere staging/producción ahí.
- Ideas v6: compartir escenas por URL, sonido espacializado, aves/mariposas, luciérnagas nocturnas, más tipos de pez por bioma.
