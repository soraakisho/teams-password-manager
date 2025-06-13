function checkPasswordStrength(password) {
    if (!password) return { strength: 'invalid', message: 'Password is required' };
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 'weak';
    let message = 'Password is too weak';

    if (isLongEnough && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars) {
        strength = 'strong';
        message = 'Strong password';
    } else if (isLongEnough && (hasUppercase || hasLowercase) && (hasNumbers || hasSpecialChars)) {
        strength = 'medium';
        message = 'Medium strength - add more character types';
    }

    return { strength, message };
}

function updatePasswordStrength(password) {
    const strengthMeter = document.querySelector('.password-strength-meter');
    const strengthText = document.querySelector('.password-strength-text');
    
    if (!strengthMeter || !strengthText) return;

    const { strength, message } = checkPasswordStrength(password);
    
    // Remove all classes
    strengthMeter.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    // Add new class
    strengthMeter.classList.add(strength);
    strengthText.classList.add(strength);
    
    // Update text
    strengthText.textContent = message;
}

// Update password input to trigger strength check
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }
});
