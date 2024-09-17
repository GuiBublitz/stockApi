document.addEventListener('DOMContentLoaded', () => {
    let usernameInputEl = document.getElementById('username-input');
    let passwordInputEl = document.getElementById('password-input');
    let errorMessageEl  = document.getElementById('error-message');

    if (document.querySelector('.error')) passwordInputEl.focus();
    
    window.removeErrorUi = () => {
      if (usernameInputEl.parentElement.classList.contains('error')) usernameInputEl.parentElement.classList.remove('error');
      if (passwordInputEl.parentElement.classList.contains('error')) passwordInputEl.parentElement.classList.remove('error'); 
      if (errorMessageEl) errorMessageEl.remove();
    }
})