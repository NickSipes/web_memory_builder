ADMIN = ("admin", "katienick")


def test_create_bug_report(client):
    r = client.post("/bug-reports", json={"name": "Dad", "description": "Can't leave a note-only message."})
    assert r.status_code == 200
    body = r.json()
    assert body["description"] == "Can't leave a note-only message."
    assert body["name"] == "Dad"


def test_create_bug_report_anonymous(client):
    r = client.post("/bug-reports", json={"description": "Something is broken."})
    assert r.status_code == 200
    assert r.json()["name"] is None


def test_bug_reports_are_admin_only(client):
    client.post("/bug-reports", json={"description": "x"})
    assert client.get("/admin/bug-reports").status_code == 401


def test_admin_lists_and_deletes_bug_reports(client):
    rid = client.post("/bug-reports", json={"description": "fix me"}).json()["id"]
    assert len(client.get("/admin/bug-reports", auth=ADMIN).json()) == 1
    assert client.delete(f"/admin/bug-reports/{rid}", auth=ADMIN).status_code == 204
    assert client.get("/admin/bug-reports", auth=ADMIN).json() == []
