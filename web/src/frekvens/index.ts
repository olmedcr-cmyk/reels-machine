/**
 * Frekvens — sistema de diseño de Cris Olmedo
 * https://claude.ai/artifact/WgtvF5SGA8YKL8EQJPLsJs
 *
 * Copia del bundle publicado (components/bundle.js + bundle.css + index.d.ts) y
 * tokens.css generado desde tokens.json. Para actualizar, vuelve a copiar
 * esos archivos desde el sistema.
 */
import './react-global'
import './tokens.css'
import './bundle.css'
import './bundle.js'
import type * as FrekvensTypes from './frekvens'

export type { Tone, IconName } from './frekvens'

export const F = (window as unknown as { Frekvens: typeof FrekvensTypes }).Frekvens
