import os
import uuid
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()

# Get variables from env file. ACCESS_KEY_ID and SECRET_ACCESS_KEY are 
# automatically read.
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
REGION = os.getenv("AWS_REGION")
# Use the regional endpoint (bucket.s3.<region>.amazonaws.com). The global
# endpoint (bucket.s3.amazonaws.com) doesn't return CORS headers for browser
# fetch(), which breaks client-side downloads. Media <video>/<img> tags aren't
# affected (they skip CORS), so this only surfaced once we added zip downloads.
_endpoint = f"https://s3.{REGION}.amazonaws.com" if REGION else None
s3_client = boto3.client(
    "s3",
    region_name=REGION,
    endpoint_url=_endpoint,
    # virtual-hosted addressing => bucket.s3.<region>.amazonaws.com, which is the
    # form browsers get CORS headers from (path-style regional does not).
    config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
)

def generate_presigned_put(filename: str, content_type: str = "application/octet-stream", expires_in: int =3600) -> dict:
    """
    Returns a URL the browser can PUT a file to, plus the S3 key where it will land.
    The key is the object's 'path' inside the bucket.
    """
    # uuid4() ensures no two uploads ever collied, event with the same filename
    key = f"submissions/{uuid.uuid4()}/{filename}"

    url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": key,
            "ContentType": content_type},
        ExpiresIn=expires_in,
    )
    return {"presigned_url": url, "s3_key": key, "content_type": content_type}

def delete_object(s3_key: str) -> None:
    """Remove an object from the bucket (used when an admin rejects/deletes)."""
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=s3_key)


def generate_presigned_get(s3_key: str, expires_in: int = 3600) -> str:
    """
    Returns a URL someone can GET (stream/download) a specific object.
    This will be used to make stored videos playable
    """
    return s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": BUCKET_NAME, "Key": s3_key},
        ExpiresIn=expires_in,
    )
