document.addEventListener('DOMContentLoaded', () => {
    const passwordField = document.getElementById('password');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatchText = document.getElementById('passwordMatch');
    const confirmPasswordField = document.getElementById('confirm_password');

    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&#]/.test(password)) strength++;
        return strength;
    }
    
    function updatePasswordStrengthMessage(strength) {
        const messages = [
            { text: 'Força: Muito Fraca', color: 'red' },
            { text: 'Força: Fraca', color: 'orange' },
            { text: 'Força: Média', color: 'yellow' },
            { text: 'Força: Boa', color: 'lightgreen' },
            { text: 'Força: Forte', color: 'green' }
        ];
        passwordStrength.textContent = messages[strength].text;
        passwordStrength.style.color = messages[strength].color;
    }
    
    function checkPasswordMatch(password, confirmPassword) {
        if (confirmPassword !== password) {
            confirmPasswordField.setCustomValidity('As senhas não coincidem.');
            passwordMatchText.textContent = 'As senhas não coincidem.';
            passwordMatchText.style.color = 'red';
        } else {
            confirmPasswordField.setCustomValidity('');
            passwordMatchText.textContent = '';
            passwordMatchText.style.color = 'green';
        }
    }
    
    passwordField.addEventListener('input', function () {
        const password = passwordField.value;
        const strength = checkPasswordStrength(password);
        updatePasswordStrengthMessage(strength);
    });
    
    document.getElementById('registerForm').addEventListener('input', function () {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        checkPasswordMatch(password, confirmPassword);
    });
});