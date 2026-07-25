import re


def test_generate_presigned_put_returns_url(mock_s3):
    from s3 import generate_presigned_put
    out = generate_presigned_put("recording.webm")
    assert set(out) >= {"presigned_url", "s3_key", "content_type"}
    assert out["presigned_url"].startswith("http")


def test_generate_presigned_put_unique_keys(mock_s3):
    from s3 import generate_presigned_put
    a = generate_presigned_put("recording.webm")
    b = generate_presigned_put("recording.webm")
    assert a["s3_key"] != b["s3_key"]


def test_generate_presigned_get_returns_url(mock_s3):
    from s3 import generate_presigned_get
    url = generate_presigned_get("submissions/abc/recording.webm")
    assert isinstance(url, str) and url.startswith("http")


def test_s3_key_format(mock_s3):
    from s3 import generate_presigned_put
    key = generate_presigned_put("recording.webm")["s3_key"]
    assert re.fullmatch(r"submissions/[0-9a-f-]{36}/recording\.webm", key)
