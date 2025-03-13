#!/bin/bash

# Exit on any error
set -e

# Make staging directory
DEST_DIR="staging"

# Function to create package.json
create_package_json() {
    local dest="$1"
    local package_json_path="$dest/package.json"

    cat <<EOF > "$package_json_path"
{
    "name": "future-net-solutions-staging",
    "version": "1.0.0",
    "description": "Staging environment for Future Net Solutions",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "ejs": "^3.1.9",
        "dotenv": "^16.4.5"
    },
    "devDependencies": {
        "nodemon": "^3.0.3"
    }
}
EOF
    echo "Created package.json at: $package_json_path"
}

# Function to create CNAME file with HOSTNAME from environment
create_cname_file() {
    local dest="$1"
    local hostname="${HOSTNAME:-futurenettelecomsolutions.com}" # Default if HOSTNAME not set
    local cname_path="$dest/CNAME"

    echo "$hostname" > "$cname_path" || { echo "Error creating CNAME file"; exit 1; }
    echo "Created CNAME file with hostname \"$hostname\" at: $cname_path"
}

# Function to copy LICENSE.md
copy_license_file() {
    local dest="$1"
    local src_license_path="$(pwd)/LICENSE.md"
    local dest_license_path="$dest/LICENSE.md"

    cp "$src_license_path" "$dest_license_path" || { echo "Error copying LICENSE.md"; exit 1; }
    echo "Copied LICENSE.md to: $dest_license_path"
}

# Function to create github-pages-staging.yml file
create_github_pages_file() {
    local dest="$1"
    local github_pages_path="$dest/.github/workflows/github-pages-staging.yml"
    mkdir -p $(dirname "$github_pages_path")
    cat  > "$github_pages_path" <<EOF
name: 'Deploy GitHub Pages'
env:
  TZ: 'America/New_York'

on:
  push:
    branches:
      - 'github-pages'

permissions:
  contents: write # Needed for GitHub Pages deployment
#  pages: write    # Needed for GitHub Pages artifact upload
  id-token: write # Needed for Pages deployment verification

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout deployment repository
        uses: actions/checkout@v3
        with:
          ref: main
          repository: FutureNet-Telecom-Solutions-Inc/FutureNet-Telecom-Solutions-Inc.github.io

      - name: Setup Github Pages
        if: success()
        uses: actions/configure-pages@v3
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to GitHub Pages
        if: success()
        id: deployment
        uses: actions/deploy-pages@v4
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Output deployment URL
        if: success()
        run: echo "Deployed to ${{ steps.deployment.outputs.page_url }}"

EOF
    echo "Created github-pages-staging.yml at: $github_pages_path"
}

create_simple_readme() {
    local dest="$1"
    local readme_path="$dest/README.md"

    cat <<EOF > "$readme_path"
# FutureNet Telecom Solutions Inc.

This is the staging environment for FutureNet Telecom Solutions Inc.
The production environment can be found at [futurenettelecomsolutions.com](https://futurenettelecomsolutions.com).

EOF
    echo "Created README.md at: $readme_path"
}


# Main setup function
setup_staging() {
    echo "Starting staging setup..."

    # Step 1: Copy public directory (excluding scss)
    cp -r public "$DEST_DIR"
    rm -rf "$DEST_DIR/assets/scss"

#    cp -r .github/_config.yml "$DEST_DIR"

#    # Step 2: Create package.json
#    create_package_json "$DEST_DIR"

    # Step 3: Create CNAME file
    create_cname_file "$DEST_DIR"

    # Step 4: Copy LICENSE.md
    copy_license_file "$DEST_DIR"

    # Step 5: Create github-pages-staging.yml file
   # create_github_pages_file "$DEST_DIR"

    # Step 6: Create README.md
    create_simple_readme "$DEST_DIR"

    echo "Staging setup completed successfully!"
}

# Execute the staging setup
setup_staging
