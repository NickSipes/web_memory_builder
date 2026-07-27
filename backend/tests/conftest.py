import os

# main.py runs create_all at import — keep it off the real Postgres
os.environ["DATABASE_URL"] = "sqlite://"
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")

import boto3
import pytest
from fastapi.testclient import TestClient
from moto import mock_aws
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import main
from database import Base
from main import app, get_db

TEST_BUCKET = "test-bucket"


@pytest.fixture
def db_session():
    # In-memory SQLite; StaticPool keeps one connection so the schema persists
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def mock_s3():
    # moto intercepts all boto3 S3 calls; rebuild s3 module's client under the mock
    with mock_aws():
        os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
        os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
        client = boto3.client("s3", region_name="us-east-1")
        client.create_bucket(Bucket=TEST_BUCKET)

        import s3
        s3.s3_client = client
        s3.BUCKET_NAME = TEST_BUCKET
        main.generate_presigned_get = s3.generate_presigned_get
        yield client
