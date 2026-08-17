ADMIN = ("admin", "katienick")


def test_create_rsvp(client):
    r = client.post("/rsvps", json={
        "name": "Aunt May", "contact": "may@example.com",
        "attending": True, "guests": 2, "dietary": ["No meat", "Nut allergy"],
    })
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "Aunt May"
    assert body["dietary"] == ["No meat", "Nut allergy"]
    assert body["attending"] is True
    assert body["guests"] == 2


def test_create_rsvp_minimal(client):
    r = client.post("/rsvps", json={"name": "Bob", "contact": "555-1234"})
    assert r.status_code == 200
    assert r.json()["attending"] is True      # defaults to attending
    assert r.json()["guests"] == 0            # defaults to no extra guests
    assert r.json()["dietary"] == []


def test_create_rsvp_without_contact(client):
    # contact is optional — name alone is enough
    r = client.post("/rsvps", json={"name": "Just A Name", "attending": False})
    assert r.status_code == 200
    assert r.json()["name"] == "Just A Name"
    assert r.json()["contact"] == ""


def test_rsvps_are_admin_only(client):
    client.post("/rsvps", json={"name": "Bob", "contact": "x"})
    assert client.get("/admin/rsvps").status_code == 401
    assert client.get("/admin/rsvps", auth=("admin", "wrong")).status_code == 401


def test_admin_lists_rsvps(client):
    client.post("/rsvps", json={"name": "A", "contact": "a@x.com", "dietary": ["Dairy"]})
    client.post("/rsvps", json={"name": "B", "contact": "555", "attending": False})
    body = client.get("/admin/rsvps", auth=ADMIN).json()
    assert len(body) == 2
    dietary_for_a = next(r["dietary"] for r in body if r["name"] == "A")
    assert dietary_for_a == ["Dairy"]


def test_delete_rsvp(client):
    rid = client.post("/rsvps", json={"name": "Dupe", "contact": "x"}).json()["id"]
    assert client.delete(f"/admin/rsvps/{rid}", auth=ADMIN).status_code == 204
    assert client.get("/admin/rsvps", auth=ADMIN).json() == []


def test_delete_rsvp_requires_auth(client):
    rid = client.post("/rsvps", json={"name": "Dupe", "contact": "x"}).json()["id"]
    assert client.delete(f"/admin/rsvps/{rid}").status_code == 401
