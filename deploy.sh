#!/bin/bash

# Stop on error
set -e

echo "🔧 Building site..."
npm run build

echo "🚀 Syncing to S3..."
aws s3 sync dist/ s3://news.abquanta.com/ --delete

echo "✅ Deployment complete."
