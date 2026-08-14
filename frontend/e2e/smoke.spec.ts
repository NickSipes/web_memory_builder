import { test, expect } from '@playwright/test'
import { mockBackend, collectApiErrors } from './helpers'

test('landing shows the birthday and both actions, no API errors', async ({ page }) => {
    const errors = collectApiErrors(page)
    await mockBackend(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: "Jerry Sipes' 80th Birthday" })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Leave a message' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'RSVP' })).toBeVisible()
    await expect(page.getByText(/RSVP for the party/i)).toBeVisible()

    expect(errors).toEqual([])
})

test('nav links reach the RSVP and Browse pages', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/')
    await page.getByRole('link', { name: 'RSVP', exact: true }).click()
    await expect(page).toHaveURL(/\/rsvp/)
    await expect(page.getByRole('button', { name: /Send RSVP/ })).toBeVisible()

    await page.getByRole('link', { name: 'Browse messages' }).click()
    await expect(page).toHaveURL(/\/browse/)
})
