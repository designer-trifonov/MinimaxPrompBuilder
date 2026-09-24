import { on } from "./eventBus.js";

let subjectCount = 0;
const mediaCounts = { picture: 0, video: 0 };
const assigned = new Map();

export function nextNumbers(id, media) {
  subjectCount += 1;
  mediaCounts[media] = (mediaCounts[media] || 0) + 1;
  const numbers = { subjectN: subjectCount, refN: mediaCounts[media] };
  assigned.set(id, { ...numbers, media });
  return numbers;
}

on("promptBlock:remove", ({ id } = {}) => {
  const a = assigned.get(id);
  if (!a) return;
  subjectCount -= 1;
  mediaCounts[a.media] -= 1;
  assigned.delete(id);
});

on("resetAll", () => {
  subjectCount = 0;
  mediaCounts.picture = 0;
  mediaCounts.video = 0;
  assigned.clear();
});
