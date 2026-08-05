# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Archivo de contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener actualizado tras cada cambio relevante.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma del producto y del proyecto: español.

## Estado actual (2026-08-05)

- v1 funcional verificada en Chromium headless: sin errores de consola, 58 fps en vista general (software rendering).
- Repo GitHub: `guachiman19/juego-agua` (rama `main`). Staging: GitHub Pages desde main. Producción: NO desplegada, requiere OK explícito de Jaime. Vercel MCP con token expirado y el item de 1Password "Vercel access token (chatbot)" está vacío.
- El PAT "GitHub API token for Claude" de 1Password NO tiene acceso a este repo (fine-grained restringido), los commits se hacen vía conector Composio GitHub.
- index.html del repo referencia Three.js r128 desde cdnjs. Existe variante autocontenida (three.js incrustado, ~640 KB) generada para entregas offline/artifacts.

## Arquitectura (todo en index.html)

- Grid 128x128 sobre mundo de 220x220 unidades. Arrays tipados: terrain, water, sed, flujos fL/fR/fT/fB, velocidades vX/vY, wet, wVis.
- Simulación: modelo de tuberías (Mei et al.) con DT=0.14, DAMP=0.985, clamp K por volumen disponible, difusión ligera (0.88/0.03) contra oscilación en tablero, evaporación 0.9993, drenaje en bordes.
- Erosión: capacidad Kc=0.05 * velocidad * pendiente * min(d,1.5), erosión 0.045 (cap 0.018/paso), depósito 0.12, advección semi-lagrangiana de sedimento. Protegida cerca de manantiales (radio 3).
- Render: Three.js r128. Terreno MeshStandard con vertex colors (césped/roca/nieve>52/arena húmeda vía wet). Agua con ShaderMaterial custom (fresnel, especular, niebla manual, alpha por vértice). Trucos visuales: wVis (suavizado temporal + max vecinos*0.3), lift +0.12 y alpha mínima 0.5 con profundidad>0.025, velocidad suavizada para espuma. Espuma: Points con shader (máx 900). Paredes de diorama + caja inferior. Skydome con shader.
- Objetos: InstancedMesh por tipo (pino, cerezo, roca, farol) con geometrías fusionadas (mergeGeo). Las rocas hacen bump al terreno (rockBump). Manantiales con marcador esfera+anillo emisivos.
- Presets: genMontana/genValle/genJardin (fbm + gaussianas), carveChannel talla el cauce inicial por descenso más empinado desde cada manantial. Jardín trae decoración precolocada y erosión off.
- Cámara: orbital propia con damping, target pegado al terreno, colisión cámara-terreno, pan con Shift, pinch táctil básico, doble clic centra.
- UI en español: panel glass, 11 herramientas, sliders (pincel/intensidad/velocidad), toggles (erosión/lluvia/sonido), presets, pausa/vaciar/reiniciar. Sonido: ruido browniano filtrado según velocidad media del agua.

## Build y verificación (sesión Cowork)

- Fuentes en parts/: p1.html (HTML+CSS+UI+núcleo+presets), p2.js (escena/render), p3.js (objetos+simulación+espuma), p4.js (cámara/entrada/UI/bucle). index.html = concatenación p1+p2+p3+p4.
- Variante autocontenida: reemplazar la línea del CDN por three.min.js inline (npm three@0.128.0).
- Verificación: verify.js con Playwright (Chromium headless + swiftshader), capturas de montaña, zoom y jardín.

## Convenciones del proyecto

- Staging primero, producción solo con OK explícito de Jaime.
- Vercel plan Hobby: agrupar cambios en un solo commit/push, no spamear deploys, si un deploy sale ERROR sin logs esperar 15-20 min.
- Mantener local + GitHub + staging sincronizados.
- Respuestas a Jaime: directas, con subtítulos y viñetas, estimación de tiempo antes de empezar, resumen y próximos pasos al final.

## Pendientes / ideas

- Reconectar Vercel (o guardar token válido en 1Password) para staging/producción en Vercel cuando Jaime lo pida.
- Posibles mejoras: puentes y compuertas, ciclo día/noche, guardado de escenas (sin localStorage en artifacts), modo pintura de biomas, más partículas en cascadas, undo.
