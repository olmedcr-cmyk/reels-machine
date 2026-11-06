// El bundle de Frekvens es un script clásico que lee `window.React`.
// Este módulo se evalúa antes que bundle.js (orden de imports) y le da el
// React de la app, así hooks y contexto son los mismos.
import * as React from 'react'

;(window as unknown as { React: typeof React }).React = React
