// Serves the RetroCalc privacy policy as a standalone HTML document at
// /retrocalc/privacy. It is intentionally a route handler rather than a
// page so it is delivered verbatim, outside the site's root layout
// (fonts, analytics, banner) — the store links to this as a public policy URL.

export const dynamic = "force-static";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RetroCalc — Privacy Policy</title>
<style>
  body { font-family: Georgia, serif; max-width: 680px; margin: 40px auto; padding: 0 20px;
         color: #222; line-height: 1.6; }
  h1 { font-size: 1.6em; } h2 { font-size: 1.15em; margin-top: 1.8em; }
  .meta { color: #777; font-size: 0.9em; }
</style>
</head>
<body>
<h1>RetroCalc — Privacy Policy</h1>
<p class="meta">Effective date: July 14, 2026 · App: RetroCalc: Retro Calculator (xyz.yoav.retrocalc)</p>

<p>RetroCalc is a calculator. It does not collect, store, transmit, or share any
personal data. Period.</p>

<h2>Data collection</h2>
<p>RetroCalc collects <strong>no data whatsoever</strong>. It contains no analytics,
no advertising, no tracking, and no third-party SDKs that collect data. The app
does not request the Internet permission and is incapable of sending anything
off your device.</p>

<h2>Data stored on your device</h2>
<p>Your calculator state (current calculation, memories, result history, and
settings such as theme and sound preferences) is saved locally on your device
so the app can restore it when you return. This data never leaves your device,
is not accessible to us or anyone else, and is deleted when you uninstall the
app or clear its storage.</p>

<h2>Permissions</h2>
<p>RetroCalc requests no special permissions.</p>

<h2>Children</h2>
<p>RetroCalc is safe for all ages. Since no data is collected from anyone, no
data is collected from children.</p>

<h2>Changes to this policy</h2>
<p>If a future version of RetroCalc ever changes any of the above, this policy
will be updated and the effective date revised before that version is released.</p>

<h2>Contact</h2>
<p>Questions? Email <a href="mailto:mail.yoav@gmail.com">mail.yoav@gmail.com</a>.</p>
</body>
</html>
`;

export function GET() {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
