ADMIN = ("admin", "katienick")


def _create(client, **kw):
    body = {"name": "A", "relation": "Son", "type": "note", "content": "hi"}
    body.update(kw)
    return client.post("/submissions", json=body)


def test_create_submission_video(client):
    r = _create(client, type="video", content=None, s3_key="submissions/x/recording.webm")
    assert r.status_code == 200
    assert isinstance(r.json()["id"], int)
    assert r.json()["approved"] is False   # pending until an admin confirms


def test_create_submission_note(client):
    r = _create(client, content="Happy birthday!")
    assert r.status_code == 200
    assert r.json()["content"] == "Happy birthday!"


def test_create_submission_photo(client, mock_s3):
    r = _create(client, type="photo", content=None, s3_key="submissions/x/pic.jpg")
    assert r.status_code == 200
    assert r.json()["type"] == "photo"


def test_public_list_hides_unapproved(client):
    _create(client)
    assert client.get("/submissions").json() == []


def test_approve_makes_it_public(client, mock_s3):
    sid = _create(client, type="photo", content=None, s3_key="submissions/x/pic.jpg").json()["id"]
    client.post(f"/admin/submissions/{sid}/approve", auth=ADMIN)
    body = client.get("/submissions").json()
    assert len(body) == 1
    assert body[0]["approved"] is True
    assert body[0]["playback_url"] is not None   # photo gets a signed url too


def test_admin_list_shows_all(client):
    _create(client)
    _create(client)
    assert len(client.get("/admin/submissions", auth=ADMIN).json()) == 2


def test_admin_requires_auth(client):
    assert client.get("/admin/submissions").status_code == 401
    assert client.get("/admin/submissions", auth=("admin", "wrong")).status_code == 401


def test_approve_missing_returns_404(client):
    assert client.post("/admin/submissions/999/approve", auth=ADMIN).status_code == 404


def test_delete_note_submission(client):
    sid = _create(client).json()["id"]
    assert client.delete(f"/admin/submissions/{sid}", auth=ADMIN).status_code == 204
    assert client.get("/admin/submissions", auth=ADMIN).json() == []


def test_delete_media_removes_s3_object(client, mock_s3):
    key = "submissions/x/pic.jpg"
    mock_s3.put_object(Bucket="test-bucket", Key=key, Body=b"x")
    sid = _create(client, type="photo", content=None, s3_key=key).json()["id"]
    assert client.delete(f"/admin/submissions/{sid}", auth=ADMIN).status_code == 204
    # object is gone from S3
    import botocore
    try:
        mock_s3.head_object(Bucket="test-bucket", Key=key)
        assert False, "object should be deleted"
    except botocore.exceptions.ClientError:
        pass


def test_delete_requires_auth(client):
    sid = _create(client).json()["id"]
    assert client.delete(f"/admin/submissions/{sid}").status_code == 401


def test_delete_missing_returns_404(client):
    assert client.delete("/admin/submissions/999", auth=ADMIN).status_code == 404


def test_list_submissions_empty(client):
    assert client.get("/submissions").json() == []
