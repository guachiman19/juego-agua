# CLAUDE.md · Memoria compartida del proyecto "Juego Agua"

Contexto para Claude Chat, Claude Code, Claude Cowork y Claude for Chrome. Mantener al día tras cada cambio.

## Qué es

"Nacimiento": juego 3D en un solo archivo HTML (`index.html`) que simula flujos de agua desde un manantial en la cima de una montaña. El agua erosiona el terreno y forma ríos, cascadas, lagos y jardines japoneses. Proyecto de Jaime (jaimedorado@gmail.com). Idioma: español.

## Estado actual: v11 (2026-09-01, commit 09c7e1f)

- v11 (acueductos + manantial SIEMPRE, pedido de Jaime en dos mensajes):
  - MANANTIAL GARANTIZADO: al confirmar un canal se crea manantial rate 14 en el inicio salvo que ya haya una FUENTE a <14u. Se elimino la exencion por "agua cercana": no garantizaba alimentacion (screenshot de Jaime con canal en S seco).
  - ACUEDUCTOS: los tramos del trazo que cruzan agua existente (wet3>0.15 en 3x3, muestras 3..len-4, largo 2..70) NO se excavan: se registra un duct {ai,aj,bi,bj,ya,yb,yv,w} y en simStep un conducto mueve agua entry->exit por diferencia de superficie (q=min(wa*.5,(sa-sb)*.35)). La sim es un heightfield: agua sobre agua no existe, el conducto es teleporte + puente visual (rebuildDucts: tablero de piedra MAT_STONE con muros, franja de agua MAT_DWATER y pilares hasta el suelo; altura visual yv=max(media lechos, superficie del rio+1.05) porque con la altura real de los lechos el tablero queda enterrado).
  - PROTECCION POR CELDA: celdas con water>0.12 dentro del radio R de cualquier muestra saltada son INTOCABLES para todo el excavado (prot Uint8Array). Aprendizajes: ventana por muestras no sirve (los discos de radio hw de las muestras de orilla alcanzan el lecho del rio y lo capturan); y quitar muros cerca del cruce hace que el canal se derrame antes de entrar al puente. Con prot por celda: rio con lecho intacto (21.87 antes y despues), entrega del canal al otro lado 5-6/6, save/load/undo conservan ducts.
  - OJO métrica: tras ~2200 pasos el rio MIGRA por erosion; una sonda en linea recta da 0 incluso SIN canal. Usar disco amplio aguas abajo (control 40 celdas mojadas vs 25 con acueducto: rio vivo).
- v10.4 (el agua por fin RECORRE los canales, tercer feedback de Jaime): tres causas raiz encontradas con perfiles numericos:
  1) AZOLVE: la toma desde un rio se tapaba sola (el sedimento se deposita donde el flujo se frena; el terreno subio +1.4u en la toma en 1200 pasos). Fix: mascara `hard` (Uint8Array NN) marcada por el canal; en erode() las celdas hard ni erosionan NI reciben deposito (sed[k]*=.85 pasa de largo), y relaxSlopes() no derrumba pares con hard. hard va en save (opcional, tolerante), en undo y se limpia en applyPreset.
  2) MUROS QUE SELLABAN: el anillo de muro tapaba la entrada, la salida y los cruces con rios. Fix: celdas con water>0.12 nunca se levantan (bed solo corta, muro/talud solo bajan), y rampas de entrada/salida que SOLO excavan (radio hw, largo bw+3.2, entrada sube .30/u hacia atras, salida baja .30/u) conectan el canal con lo que haya. En cruces el canal CAPTURA el rio (fisica correcta).
  3) MANANTIAL AUSENTE: "agua a <5u" impedia el manantial aunque esa agua no alimentara. Ahora solo se omite si el trazo EMPIEZA dentro del agua (radio 1.2u) o hay fuente a <14u; rate 14.
  Ademas: evaporacion casi nula en celdas hard (0.99985 vs 0.9993) para que las acequias largas no se adelgacen.
  Verificado: toma desde rio 22/22 puntos mojados a 2500 pasos (umbral visual 0.012); espiral 2.5 vueltas 50/66 y 0 fugas a 4000 pasos; el perfil de la toma quedo estable (sin azolve). OJO en pruebas: usar umbral 0.012 (= lo que el render muestra), 0.05 lee "seco" corrientes finas visibles.
