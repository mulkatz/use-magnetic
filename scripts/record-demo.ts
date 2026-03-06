import { type ChildProcess, spawn } from "node:child_process";
import { type Page, chromium } from "playwright";

const WIDTH = 800;
const HEIGHT = 600;
const DEV_URL = "http://localhost:5173";

async function waitForServer(url: string, timeout = 15000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			// not ready yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

async function startDevServer(): Promise<ChildProcess> {
	const proc = spawn("npm", ["run", "dev"], {
		cwd: new URL("../demo", import.meta.url).pathname,
		stdio: "pipe",
	});
	await waitForServer(DEV_URL);
	return proc;
}

async function wait(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

async function smoothMove(
	page: Page,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	steps = 20,
	stepDelay = 30,
) {
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
		const x = startX + (endX - startX) * ease;
		const y = startY + (endY - startY) * ease;
		await page.mouse.move(x, y);
		await wait(stepDelay);
	}
}

async function record() {
	console.log("Starting demo dev server...");
	const server = await startDevServer();

	try {
		console.log("Launching browser...");
		const browser = await chromium.launch();

		// First, load the page WITHOUT recording to ensure it's fully rendered
		const preloadContext = await browser.newContext({
			viewport: { width: WIDTH, height: HEIGHT },
		});
		const preloadPage = await preloadContext.newPage();
		await preloadPage.goto(DEV_URL);
		await preloadPage.waitForLoadState("networkidle");
		await wait(1000);
		await preloadContext.close();

		// Now start recording with a fresh context
		const context = await browser.newContext({
			viewport: { width: WIDTH, height: HEIGHT },
			recordVideo: {
				dir: "./tmp-video",
				size: { width: WIDTH, height: HEIGHT },
			},
		});

		const page = await context.newPage();
		await page.goto(DEV_URL);
		await page.waitForLoadState("networkidle");
		await wait(800);

		// === Focus: Hero buttons — show the magnetic pull effect ===
		// Cursor starts off-screen left, approaches "Hover me" button
		await smoothMove(page, 50, 310, 295, 310, 25, 35);
		await wait(500);

		// Orbit around "Hover me" button to show pull from different angles
		await smoothMove(page, 295, 310, 330, 280, 12, 35);
		await smoothMove(page, 330, 280, 350, 310, 12, 35);
		await smoothMove(page, 350, 310, 295, 340, 12, 35);
		await wait(300);

		// Slide to "Stronger" button
		await smoothMove(page, 295, 340, 430, 310, 18, 35);
		await wait(500);

		// Orbit "Stronger" to show the stronger pull
		await smoothMove(page, 430, 310, 460, 280, 10, 35);
		await smoothMove(page, 460, 280, 490, 310, 10, 35);
		await smoothMove(page, 490, 310, 430, 340, 10, 35);
		await wait(300);

		// Slide to "Smooth" button
		await smoothMove(page, 430, 340, 570, 310, 18, 35);
		await wait(600);

		// Pull away from all buttons — show snap-back
		await smoothMove(page, 570, 310, 700, 200, 15, 30);
		await wait(600);

		console.log("Recording complete. Saving video...");
		await context.close();
		await browser.close();

		console.log("Video saved to tmp-video/");
	} finally {
		server.kill();
	}
}

record().catch((err) => {
	console.error("Recording failed:", err);
	process.exit(1);
});
