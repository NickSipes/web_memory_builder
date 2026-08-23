import { test, expect } from '@playwright/test'
import { mockBackend, collectApiErrors } from './helpers'

test('landing is a hub: occasion + two clear actions, no API errors', async ({ page }) => {
    const errors = collectApiErrors(page)
    await mockBackend(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: "Jerry Sipes' Surprise 80th Birthday Party" })).toBeVisible()
    await expect(page.getByRole('link', { name: /Leave a message for Jerry/ })).toHaveAttribute('href', '/message')
    await expect(page.getByRole('link', { name: /Event details & RSVP/ })).toHaveAttribute('href', '/rsvp')
    // contact footer on every page
    await expect(page.getByText(/Reach out to John Sipes/)).toBeVisible()

    expect(errors).toEqual([])
})

test('landing buttons lead to the message and RSVP pages', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/')
    await page.getByRole('link', { name: /Leave a message for Jerry/ }).click()
    await expect(page).toHaveURL(/\/message/)
    await expect(page.getByLabel('Your name')).toBeVisible()

    await page.goto('/')
    await page.getByRole('link', { name: /Event details & RSVP/ }).click()
    await expect(page).toHaveURL(/\/rsvp/)
    // event details incl. the surprise-party logistics live here
    await expect(page.getByText(/Arrive by 4:45 PM/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Send RSVP/ })).toBeVisible()
})