- v10.3 (fix clave del canal, feedback con screenshot de espiral): en ladera empinada el canal excavado con solo min() quedaba abierto por el lado de bajada y el agua se derramaba monte abajo sin usar el trazo. Ahora la seccion es de ACEQUIA con asignacion EXACTA de terreno: lecho parabolico (=h+pow(d/hw,1.9)*depth*.30, excava Y RELLENA para dar piso solido), anillo de muro a bankTop=h+depth*.92 (levanta el lado de bajada, rebanca el de subida) y transicion lerp al terreno natural (bw=max(1.7,hw*.42), R=hw+bw+2.4). Verificado con espiral de 2.5 vueltas alrededor del cono: 60/66 puntos mojados y 0 fugas a 7u ladera abajo tras 900 simStep.
- v10.2 (ajustes por feedback de Jaime): canales mas profundos (depth=1.8+strength*3.4, corte minimo .72*depth, lecho pow 1.9 con amplitud .38: mas seccion util), manantial automatico rate 10 (igual a uno manual por defecto) y cebado a 1.0; los botones/flechas arriba-abajo ya NO inclinan (pitch) sino que mueven la camara en Y puro via camG.hOff (clamp -24..150) sumado en camApply a la altura objetivo; H/Vista inicial resetea hOff. El pitch queda solo en el arrastre del raton.
- v10 (controles manuales + herramienta Canal):
  - Pad de cámara fijo abajo a la derecha (`#campad`): girar izq/der, subir/bajar (pitch), acercar/alejar y "Vista inicial". Mantener presionado = movimiento continuo (`camHold` aplicado en el bucle con `applyCamHold(min(dtRaw,.12))`); pointer capture y pointercancel para no quedarse pegado. Teclado: flechas, +/-, H (guard: no roba teclas cuando el foco está en un INPUT). El pad se oculta en modo foto.
  - Herramienta "Canal" (botón 〰️): se dibuja una línea libre sobre el terreno (preview THREE.Line cian, depthTest off); al soltar, `commitCanal()` remuestrea el trazo cada .9 celdas y excava un lecho parabólico con perfil MONÓTONAMENTE descendente: h=min(h-slope*paso, tH0[s]-depth*.55). Pincel=ancho (hw=brush*.30 clamp 1.8-7), Intensidad=profundidad (1.1+strength*2.4), slope .055. Si el trazo sube una loma, corta más hondo para que el agua siga fluyendo.
  - BUG evitado (importante): el perfil debe calcularse con las alturas de ANTES de excavar (`tH0` precalculado). Releer terrainHeightAt durante la excavación retroalimenta (cada muestra ve el corte de la anterior) y cava cañones de 60 unidades.
  - Undo integrado (pushUndo al confirmar), syncGrass tras excavar, hint explica conectar un río o poner manantial.
  - v10.1: tras excavar, si no hay fuente a <14u NI agua (>0.25) en radio 5u del inicio, se crea un manantial pequeño {rate:4.5} en el inicio (marcador incluido, se quita con la herramienta Manantial), y se ceban los primeros 18u del lecho con water=max(,.6). El undo lo revierte porque pushUndo guarda sources. Si nace en un río o junto a otra fuente, no añade nada.
- v9 (sombras del agua sobre el terreno):
  - `waterMesh.castShadow=true` con un `customDepthMaterial` (MeshDepthMaterial RGBADepthPacking) cuyo vertex shader repite EXACTAMENTE el desplazamiento del agua (surfAt bilineal de tSurf + dep de tFlow, y=s+.04/-.06), de modo que la sombra proyectada coincide con la superficie visible.
  - Sombra parcial sin tocar las demas luces: en el fragment del depth material se descartan texeles con un dither ordenado 4x4 (`bay(gl_FragCoord.xy)`) segun opacidad por profundidad `shO=clamp(.25+dep*.22,0,.85)`; PCFSoft promedia el patron y queda sombra gris, mas densa cuanto mas honda el agua. dep<0.05 no proyecta (orillas limpias).
  - Optimización: `renderer.shadowMap.autoUpdate=false` y `needsUpdate=true` solo antes del render principal en renderFrame -> 1 render de sombras por frame (antes eran 2-3, uno por cada pase); los pases de reflexión/refracción reutilizan el mapa del frame anterior (incluye el agua, correcto para el lecho refractado).
  - Gating: `QS[].shad` (baja=0: el agua no proyecta; media/alta=1). setQuality y el modo foto lo aplican (foto fuerza sombra activa y restaura).
