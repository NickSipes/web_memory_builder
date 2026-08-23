import { test, expect } from '@playwright/test'
import { mockBackend, collectApiErrors } from './helpers'

// Guards the exact flow that broke: presign → S3 PUT → save metadata. If the
// build ships without the API URL, the presign call hits the SPA (HTML), the
// mock (matched by API host) never fires, and this test fails.
test('upload a photo through the full flow', async ({ page }) => {
    const errors = collectApiErrors(page)
    await mockBackend(page)

    await page.goto('/')
    await page.getByRole('link', { name: /Leave a message for Jerry/ }).click()
    await expect(page).toHaveURL(/\/message/)
    await page.getByLabel('Your name').fill('Test Guest')
    await page.getByLabel('Your relation to Jerry').selectOption('Son')
    await page.getByRole('button', { name: /Continue/ }).click()
    await expect(page).toHaveURL(/\/record/)

    await page.getByRole('button', { name: /Upload photo/ }).click()
    await page.setInputFiles('input[type="file"]', {
        name: 'pic.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-bytes'),
    })
    await expect(page.getByText(/Selected: pic\.jpg/)).toBeVisible()

    await page.getByRole('button', { name: /Save & send/ }).click()

    await expect(page).toHaveURL(/\/confirm/)
    await expect(page.getByText(/Jerry will love this/)).toBeVisible()
    expect(errors).toEqual([])
})
