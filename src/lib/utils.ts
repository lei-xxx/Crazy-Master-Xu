import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const basePath = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

function withPublicBase(path: string) {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  if (path.startsWith(basePath)) return path
  if (path === '/') return basePath

  return `${basePath}${path.replace(/^\/+/, '')}`
}

export function publicAsset(path?: string) {
  if (!path) return undefined
  return withPublicBase(path)
}

export function publicRoute(path = '/') {
  return withPublicBase(path)
}

export function isInsideShellFrame() {
  if (typeof window === 'undefined') return false

  try {
    return window.parent !== window
  } catch {
    return false
  }
}

type ShellRouteMessageType = 'xulei-shell-route-sync' | 'xulei-shell-close'

type ShellRouteMessagePayload = {
  resetScroll?: boolean
  scrollY?: number
}

export function postShellRouteMessage(
  type: ShellRouteMessageType,
  path = '/',
  payload: ShellRouteMessagePayload = {},
) {
  if (typeof window === 'undefined' || !isInsideShellFrame()) return false

  try {
    window.parent.postMessage({ type, path, ...payload }, window.location.origin)
    return true
  } catch {
    return false
  }
}

export function syncShellRoute(path = `${window.location.pathname}${window.location.search}${window.location.hash}`) {
  return postShellRouteMessage('xulei-shell-route-sync', path)
}

export function closeShellRoute(path = '/', payload: ShellRouteMessagePayload = {}) {
  return postShellRouteMessage('xulei-shell-close', path, payload)
}
