import hashlib,sys
def sha(b):return hashlib.sha256(b).hexdigest()
def edit(path,before,after,reps):
    raw=open(path,'rb').read()
    if sha(raw)!=before:sys.exit(f'{path}: sha de partida distinto {sha(raw)}')
    s=raw.decode('utf-8')
    for old,new in reps:
        if s.count(old)!=1:sys.exit(f'{path}: ancla no unica: {old[:40]!r}')
        s=s.replace(old,new)
    out=s.encode('utf-8')
    if after and sha(out)!=after:sys.exit(f'{path}: sha final distinto {sha(out)}')
    open(path,'wb').write(out);print(path,sha(out))
CSS=('#b8bit{display:block;margin-top:7px;padding:7px 8px;border-radius:9px;border:1px solid #f8b800;'
 'background:rgba(248,184,0,.12);color:#f8d878;font-size:11px;font-weight:600;text-align:center;text-decoration:none;letter-spacing:.2px}'
 '#b8bit:hover{background:rgba(248,184,0,.25)}')
LINK=' <a id="b8bit" href="8bit/" title="Lanza barquitos de papel por los arroyos del jardin">🕹️ Jardín 8-bit · barquitos</a>\n'
V13='''## Estado actual: v13 (2026-09-30)

- v13 (pedido de Jaime: "make an 8-bit version of the garden, as fun as possible" + "throw a paper boat at the top and it goes down through so many paths"):
  - JUEGO NUEVO en `8bit/` (index.html, art.js, world.js, audio.js, game.js, main.js; JS puro, sin dependencias). Staging: https://guachiman19.github.io/juego-agua/8bit/ . Boton "Jardín 8-bit" en el panel del 3D (bajo Escenarios, #b8bit) y boton "3D" en la barra del 8-bit para volver.
  - Render: framebuffer indexado 224x288 vertical tipo arcade, paleta NES de 36 colores, fuente 5x7 propia con tildes. Proyeccion oblicua de heightmap (fila y a altura h se dibuja en Y0+y-h), render de frente a fondo con ymin por columna; ZB guarda la fila para ocultar sprites tras el terreno y PICK la celda de cada pixel para el input. Noche = palette swap (NIGHT_MAP) + luz calida de faroles y velas (LUT_WARM, LIT=2 con borde tramado; LIT=3 = UI a color de dia).
  - Jardin: 3 terrazas con muros de piedra (ishigaki) y cascadas reales donde los arroyos cruzan el borde. Red de 21 tramos y 9 bifurcaciones (S manantial, P1 torii flotante, Q1 estanque de ranas, Q2 remolino, F1, F3, N2, N3, Q3) = 27 rutas hasta 5 estanques con multiplicador (x3 lotos, x2 iris, x1 carpas, x2 luna, x5 dorado). Tunel de roca (tramo 10), tobogan de bambu elevado (tramo 14), puente rojo (13), puente de losa (18), pasaderas (7), karesansui con monje, tsukubai, 8 faroles, cerezos con petalos, pinos, bambu, arbustos, carpas y ranas.
  - Agua: modelo de tuberias 224x198 con flujo proporcional a la profundidad aguas arriba (K=.1, tope d=1.5: con tope 3 salia un tablero de ajedrez inestable), DAMP .94, 240 pasos/s, manantial Q=3.5. Rebosadero oculto en estanques intermedios a sill+2.6: con compuertas cerradas no se inunda el jardin (a sill+2 robaba caudal normal).
  - Barcos: se lanzan tocando el agua (vuelan en arco desde abajo) o arrastrando y soltando (con impulso). En arroyos van por riel (siguen la polilinea del tramo con vaiven, 13-34 px/s segun la corriente, 42 en el tobogan); en estanques flotan libres (corriente + campo NAV por BFS hasta los estanques finales + rumbo a la salida elegida; en Q2 dan 1-2.3 vueltas). En cada bifurcacion eligen al azar una salida ABIERTA (en S pesa la cercania al punto de caida). Caen por las cascadas con animacion. Se hunden si quedan en seco 2.2 s o atascados 8 s en modo libre.
  - Diversion: puntos por cascada, gran cascada, torii, puente, pasaderas, tunel, tobogan, remolino, rana pasajera y farol (noche); multiplicador del estanque; barco dorado x2 (6%); combo si atracan seguidos; ruta nueva +1000 con destello del recorrido y fuegos; 18 misiones encadenadas (+500); festival de faroles (+1000) al encender los 8 de noche. Letreros tocables = compuertas (parpadean cuando se acerca un barco). Pala para cavar canales propios (los barcos los toman al 50%) y tierra para taparlos. Tocar un barco lo hace saltar. Musica chiptune (escala yo de Re: pulso, triangulo y ruido LFSR), efectos y 3 modos de sonido. ES/EN. Guardado en localStorage 'n8b'.
  - Verificado con Playwright y simulacion acelerada: 50/50 barcos atracan, 21-25 rutas distintas por tanda, trayecto medio 12 s; con compuertas al azar 45-50/50 (los hundidos quedan en seco por la compuerta, es lo esperado); 0 errores de consola; sim 3.6 ms + render 2.1 ms por frame; en movil el canvas ocupa el ancho (390 px).
  - Aprendizajes: (1) seguir solo el agua simulada no sirve para los barcos: en el labio de cada cascada el agua es una lamina de 0.05 y se atascaban; el riel por la polilinea del tramo lo resolvio. (2) Las paredes del tobogan deben ser cortes perpendiculares al trazo; un anillo radial tapaba la entrada. (3) En celdas secas la colision debe permitir moverse dentro de la misma celda o hacia celdas mas mojadas, si no hay bloqueo mutuo en la orilla. (4) Publicacion: git push sigue bloqueado; los archivos nuevos se suben con el GitHub MCP y los cambios chicos a archivos grandes con un workflow temporal creado por Composio que verifica sha256.

## Historial v12 (2026-09-09, commit 3fbbdee)
'''
README8='''## Jardín 8-bit

Versión retro del jardín japonés en `8bit/`: toca el agua de arriba para lanzar barquitos de papel que bajan por 27 rutas de arroyos, cascadas, puentes, túnel, tobogán de bambú y remolino hasta los estanques. Compuertas tocables, pala para cavar canales, modo noche con farolillos, música chiptune y misiones. Staging: https://guachiman19.github.io/juego-agua/8bit/

'''
edit('index.html','8979c3d3a27612a4d85896f6c86480b0b8e0014872d22a532e3e418b4e2553d2',sys.argv[1] if len(sys.argv)>1 else '',
 [('</style>',CSS+'\n</style>'),('  <button data-p="jardin">🎋 Jardín</button>\n </div>\n','  <button data-p="jardin">🎋 Jardín</button>\n </div>\n'+LINK)])
edit('CLAUDE.md','a492d895a5c52cce1752bcd89741a8f1759d6b8efbb0fea56e0ae4b4e262b856',sys.argv[2] if len(sys.argv)>2 else '',
 [('## Estado actual: v12 (2026-09-09, commit 3fbbdee)\n',V13),
  ('Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ sirviendo v10 verificado por hash.','Staging: GitHub Pages https://guachiman19.github.io/juego-agua/ (3D) y https://guachiman19.github.io/juego-agua/8bit/ (8-bit), v13.')])
edit('README.md','f482420d66917d100abdc28a3b4c76d0056cd2f8518d663a4d3dc502597ece60',sys.argv[3] if len(sys.argv)>3 else '',
 [('## Características\n',README8+'## Características\n')])
