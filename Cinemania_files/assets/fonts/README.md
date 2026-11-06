# Fuentes de marca

Los subtítulos de SpeedReels usan **Geomanist Black**. Es una fuente comercial,
así que **no se versiona**: copia el archivo aquí en tu máquina.

```bash
cp /ruta/a/Geomanist-Complete-Desktop/Geomanist-Black.otf Cinemania_files/assets/fonts/
```

También puedes apuntar a otra ruta con la variable `SPEEDREELS_FONT`:

```bash
SPEEDREELS_FONT=/ruta/Geomanist-Black.otf ./scripts/dev.sh
```

Si no encuentra la fuente, el motor usa una sans gruesa del sistema
(Arial Black, Helvetica o DejaVu Sans Bold) con el mismo estilo: contorno negro,
sin sombra y palabras clave en amarillo `#FFD60A`.
