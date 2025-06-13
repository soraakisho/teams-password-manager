class Auth {
    static isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static logout() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }

    static checkAuthStatus() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login.html';
        }
    }
}
