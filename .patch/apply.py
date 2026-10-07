# Aplica .patch/v14.txt: verifica sha256 de entrada y salida de cada archivo (si algo no cuadra, no escribe nada).
import hashlib
lines = open('.patch/v14.txt', encoding='utf-8', newline='').read().split('\n')
files, i = [], 0
while i < len(lines):
    L = lines[i]
    if L.startswith('### '):
        _, path, h_in, h_out = L.split(' '); files.append([path, h_in, h_out, []]); i += 1; continue
    if L.startswith('@@ '):
        _, a, b, n = L.split(' '); a, b, n = int(a), int(b), int(n)
        files[-1][3].append((a, b, lines[i + 1:i + 1 + n])); i += 1 + n; continue
    if L == '' and i == len(lines) - 1: break
    raise SystemExit('linea inesperada %d: %r' % (i, L[:80]))
results = []
for path, h_in, h_out, ops in files:
    src = open(path, encoding='utf-8', newline='').read()
    if hashlib.sha256(src.encode()).hexdigest() != h_in: raise SystemExit('sha256 de entrada no coincide: ' + path)
    arr = src.split('\n')
    for a, b, new in sorted(ops, key=lambda o: -o[0]): arr[a:b] = new
    res = '\n'.join(arr)
    if hashlib.sha256(res.encode()).hexdigest() != h_out: raise SystemExit('sha256 de salida no coincide: ' + path)
    results.append((path, res))
for path, res in results:
    open(path, 'w', encoding='utf-8', newline='').write(res); print('ok', path, hashlib.sha256(res.encode()).hexdigest())
