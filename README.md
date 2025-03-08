
# FutureNet Telecom Solutions Inc. Website

Welcome to the official repository for the FutureNet Telecom Solutions Inc. website. This document provides an overview, setup instructions, and key information for the owner and team members to manage and contribute to the project.

## Overview

This repository contains the source code for our company website, built with Node.js and Express. It serves as the digital face of FutureNet Telecom Solutions Inc., showcasing our services, features, and contact information. The site uses EJS for templating, custom logging, SSL for secure connections in production, and high-resolution icons to represent our offerings.

### Key Features
- **Services & Features**: Highlights our offerings like Fiber Optic Installation, 5G Network Infrastructure, and 24/7 Support, with custom-designed icons.
- **Security**: Implements Helmet middleware for content security and HTTPS in production.
- **Logging**: Custom Winston-based logging with daily rotation (`combined-%DATE%.log`, `error.log`, `exceptions-%DATE%.log`).
- **License**: All content is proprietary under an "All Rights Reserved" license (see `LICENSE.md`).

## Project Structure

```
Future-Net-Solutions/
├── certs/                              # Directory for SSL certificate files (localhost.key.pem, localhost.x509.crt, ca.crt)
├── config/                             # Configuration files for the application
│   └── siteConfig.js                   # Defines site-wide settings (e.g., theme colors, content structure) from YAML or hardcoded data
├── controllers/                        # Logic for handling requests and rendering views
│   └── siteController.js               # Main controller with functions for home, services, careers, contact, and about pages
├── docs/                               # Documentation files (e.g., API specs, database schema, project notes)
│   ├── FutureNetTelecomSolutionsInc.yaml # Site content structure in YAML format (e.g., homepage, services, careers, etc)
├── middleware/                         # Custom Express middleware for request processing
│   └── security.js                     # Implements security features (Helmet) and HTTP logging with Morgan and custom logger
├── public/                             # Static assets served by Express
│   ├── assets/                         # Subdirectory for organized assets
│   │   ├── css/                        # Compiled CSS files for styling
│   │   │   ├── styles.css              # Base styles compiled from styles.scss
│   │   │   ├── header.css              # Header-specific styles compiled from header.scss
│   │   │   ├── footer.css              # Footer-specific styles compiled from footer.scss
│   │   │   ├── homepage.css            # Homepage-specific styles compiled from homepage.scss
│   │   │   └── error.css               # Error page styles compiled from error.scss
│   │   ├── scss/                       # SCSS source files for modular styling
│   │   │   ├── _variables.scss         # Centralized SCSS variables (e.g., colors: #0078D4, #00CC66)
│   │   │   ├── styles.scss             # Base SCSS importing _variables.scss for global styles
│   │   │   ├── header.scss             # SCSS for header, imports _variables.scss
│   │   │   ├── footer.scss             # SCSS for footer, imports _variables.scss
│   │   │   ├── homepage.scss           # SCSS for homepage, imports _variables.scss
│   │   │   └── error.scss              # SCSS for error pages, imports _variables.scss
│   │   ├── js/                         # Client-side JavaScript files (currently empty, for future interactivity)
│   │   ├── img/                        # Images, including high-res icons (e.g., fiber-optic.png)
│   │   └── fonts/                      # Custom fonts (e.g., Roboto, sans-serif) if used
│   └── uploads/                        # Directory for user-uploaded files (currently unused, reserved for future features)
├── routes/                             # Express route definitions
│   └── index.js                        # Defines routes (e.g., GET /, /services) and maps to siteController functions
├── scripts/                            # Standalone scripts for project tasks
│   └── generate-ssl.js                 # Script to trigger sslGenerator.js for certificate creation (e.g., npm run generate:ssl)
├── tests/                              # Test suite for the application
│   └── server.test.js                  # Unit/integration tests for server.js and routes (e.g., Jest)
├── utils/                              # Utility modules for reusable functionality
│   ├── logger.js                       # Custom Winston logger with daily rotation (combined, error, exceptions logs)
│   ├── sslOptions.js                   # Configures SSL options (key, cert, ca) and server settings (port, hostname)
│   └── sslGenerator.js                 # Module to generate SSL certificates using OpenSSL for production HTTPS
├── views/                              # EJS templates for dynamic HTML rendering
│   ├── partials/                       # Reusable template fragments
│   │   ├── header.ejs                  # Header template with logo, navigation, and contact info
│   │   └── footer.ejs                  # Footer template with copyright, social links, and address
│   └── pages/                          # Full page templates
│       ├── home.ejs                    # Homepage with hero section and feature icons
│       ├── services.ejs                # Services page listing categories and descriptions
│       ├── careers.ejs                 # Careers page with job openings and benefits
│       ├── contact.ejs                 # Contact page with form and location details
│       └── about.ejs                   # About page with mission, history, and team info
├── .github/                            # GitHub-specific configuration files
├── .npm/                               # npm cache directory (auto-generated, typically ignored)
├── .babelrc                            # Babel configuration for transpiling JavaScript (e.g., ES6 to ES5)
├── .env                                # Environment variables (e.g., NODE_ENV, PORT, HOSTNAME); not tracked in Git
├── .eslintrc.json                      # ESLint configuration for code linting (JSON format)
├── .gitignore                          # Specifies files/directories to ignore (e.g., node_modules, .env, logs/)
├── .npmrc                              # npm configuration (e.g., custom registry or settings, optional)
├── eslint.config.mjs                   # Modern ESLint configuration (module format, optional if using .eslintrc.json)
├── LICENSE.md                          # License information for the project (e.g., MIT, Apache 2.0)
├── package.json                        # Project metadata, dependencies (e.g., express, winston), and scripts (e.g., dev, start)
├── project.txt                         # Original project structure file (this file, for reference)
├── README.md                           # Project overview, setup instructions, and development notes
└── server.js                           # Main entry point, sets up Express app, middleware, routes, and HTTP/HTTPS server
```

