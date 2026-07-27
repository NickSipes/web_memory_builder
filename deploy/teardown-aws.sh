#!/usr/bin/env bash
# Tears down the Jerry birthday site AWS resources. Run after the party.
# Requires the jerry-deploy AWS CLI profile. Irreversible.
set -uo pipefail
REGION=us-east-1

echo "Deleting App Runner service..."
aws apprunner delete-service --service-arn "arn:aws:apprunner:us-east-1:842712741261:service/jerry-backend/189f6751a61647009646a45fab7c13e1" --region $REGION 2>/dev/null

echo "Deleting Amplify app (frontend)..."
aws amplify delete-app --app-id "d1yykjqf4v9cl" --region $REGION 2>/dev/null

echo "Deleting RDS database (skips final snapshot)..."
aws rds delete-db-instance --db-instance-identifier "jerry-memory-db" --skip-final-snapshot --delete-automated-backups --region $REGION 2>/dev/null

echo "Deleting VPC connector..."
aws apprunner delete-vpc-connector --vpc-connector-arn "arn:aws:apprunner:us-east-1:842712741261:vpcconnector/jerry-connector/1/19640613ce684055b761aa2b8a23e6ad" --region $REGION 2>/dev/null

echo "Deleting ECR repo (images)..."
aws ecr delete-repository --repository-name "jerry-backend" --force --region $REGION 2>/dev/null

echo "NOTE: leaves in place (delete by hand if you want them gone):"
echo "  - RDS subnet group 'jerry-db-subnets' (after the DB finishes deleting)"
echo "  - security groups sg-0086d15aa01e92495, sg-08c0f23f3ecbc70f9 (after the DB/connector are gone)"
echo "  - IAM roles jerry-apprunner-ecr, jerry-apprunner-instance"
echo "  - the uploads bucket 'jerry-memory-builder' and its videos/photos (KEEP until Jerry has them!)"
echo "  - the jerry-deploy IAM user (delete once you're done deploying)"
echo "Done."
