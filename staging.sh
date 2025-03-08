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

#    # Step 4: Copy LICENSE.md
#    copy_license_file "$DEST_DIR"

    echo "Staging setup completed successfully!"
}

# Execute the staging setup
setup_staging
