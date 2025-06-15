#!/bin/bash

# Stop on error
set -e

echo "🔧 Building site..."
npm run build

echo "🚀 Syncing to S3..."
aws s3 sync dist/ s3://your-bucket-name --delete --acl public-read

echo "✅ Deployment complete."
