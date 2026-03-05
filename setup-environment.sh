#!/bin/bash

# Automate environment setup

# Step 1: Git pull
echo "Pulling latest code..."
git pull

# Step 2: Install npm dependencies
echo "Installing npm dependencies..."
npm ci

# Step 3: Generate Prisma client
echo "Generating Prisma client..."
prisma generate

# Step 4: Run Prisma migrations
echo "Running Prisma migrations..."
prisma migrate dev

# Step 5: Validate the database
echo "Validating the database..."
# Add your database validation commands here

echo "Environment setup completed!"