- v8 (ajuste automático de calidad):
  - `QS[]` define 3 niveles (baja/media/alta) que escalan a la vez: pixel ratio del renderer, tamaño de `sceneRT`, `bloomA/B`, `reflRT`, `refrRT`, cadencia del pase de reflexión (`every` frames), número de partículas de espuma (`foam`) y encendido del reflejo planar (uniform `uReflOn`, nuevo en el shader del agua).
  - `setQuality(q,fromAuto)` aplica el nivel, redimensiona todos los targets vía `resizePost()` y actualiza el indicador `#stQ` ("calidad: alta (auto)"). Botones ⚙️ Auto / Alta / Media / Baja en el panel (`.quals`).
  - Heurística auto: EMA del tiempo de frame CRUDO (`dtAvg`, peso .2) tomado ANTES del clamp que usa la física. Baja un nivel si `dtAvg>.030` (~33 fps), sube si `dtAvg<.019` (~52 fps). Compuertas por reloj de pared: `frame>8`, 2.5 s desde el arranque, 1.5 s entre bajadas, 9 s entre subidas.
  - TRAMPA aprendida: gatear por contador de frames (`frame>150`) o por fps derivado del dt ya clamped NO dispara nunca en render por software (el juego corre a <1 fps y el clamp de .05 impide reportar menos de 20 fps). Medir dt crudo + reloj de pared es lo que funciona.
  - El modo foto fuerza calidad alta + `uReflOn=1` + `forceRefl=true` y restaura `P.quality`/`P.autoQ` al terminar.
- v7 (calidad cinematográfica, todo dentro de Three.js r128, SIN migrar de versión):
  - **Reflexión planar real**: se eliminó el cubemap. `renderWaterPasses()` calcula el nivel dominante del agua (centro de masa, `waterLevelNow()`), espeja la cámara sobre ese plano con la matemática de THREE.Reflector (view/lookAt reflejados, `up` reflejado, projectionMatrix copiada) y renderiza a `reflRT` (media resolución). El shader muestrea con `texture2DProj(uRefl, vRefl)` usando `uTexMat` = biasMatrix * proj * viewInverse. Fuera del plano dominante (río en ladera) se mezcla a `fogC` según `abs(vSurf-uLevel)`, así no aparecen reflejos falsos. Reflexión cada 2 frames (`frame&1`), `forceRefl` la fuerza en el modo foto.
  - **Refracción**: la escena sin agua se renderiza a `refrRT` desde la cámara principal y el shader la muestrea en espacio de pantalla (`vClip`) con offset por la normal, atenuado por distancia. Absorción Beer sobre ese color. El alfa del agua subió (`smoothstep(.008,.085,dep)`) porque ahora el fondo lo aporta la refracción, no el blending.
  - **Cáusticas**: en el shader del TERRENO (onBeforeCompile) se muestrea `tFlow` con `vWP.xz/220+.5`; donde hay agua se tinta el lecho de azul-verde y se suman dos capas de fbm2 desfasadas cuyo cruce (`1-abs(c1-c2)`) dibuja las líneas de luz. Uniforms nuevos: `tFlow`, `uTime` (actualizado en el bucle), `uCaus` (=dayF, apagadas de noche). `terrainShader` guarda la referencia.
  - **Postprocesado propio** (sin EffectComposer): `setupPost()` crea `sceneRT` + `bloomA/bloomB` a 1/4, quad fullscreen y 3 materiales (bright-pass umbral .86, blur separable 5 taps, composite). `renderFrame()` encadena escena -> bright -> blurH -> blurV -> composite. El tone mapping ACES (Narkowicz) y la saturación 1.16 se aplican SOLO en el composite, no con `renderer.toneMapping`, para que agua, cielo y espuma (ShaderMaterial crudo) reciban el mismo tratamiento que los materiales estándar. `uExp` sube de noche.
  - Coste: 3 renders de escena por frame (refracción media res, reflexión media res cada 2 frames, escena a RT) + 3 pases baratos. En el sandbox por software 25-58 fps; en GPU real sobrado.
- v6: agua desplazada en GPU (malla RW=512 + texSurf/texFlow). v5: día/noche, peces, biomas. v4: cubemap + modo foto. v3.x: agua advectada, detalle por píxel. v2: malla 256, estructuras, guardar, deshacer.
- Repo: `guachiman19/juego-agua` (main). Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ sirviendo v10 verificado por hash. Producción: NO desplegada, requiere OK de Jaime. Vercel sin conexión.
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
