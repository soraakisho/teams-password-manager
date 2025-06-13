// Global variables
let currentUser = null;
let currentUserEmail = null;
let teamsContext = null;
let passwords = new Map();
let users = new Map();
let isAdmin = false;

// UI Functions
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
        const pwd = passwords.get(id);
        if (pwd) {
            passwordElem.textContent = pwd.password;
            passwordElem.style.fontFamily = 'monospace';
            button.textContent = '👁️ Hide';
        }
    }
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Function to show modal
function showAddPasswordModal() {
    const modal = document.getElementById('addPasswordModal');
    modal.style.display = 'block';
}

// Function to hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Function to show tab
function showTab(tabName, element) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab and content
    element.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Function to save password
async function savePassword(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check password strength before saving
    const strength = checkPasswordStrength(password);

    const id = Date.now().toString();
    const newPassword = {
        id,
        title,
        url,
        username,
        password,
        strength,
        category: 'General',
        createdAt: new Date().toISOString()
    };

    // Add to passwords map and save
    passwords.set(id, newPassword);

    // Try to save to MongoDB API first
    try {
        await apiCall('/passwords', {
            method: 'POST',
            body: JSON.stringify(newPassword)
        });
        console.log('✅ Password saved to MongoDB');
    } catch (error) {
        console.log('⚠️ Falling back to localStorage:', error.message);
        // Fallback to localStorage
        const passwordData = Object.fromEntries(passwords);
        localStorage.setItem(`passwords_${currentUserEmail}`, JSON.stringify(passwordData));
    }

    // Update UI
    hideModal('addPasswordModal');
    renderPasswords();
    updateStats();
    showNotification('✅ Password saved successfully!', 'success');

    // Clear form
    event.target.reset();
}

// Show/hide password in list
function togglePasswordVisibility(id) {
    const passwordSpan = document.getElementById(`password-${id}`);
    const password = passwords.get(id)?.password;
    
    if (passwordSpan.textContent === '••••••••') {
        passwordSpan.textContent = password;
    } else {
        passwordSpan.textContent = '••••••••';
    }
}

// Copy password to clipboard
async function copyPassword(id) {
    const password = passwords.get(id)?.password;
    if (password) {
        try {
            await navigator.clipboard.writeText(password);
            showNotification('✅ Password copied to clipboard!', 'success');
        } catch (error) {
            showNotification('❌ Failed to copy password', 'error');
        }
    }
}

// Edit password
function editPassword(id) {
    const password = passwords.get(id);
    if (password) {
        document.getElementById('title').value = password.title;
        document.getElementById('url').value = password.url;
        document.getElementById('username').value = password.username;
        document.getElementById('password').value = password.password;
        
        // Check and show strength for existing password
        const strength = checkPasswordStrength(password.password);
        updatePasswordStrength(strength);
        
        showAddPasswordModal();
        
        // Store ID for update
        document.getElementById('editPasswordId').value = id;
    }
}

// Delete password
async function deletePassword(id) {
    if (confirm('Are you sure you want to delete this password?')) {
        try {
            await apiCall(`/passwords/${id}`, {
                method: 'DELETE'
            });
            console.log('✅ Password deleted from MongoDB');
        } catch (error) {
            console.log('⚠️ Falling back to localStorage:', error.message);
        }
        
        passwords.delete(id);
        const passwordData = Object.fromEntries(passwords);
        localStorage.setItem(`passwords_${currentUserEmail}`, JSON.stringify(passwordData));
        
        renderPasswords();
        updateStats();
        showNotification('✅ Password deleted successfully!', 'success');
    }
}

// Share password
function sharePassword(id) {
    showNotification('🔄 Sharing feature coming soon!', 'info');
}

// Show notification
function showNotification(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

// Active cleanup of sample data
function ACTIVELY_REMOVE_SAMPLE_DATA() {
    if (!passwords || passwords.size === 0) return;
    
    let removed = 0;
    for (const [id, password] of passwords) {
        const isSampleData = 
            password.title.toLowerCase().includes('gmail') ||
            password.title.toLowerCase().includes('linkedin') ||
            password.title.toLowerCase().includes('azure') ||
            password.title.toLowerCase().includes('portal') ||
            password.title.toLowerCase().includes('account') ||
            password.title.toLowerCase().includes('demo') ||
            password.title.toLowerCase().includes('sample') ||
            password.title.toLowerCase().includes('test') ||
            password.username.includes('demo') ||
            password.username.includes('sample') ||
            password.username.includes('test') ||
            password.username.includes('n.cuerpo') ||
            password.username === 'user@example.com' ||
            password.username === 'john.smith@company.com' ||
            password.username === 'jane.doe@company.com';
        
        if (isSampleData) {
            passwords.delete(id);
            removed++;
        }
    }
    
    if (removed > 0) {
        console.log(`🧹 Actively removed ${removed} sample data entries`);
        const passwordData = Object.fromEntries(passwords);
        localStorage.setItem(`passwords_${currentUserEmail}`, JSON.stringify(passwordData));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up form submission
    const form = document.querySelector('#addPasswordModal form');
    if (form) {
        form.onsubmit = savePassword;
    }
    
    // Set up search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = filterPasswords;
    }
    
    // Auto authenticate
    autoAuthenticate();
    
    // Initialize password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const strength = checkPasswordStrength(passwordInput.value);
            updatePasswordStrength(strength);
        });
    }
});