## Prerequisites

- **Node.js**: Version 23.7.0 or later (download from [nodejs.org](https://nodejs.org)).
- **npm**: Included with Node.js.
- **OpenSSL**: Required for SSL certificate generation (install via package manager, e.g., `sudo apt-get install openssl` on Ubuntu).

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd futurenet_telecom_solutions_inc_nodejs
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
    - Create a `.env` file in the root directory based on `.env.example` (if provided) or use these defaults:
      ```
      NODE_ENV=development
      PORT=3000
      HOSTNAME=localhost
      CERTS_DIR=certs
      ORGANIZATION="FutureNet Telecom Solutions Inc."
      LOG_LEVEL=info
      ```
    - For production, set `NODE_ENV=production` and `PORT=443` (requires permissions, see below).

4. **Generate SSL Certificates (Development Only. Production will defer to official certificate authority)**
    - Run the SSL generation script:
      ```bash
      npm run generate:ssl
      ```
    - This creates `certs/localhost.key.pem`, `certs/localhost.x509.crt`, and `certs/ca.crt`.

5. **Run the Server**
    - Development mode:
      ```bash
      npm run dev
      ```
        - Access at `http://localhost:3000`.
    - Production mode (requires port 443 permissions):
      ```bash
      NODE_ENV=production npm start
      ```
        - Access at `https://localhost:443`.
        - **Note**: Port 443 requires root privileges or `setcap` (see "Running in Production" below).

## Running in Production

- **Port 443 Permissions**:
    - Option 1: Run with `sudo` (not recommended for long-term):
      ```bash
      sudo NODE_ENV=production npm start
      ```
    - Option 2: Use `setcap` to grant Node.js port-binding privileges:
      ```bash
      sudo setcap 'cap_net_bind_service=+ep' /usr/local/bin/node
      NODE_ENV=production npm start
      ```
    - Option 3: Use a reverse proxy (e.g., Nginx) to forward 443 to a non-privileged port (e.g., 8443).

- **SSL Certificates**: Ensure `certs/` contains valid certificates before running in production.

## Logging

- Create log directory in the root of the project:
    ```bash
    mkdir logs
    ```
  
- Logs are stored in the `logs/` directory:
    - `combined-%DATE%.log`: Info and debug logs with daily rotation (14 days).
    - `error.log`: Error logs (non-rotating).
    - `exceptions-%DATE%.log`: Uncaught exceptions (30 days).

- Logs include `[file:lineNumber]` for traceability (e.g., `[server.js:45]`).

## Icons

- High-resolution icons (512x512 or 1024x1024) for features and services are in `public/assets/img/favicon_io/`.
- Examples:
    - `fiber-optic.png`: Glowing blue/green fiber optic cable.
    - `5g-network.png`: Blue 5G tower with green signal waves.
    - See `icon_descriptions.yaml` for full design details.

## License

This repository is proprietary and confidential under an "All Rights Reserved" license. See `LICENSE.md` for details. Unauthorized use, copying, modification, or distribution is strictly prohibited without written consent from FutureNet Telecom Solutions Inc.

## Contributing

- **Internal Use Only**: Contributions are limited to authorized team members.
- Contact the IT department or repository owner for access or changes.
- Use feature branches and pull requests for updates:
  ```bash
  git checkout -b feature/your-change
  git push origin feature/your-change
  ```

## Troubleshooting

- **EACCES Error on Port 443**: See "Running in Production" for solutions.
- **Missing Certificates**: Run `npm run generate:ssl` or check `certs/` directory.
- **Logs Not Generating**: Verify `LOG_LEVEL` in `.env` (e.g., `info`, `debug`).

## Contact

For questions, permissions, or support:
- **Email**: info@futurenettelecomsolution.com
- **Address**: 123 Telecom Drive, Network City, NC 27513, USA

---
1. Create a TXT record in your DNS configuration for the following hostname: _github-pages-challenge-dellius-alexander.futurenettelecomsolution.com
2. Use this code for the value of the TXT record: 76d84acf83dd80e00f751093d86c06
3. Wait until your DNS configuration changes. This could take up to 24 hours to propagate.
