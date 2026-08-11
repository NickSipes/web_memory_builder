// Event details, in one place so the landing page and the RSVP page stay in sync.
export const EVENT = {
    title: "Jerry Sipes' 80th Birthday",
    date: "Saturday, October 17, 2026",
    shortDate: "October 17, 2026",
    city: "Eloy, AZ",
    time: "5:00 – 9:00 PM",
    venue: "St. Helen's of the Cross — Parish Hall",
    address: "205 W 8th St, Eloy, AZ 85231",
}

const MAP_QUERY = encodeURIComponent(`St Helen's of the Cross ${EVENT.address}`)
// Keyless Google Maps: `output=embed` works in an <iframe> without an API key.
export const MAP_EMBED_URL = `https://maps.google.com/maps?q=${MAP_QUERY}&z=15&output=embed`
export const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`

export const DIETARY_OPTIONS = [
    "No meat",
    "No fish",
    "No poultry",
    "No dairy",
    "Nut allergy",
    "Shellfish allergy",
]
