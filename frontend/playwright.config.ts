import { defineConfig, devices } from '@playwright/test'

// E2E runs against the real production build (vite preview), so it catches
// build-time issues like a missing VITE_API_URL. The backend is mocked per-test
// by the App Runner host (see e2e/helpers.ts), so tests never touch live data
// and a build that targets the wrong host fails to match the mocks.
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:4173',
        trace: 'on-first-retry',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
})
