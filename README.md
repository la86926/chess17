# Chess de L

Aprende ajedrez desde cero y entrena con dos métodos de repetición.

- **Aprende Ajedrez**: 218 lecciones en seis niveles.
- **Método PC1** (Avanzado): 1128 ejercicios tácticos.
- **Método PC2** (Muy avanzado): 1000 ejercicios posicionales.
- **Finales de peones:** temario renovado de 8 niveles y 32 lecciones; el antiguo Nivel IV («Rupturas con sacrificios») pasa al Nivel I y la triangulación se mantiene en el Nivel II con dibujo SVG animado del triángulo mostaza sobre el tablero. Los niveles III-VIII son 24 problemas nuevos de rupturas centrales, defensa activa, mayorías, reyes y carreras. Cada lección conserva explicación, demostración, práctica, segundo momento crítico y examen con respuesta alternativa o tablero reflejado; 96 ejercicios. Las líneas son legales, pero no se presentan como soluciones únicas certificadas por tablebase. Los ID del Nivel I siguen siendo E4-001..004 para conservar su progreso; las 28 lecciones restantes usan T2-001..004 y R3-001..R8-004.
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
