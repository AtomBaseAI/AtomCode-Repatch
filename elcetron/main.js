const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("path");

/**
 * AtomCode Student — Electron main process.
 *
 * The renderer is a plain HTML/JS app. All HTTP calls go through the main
 * process (IPC "api:fetch") which avoids CORS entirely and keeps the
 * auth token handling in one place.
 */

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    backgroundColor: "#0b0f14",
    title: "AtomCode Student",
    icon: path.join(__dirname, "renderer", "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Optional: ATOMCODE_URL=http://localhost:3000/desktop-preview loads a live
  // page instead of the bundled renderer (handy while developing).
  if (process.env.ATOMCODE_URL) {
    mainWindow.loadURL(process.env.ATOMCODE_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
  }

  // Open target=_blank / window.open links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("before-input-event", (_e, input) => {
    // F12 / Ctrl+Shift+I toggles devtools
    if (
      input.type === "keyDown" &&
      (input.key === "F12" ||
        (input.control && input.shift && input.key.toLowerCase() === "i"))
    ) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

/* ------------------------------------------------------------------ */
/* IPC: proxied HTTP for the renderer                                  */
/* ------------------------------------------------------------------ */

ipcMain.handle("api:fetch", async (_event, req) => {
  const {
    serverUrl,
    path: apiPath,
    method = "GET",
    token,
    body,
    timeout = 45000,
  } = req || {};

  let base = String(serverUrl || "").replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(base)) {
    return { ok: false, status: 0, data: { error: "Server URL must start with http:// or https://" } };
  }

  const url = `${base}/api/desktop${apiPath}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: text?.slice(0, 300) || `HTTP ${res.status}` };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    const aborted = err && err.name === "AbortError";
    return {
      ok: false,
      status: 0,
      data: {
        error: aborted
          ? "Request timed out — is the AtomCode server running?"
          : `Cannot reach server at ${base}`,
      },
    };
  } finally {
    clearTimeout(timer);
  }
});

ipcMain.handle("app:openExternal", async (_event, url) => {
  if (/^https?:\/\//i.test(String(url))) await shell.openExternal(String(url));
  return true;
});

ipcMain.handle("app:info", () => ({
  electron: process.versions.electron,
  node: process.versions.node,
  chrome: process.versions.chrome,
  appVersion: app.getVersion(),
  platform: process.platform,
}));

/* ------------------------------------------------------------------ */
/* App lifecycle                                                       */
/* ------------------------------------------------------------------ */

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
