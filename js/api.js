const API_BASE_URL = '/api';

const api = {
    async getCredentials() {
        const response = await fetch(`${API_BASE_URL}/credentials`);
        return await response.json();
    },

    async addCredential(credential) {
        const response = await fetch(`${API_BASE_URL}/credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credential)
        });
        return await response.json();
    }
};
