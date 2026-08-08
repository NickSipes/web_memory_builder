// Matches the SQLAlchemy Submission model
export interface Submission {
    id: number;
    name: string;
    relation: string;
    type: "video" | "photo" | "note";
    s3_key: string | null;
    content: string | null;
    created_at: string;
    approved: boolean;
    playback_url: string | null;   // signed GET url, generated per request
}

// Interface returned by /upload/presigned endpoint
export interface PresignedResponse {
    presigned_url: string;
    s3_key: string;
    content_type: string;
}

// Passed into POST /submissions after an upload
export interface SubmissionCreate {
    name: string;
    relation: string;
    type: "video" | "photo" | "note";
    s3_key?: string;
    content?: string;
}

export interface Rsvp {
    id: number;
    name: string;
    contact: string;        // email or phone
    attending: boolean;
    dietary: string[];
    created_at: string;
}

export interface RsvpCreate {
    name: string;
    contact: string;
    attending: boolean;
    dietary: string[];
}