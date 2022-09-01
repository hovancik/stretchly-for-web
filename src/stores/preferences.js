import { writable } from 'svelte/store'

export const longBreakInterval = writable(parseInt(window.localStorage.getItem('longBreakInterval')) || 2)
export const longBreakDuration = writable(parseInt(window.localStorage.getItem('longBreakDuration')) || 60 * 5)
export const miniBreakInterval = writable(parseInt(window.localStorage.getItem('miniBreakInterval')) || 60 * 10)
export const miniBreakDuration = writable(parseInt(window.localStorage.getItem('miniBreakDuration')) || 60 * 0.5)
