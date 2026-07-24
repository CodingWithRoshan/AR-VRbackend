const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { finalizeAndUpload } = require("../services/recording.service");

const TMP_DIR = path.join(__dirname, "..", "tmp_recordings");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// Keep this in sync with the origin list in app.js's cors() config
const ALLOWED_ORIGINS = ["http://localhost:5173"];

function attachRecordingSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/webrtc" });

  wss.on("connection", (ws, req) => {
    // Reject connections from origins we don't recognize before doing
    // any work — without this, any site can open this socket and burn
    // disk space / Cloudinary quota.
    if (!ALLOWED_ORIGINS.includes(req.headers.origin)) {
      console.warn(`Rejected WS connection from origin: ${req.headers.origin}`);
      ws.close(1008, "Origin not allowed");
      return;
    }

    const sessionId = randomUUID();
    const filePath = path.join(TMP_DIR, `${sessionId}.webm`);
    const writeStream = fs.createWriteStream(filePath);
    const bytesWrittenRef = { value: 0 };
    let finalized = false;

    console.log(`[${sessionId}] Recording session started`);

    const finalize = async () => {
      if (finalized) return;
      finalized = true;
      try {
        const result = await finalizeAndUpload({
          sessionId,
          filePath,
          writeStream,
          bytesWrittenRef,
        });
        if (result && ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "uploaded", url: result.secure_url }));
        }
      } catch (err) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "upload_error", message: err.message }));
        }
      }
    };

    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        writeStream.write(data);
        bytesWrittenRef.value += data.length;
        console.log(`[${sessionId}] Chunk received (${data.length} bytes), total: ${bytesWrittenRef.value}`);
        return;
      }
      try {
        const msg = JSON.parse(data.toString());
        console.log(`[${sessionId}] Control message:`, msg);
        if (msg.type === "stop") finalize();
      } catch {
        console.warn(`[${sessionId}] Malformed control message:`, data.toString());
      }
    });

    ws.on("close", () => {
      console.log(`[${sessionId}] WebSocket closed — finalizing`);
      finalize();
    });

    ws.on("error", (err) => {
      console.error(`[${sessionId}] WS error:`, err);
      finalize();
    });
  });

  return wss;
}

module.exports = { attachRecordingSocket };