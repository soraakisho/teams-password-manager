function generatePassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

function checkPasswordStrength(password) {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        noCommonWords: !/password|123456|qwerty/i.test(password)
    };
    
    Object.values(checks).forEach(check => {
        if (check) strength += 20;
    });
    
    // Extra points for length
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 20;
    
    // Cap at 100
    return Math.min(100, strength);
}

function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    const meter = document.getElementById('passwordStrengthMeter');
    const text = document.getElementById('passwordStrengthText');
    
    meter.style.width = strength + '%';
    
    if (strength < 40) {
        meter.style.backgroundColor = '#ff4d4d';
        text.textContent = 'Weak';
    } else if (strength < 70) {
        meter.style.backgroundColor = '#ffd700';
        text.textContent = 'Moderate';
    } else {
        meter.style.backgroundColor = '#00cc44';
        text.textContent = 'Strong';
    }
    
    return strength;
}
