'use strict';

// Constants
const STORAGE_KEY = 'teams_password_manager_credentials';
const PASSWORD_MIN_LENGTH = 8;

// Initialize Teams SDK
microsoftTeams.initialize();

// Secure storage for credentials with encryption
class SecureStorage {
    static encrypt(text) {
        // Simple encryption for demo - in production use a proper encryption library
        return btoa(text);
    }

    static decrypt(text) {
        // Simple decryption for demo
        return atob(text);
    }

    static saveCredentials(credentials) {
        const encrypted = this.encrypt(JSON.stringify(Array.from(credentials.entries())));
        localStorage.setItem(STORAGE_KEY, encrypted);
    }

    static loadCredentials() {
        try {
            const encrypted = localStorage.getItem(STORAGE_KEY);
            if (!encrypted) return new Map();
            const decrypted = this.decrypt(encrypted);
            return new Map(JSON.parse(decrypted));
        } catch (error) {
            console.error('Error loading credentials:', error);
            return new Map();
        }
    }
}

// Initialize credentials from secure storage
const credentials = SecureStorage.loadCredentials();

// Function to generate a secure unique ID
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength++;
    
    return {
        score: strength,
        text: ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][strength - 1] || 'Very Weak',
        color: ['#ff0000', '#ff4500', '#ffa500', '#9acd32', '#008000'][strength - 1] || '#ff0000'
    };
}

// UI Functions
function updatePasswordStrength(password) {
    const strengthMeter = document.getElementById('passwordStrengthMeter');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!strengthMeter || !strengthText) return;
    
    const strength = checkPasswordStrength(password);
    strengthMeter.style.width = `${(strength.score / 5) * 100}%`;
    strengthMeter.style.backgroundColor = strength.color;
    strengthText.textContent = strength.text;
    strengthText.style.color = strength.color;
}

function showAddPasswordModal() {
    const modal = document.getElementById('addPasswordModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Function to show/hide password
function togglePasswordVisibility(id) {
    const passwordElem = document.getElementById(`password-${id}`);
    const button = document.querySelector(`button[onclick="togglePasswordVisibility('${id}')"]`);
    
    if (passwordElem.style.fontFamily === 'monospace') {
        passwordElem.textContent = '••••••••';
        passwordElem.style.fontFamily = 'inherit';
        button.textContent = '👁️ Show';
    } else {
        const cred = credentials.get(id);
        if (cred) {
            passwordElem.textContent = cred.password;
            passwordElem.style.fontFamily = 'monospace';
            button.textContent = '👁️ Hide';
        }
    }
}

// Function to show tab
function showTab(tabName, element) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    element.classList.add('active');
    const tabContent = document.getElementById(`${tabName}Tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    if (tabName === 'view') {
        renderCredentials();
    }
}

// Save credential
function saveCredential(event) {
    event.preventDefault();
    
    const name = document.getElementById('credentialName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!name || !username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    const id = generateId();
    credentials.set(id, { name, username, password });
    SecureStorage.saveCredentials(credentials);
    
    // Clear form
    document.getElementById('credentialForm').reset();
    
    // Update view
    renderCredentials();
    showTab('view', document.querySelector('[onclick="showTab(\'view\', this)"]'));
}

// Delete credential
function deleteCredential(id) {
    if (confirm('Are you sure you want to delete this credential?')) {
        credentials.delete(id);
        SecureStorage.saveCredentials(credentials);
        renderCredentials();
    }
}

// Load saved credentials from localStorage
function loadCredentials() {
    try {
        const saved = localStorage.getItem('credentials');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.entries(parsed).forEach(([id, cred]) => {
                credentials.set(id, cred);
            });
        }
    } catch (error) {
        console.error('Error loading credentials:', error);
    }
}

// Render credentials list
function renderCredentials() {
    const container = document.getElementById('credentialsList');
    if (!container) return;
    
    if (credentials.size === 0) {
        container.innerHTML = '<p class="empty-state">No credentials saved yet.</p>';
        return;
    }
    
    const html = Array.from(credentials.entries()).map(([id, cred]) => `
        <div class="credential-item">
            <div class="credential-info">
                <h3>${cred.name}</h3>
                <p>Username: ${cred.username}</p>
                <p>Password: <span id="password-${id}">••••••••</span></p>
            </div>
            <div class="credential-actions">
                <button onclick="togglePasswordVisibility('${id}')">👁️ Show</button>
                <button onclick="deleteCredential('${id}')" class="delete">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCredentials();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => updatePasswordStrength(e.target.value));
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterCredentials, 300));
    }
}

// Debounce function for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
