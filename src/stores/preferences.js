import { writable } from 'svelte/store'

export const longBreakInterval = writable(window.localStorage.getItem('longBreakInterval') || 2)
export const longBreakDuration = writable(window.localStorage.getItem('longBreakDuration') || 60 * 5)
export const miniBreakInterval = writable(window.localStorage.getItem('miniBreakInterval') || 60 * 10)
export const miniBreakDuration = writable(window.localStorage.getItem('miniBreakDuration') || 60 * 0.5)
