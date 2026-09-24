import { on } from "./eventBus.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

export const ICONS = {
  ref: '<path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49L12.95 2.56a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  style: '<path d="M12 3a9 8.5 0 1 0 0 17c1.6 0 2.3-1 2.3-2.1 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.9-1.8H17a4 4 0 0 0 4-4C21 6 17 3 12 3Z"/><circle cx="8" cy="9.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="7.5" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="12.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.3" fill="currentColor" stroke="none"/>',
  shot: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  camera: '<rect x="2.5" y="7" width="13" height="10" rx="2"/><path d="M15.5 10.5 21 7.5v9l-5.5-3Z"/>',
  photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="1.5"/><path d="m4 19 4.5-4.5 3.5 3 3-2.5 5 4"/>',
  chat: '<path d="M5.5 5H18.5A2.5 2.5 0 0 1 21 7.5V13.5A2.5 2.5 0 0 1 18.5 16H9L5 20L8 16H5.5A2.5 2.5 0 0 1 3 13.5V7.5A2.5 2.5 0 0 1 5.5 5Z"/>',
  outfit: '<path d="M9 4 6 6l1 3-3 9h16l-3-9 1-3-3-2"/><path d="M9 4c0 1.7 1.3 3 3 3s3-1.3 3-3"/>',
  link: '<path d="M9 15 15 9"/><path d="M10 6h4a4 4 0 0 1 0 8h-1"/><path d="M14 18h-4a4 4 0 0 1 0-8h1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  frame: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M9 5v4M15 5v4"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  note: '<circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 18V6l10-2v12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.3" r="1.1" fill="currentColor" stroke="none"/>',
  module: '<path d="M12 3 20 7.5v9L12 21 4 16.5v-9Z"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
  back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',

  bookmark: '<path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.8Z"/>',
  bookmarkOn: '<path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.8Z" fill="currentColor"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  delete: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',

  object: '<path d="M12 3 20 7.5v9L12 21 4 16.5v-9Z"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
  environment: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M9 5v4M15 5v4"/>',
  other: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.3" r="1.1" fill="currentColor" stroke="none"/>',
  motion: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  character: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  structure: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  shot_tpl_00: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="1.5"/><path d="m4 19 4.5-4.5 3.5 3 3-2.5 5 4"/>',
  shot_tpl_01: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="1.5"/><path d="m4 19 4.5-4.5 3.5 3 3-2.5 5 4"/>',
  shot_tpl_02: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="1.5"/><path d="m4 19 4.5-4.5 3.5 3 3-2.5 5 4"/>',
  shot_tpl_03: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="1.5"/><path d="m4 19 4.5-4.5 3.5 3 3-2.5 5 4"/>',

  visualStyleEvent: '<path d="M12 3a9 8.5 0 1 0 0 17c1.6 0 2.3-1 2.3-2.1 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.9-1.8H17a4 4 0 0 0 4-4C21 6 17 3 12 3Z"/><circle cx="8" cy="9.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="7.5" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="12.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.3" fill="currentColor" stroke="none"/>',
  referenceEvent: '<path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49L12.95 2.56a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  shotEvent: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  soundsEvent: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  musicEvent: '<circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 18V6l10-2v12"/>',

  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  template: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
};

export function icon(name, { size = 15, color = "currentColor" } = {}) {
  const paths = ICONS[name];
  if (!paths) return null;
  const span = el("span", `display:inline-flex;flex-shrink:0;width:${size}px;height:${size}px;color:${color};`);
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return span;
}

on("icon:get", ({ id, size, color, resolve }) => resolve(icon(id, { size, color })));
