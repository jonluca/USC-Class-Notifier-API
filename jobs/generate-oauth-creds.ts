import "dotenv/config";
import http from "http";
import { google } from "googleapis";

const CLIENT_ID = "70308730174-sfb9ckcn7cjj0biaggjf95sdcuet9isf.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;

// For Desktop OAuth clients, you can use an installed-app redirect like this:
const REDIRECT_URI = "http://127.0.0.1:53682/callback";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

async function main() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // required to receive refresh_token :contentReference[oaicite:7]{index=7}
    prompt: "consent", // ensures refresh_token is returned even if previously authorized
    scope: SCOPES,
  });

  console.log("Open this URL in your browser:\n", authUrl);

  const server = http.createServer(async (req, res) => {
    if (!req.url) return;

    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get("code");

    if (!code) {
      res.writeHead(400);
      res.end("Missing code");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    // tokens.refresh_token is what you store long-term (encrypted).
    console.log("TOKENS:", tokens);

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Authorized. You can close this tab.");

    server.close();
  });

  server.listen(53682, "127.0.0.1", () => {
    console.log("Listening on http://127.0.0.1:53682");
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
