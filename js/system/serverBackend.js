import { api } from "../../../scripts/api.js";

// Хранение в пользовательской папке ComfyUI: user/<пользователь>/<path>.
export const userFileBackend = (path) => {
  const url = `/userdata/${encodeURIComponent(path)}`;
  return {
    async read() {
      const r = await api.fetchApi(url);
      return r.ok ? r.json() : null;
    },
    async write(data) {
      await api.fetchApi(`${url}?overwrite=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
  };
};
