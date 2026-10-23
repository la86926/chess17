# Chess de L

Aprende ajedrez desde cero y entrena con dos métodos de repetición.

- **Aprende Ajedrez**: 218 lecciones en seis niveles.
- **Método PC1** (Avanzado): 1128 ejercicios tácticos.
- **Método PC2** (Muy avanzado): 1000 ejercicios posicionales.
- **Finales de peones (avanzado)**: 32 posiciones reales de ocho partidas magistrales publicadas, agrupadas en ocho familias estratégicas (aislado, colgantes, Carlsbad, Francesa, Erizo, India de rey, Benoni y Maróczy). Conserva los controles, animaciones, tutor, pistas, partidas, historial, favoritos, sonidos y sincronización de Aprende Ajedrez. Las nuevas lecciones usan identificadores `S1-001` a `S8-004` para no mezclar sus resultados con el antiguo temario básico.
- **Mi ID**: guarda el avance en la nube y lo abre en otro dispositivo (también con un código QR).

Web: https://la86926.github.io/chess17/

## Cómo está hecho

Las secciones originales y la sincronización son las mismas de `la86926/chess` (misma nube de Firebase).
El laboratorio avanzado vive en `index4.html`, usa las lecciones de `c17/finales-aa-lecciones.js`, la pedagogía nativa de `c17/finales-aa-app.js` y conserva el sistema visual de `c17/`:

| Archivo | Para qué sirve |
|---|---|
| `c17/tokens.css` | Colores, tipografías y radios del sistema visual |
| `c17/shell.css`, `c17/shell.js` | Menú, cambio de sección, Mi ID con QR, tutorial |
| `c17/piel.css`, `c17/piel.js` | Piel que se aplica dentro de PC1, PC2 y Aprende Ajedrez |
| `c17/fuentes/` | Instrument Sans (licencia OFL), servidas desde el repo |
| `c17/fondos/`, `c17/fondos.js` | Fondos desenfocados elegibles desde el menú |
| `c17/qrcode.js` | Generador de QR de Kazuhiko Arase (licencia MIT) |

La app Android se compila sola con GitHub Actions y queda en *Releases* como `ChessDeL17.apk`.
