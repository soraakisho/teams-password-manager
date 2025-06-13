# Teams Password Manager

A secure password manager for Microsoft Teams that allows you to safely store and manage your credentials within the Teams environment.

## Features

- 🔒 Secure credential storage using local storage
- 💪 Password strength indicator
- 👁️ Show/Hide password functionality
- 🔍 Search credentials
- 🎨 Clean, maroon-themed UI
- 📱 Responsive design
- 🤝 Microsoft Teams integration

## Local Development

1. Clone the repository
```bash
git clone https://github.com/soraakisho/teams-password-manager.git
cd teams-password-manager
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
node server.js
```

4. Open in your browser
```
http://localhost:3000
```

## Usage

1. **Adding Credentials**
   - Click on "Add Credential" tab
   - Fill in the name, username, and password
   - Password strength will be automatically calculated
   - Click "Save Credential"

2. **Viewing Credentials**
   - Click on "View Credentials" tab
   - Use the search bar to filter credentials
   - Use the show/hide button to reveal passwords
   - Delete unwanted credentials with the delete button

## Security

- Credentials are stored in browser's localStorage
- Passwords are never sent to any external servers
- Auto-logout functionality for security
- Teams SSO integration for authentication

## License

MIT License - feel free to use this project as you wish.

## Author

Sora Akisho
