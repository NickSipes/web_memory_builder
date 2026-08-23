// Props interface - defines what this components needs form its parent
interface RelationSelectProps {
    value: string
    onChange: (value: string) => void // a function that receives a string and returns nothing
}

const RELATIONS = [
    "Son",
    "Daughter",
    "Son-in-law",
    "Daughter-in-law",
    "Grandchild",
    "Great-grandchild",
    "Brother",
    "Sister",
    "Navy Buddy",
    "Church Member",
    "Friend",
    "Other",
]

// Destructure props directly in the parameter - cleaner than writing props.value
export default function RelationSelect({ value, onChange }: RelationSelectProps) {
    return (
        <select
            id="relation-select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>Your relation to Jerry...</option>
            {RELATIONS.map((r) => (
                // key is required when rendering lists - React uses it to track
                // which elements changed between renders
                <option key={r} value={r}>{r}</option>
            ))}
        </select>
    )
}