# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener al día tras cada cambio.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma: español.

## Estado actual: v7 (2026-08-26, commit f4dbec8)

- v7 (calidad cinematográfica, todo dentro de Three.js r128, SIN migrar de versión):
  - **Reflexión planar real**: se eliminó el cubemap. `renderWaterPasses()` calcula el nivel dominante del agua (centro de masa, `waterLevelNow()`), espeja la cámara sobre ese plano con la matemática de THREE.Reflector (view/lookAt reflejados, `up` reflejado, projectionMatrix copiada) y renderiza a `reflRT` (media resolución). El shader muestrea con `texture2DProj(uRefl, vRefl)` usando `uTexMat` = biasMatrix * proj * viewInverse. Fuera del plano dominante (río en ladera) se mezcla a `fogC` según `abs(vSurf-uLevel)`, así no aparecen reflejos falsos. Reflexión cada 2 frames (`frame&1`), `forceRefl` la fuerza en el modo foto.
  - **Refracción**: la escena sin agua se renderiza a `refrRT` desde la cámara principal y el shader la muestrea en espacio de pantalla (`vClip`) con offset por la normal, atenuado por distancia. Absorción Beer sobre ese color. El alfa del agua subió (`smoothstep(.008,.085,dep)`) porque ahora el fondo lo aporta la refracción, no el blending.
  - **Cáusticas**: en el shader del TERRENO (onBeforeCompile) se muestrea `tFlow` con `vWP.xz/220+.5`; donde hay agua se tinta el lecho de azul-verde y se suman dos capas de fbm2 desfasadas cuyo cruce (`1-abs(c1-c2)`) dibuja las líneas de luz. Uniforms nuevos: `tFlow`, `uTime` (actualizado en el bucle), `uCaus` (=dayF, apagadas de noche). `terrainShader` guarda la referencia.
  - **Postprocesado propio** (sin EffectComposer): `setupPost()` crea `sceneRT` + `bloomA/bloomB` a 1/4, quad fullscreen y 3 materiales (bright-pass umbral .86, blur separable 5 taps, composite). `renderFrame()` encadena escena -> bright -> blurH -> blurV -> composite. El tone mapping ACES (Narkowicz) y la saturación 1.16 se aplican SOLO en el composite, no con `renderer.toneMapping`, para que agua, cielo y espuma (ShaderMaterial crudo) reciban el mismo tratamiento que los materiales estándar. `uExp` sube de noche.
  - Coste: 3 renders de escena por frame (refracción media res, reflexión media res cada 2 frames, escena a RT) + 3 pases baratos. En el sandbox por software 25-58 fps; en GPU real sobrado.
- v6: agua desplazada en GPU (malla RW=512 + texSurf/texFlow). v5: día/noche, peces, biomas. v4: cubemap + modo foto. v3.x: agua advectada, detalle por píxel. v2: malla 256, estructuras, guardar, deshacer.
- Repo: `guachiman19/juego-agua` (main). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ sirviendo v7 verificado por hash. Producción: NO desplegada, requiere OK de Jaime. Vercel sin conexión.
- **Conectores**: se verificó el registro (Unity, Unreal, Godot, PlayCanvas, Babylon): NO existe conector de motores 3D y no aplica ninguno. La calidad visual se resuelve en shaders. Unity exigiría reescribir en C# y su agua HDRP no exporta a WebGL. Respondido a Jaime en v6 y v7.

## Método de publicación (importante, ahorra mucho token)

COMPOSIO_REMOTE_WORKBENCH: (1) descargar el raw de GitHub y verificar sha256 de partida, (2) aplicar cambios, (3) verificar sha256 contra el build local, (4) subir con run_composio_tool. Desde v7 se usa **splice por líneas**: local se calcula `difflib.SequenceMatcher` entre el remoto y el nuevo y se envía solo `[[i1,i2,[lineas nuevas]],...]` (la mitad de tokens que enviar pares old/new). Se aplican en orden inverso.

## Arquitectura (todo en index.html)

- Sim 256x256, mundo 220x220, malla de agua 512. Arrays: terrain, water, sed, fL/fR/fT/fB, vX/vY, wet, spd, wVis, wTmp, gateH, biome, wDatS/wDatF.
- Sim: modelo de tuberías DT=0.14, difusión, gateH de compuertas, evaporación por bioma, erosión con tope + relaxSlopes.
- Render: terreno con fastNormals + detalle por píxel + cáusticas; agua GPU con reflexión/refracción; cielo día/noche; partículas 2000; instancias (pino/cerezo/roca/farol/bambu/arbusto/pasto/lámparas/peces).
- Guardar JSON base64 (terrain, water, biome, objetos, estructuras), undo 12, photoMode 2x, applyDayTime.
- Fuentes en parts/ (p1-p4) + build por concatenación; variante autocontenida con three.min.js inline. verify*.js con Playwright: screenshots con timeout 150000-200000, clicks de preset/foto vía evaluate. Para probar el reflejo: inundar plano (`water[k]=max(0,14-terrain[k])`) y mirar rasante.

## Convenciones

- Staging primero, producción solo con OK explícito de Jaime.
- Mantener local + GitHub + staging sincronizados (sha256).
- Respuestas a Jaime: directas, subtítulos y viñetas, estimación al inicio, resumen y próximos pasos.

## Pendientes / ideas

- Reconectar Vercel si Jaime lo pide.
- Ideas v8: ajuste de calidad automático por fps, sombras del agua sobre el terreno, compartir escenas por URL, luciérnagas, aves, sonido espacializado.
