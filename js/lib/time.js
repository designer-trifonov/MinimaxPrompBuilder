const two = (n) => String(n).padStart(2, "0");

// Секунды → MM:SS.mmm (формат таймстемпов из официального гайда)
export function stamp(s) {
  s = Math.max(0, Number(s) || 0);
  const ms = Math.round((s % 1) * 1000);
  return `${two(Math.floor(s / 60))}:${two(Math.floor(s % 60))}.${String(ms).padStart(3, "0")}`;
}
