import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const closeBtn = document.querySelector('.close-btn');

    const loginFormEl = document.getElementById('login');
    const signupFormEl = document.getElementById('signup');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    
    const adminPanelLink = document.getElementById('admin-panel-link');

    // Função para atualizar a UI com base no estado de login
    const updateUIForUser = async (user) => {
        if (user) {
            // 1. Usuário está logado, muda o botão para "Logout"
            loginBtn.textContent = 'Logout';

            // 2. Verifica a role do usuário no Firestore
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    // 3. Se for admin, mostra o painel
                    adminPanelLink.style.display = 'block';
                } else {
                    // 4. Se não for admin, esconde o painel
                    adminPanelLink.style.display = 'none';
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                adminPanelLink.style.display = 'none';
            }
        } else {
            // 5. Ninguém logado, estado padrão
            loginBtn.textContent = 'Login';
            adminPanelLink.style.display = 'none';
        }
    };

    // Listener principal do Firebase: reage a login/logout em tempo real
    onAuthStateChanged(auth, (user) => {
        updateUIForUser(user);
    });

    // Evento do botão Login/Logout
    loginBtn.addEventListener('click', () => {
        if (auth.currentUser) {
            // Se já tem usuário logado, faz logout
            signOut(auth).catch(error => console.error("Erro no logout:", error));
        } else {
            // Se não, abre o modal de login
            modal.style.display = 'block';
        }
    });

    // Controles do Modal
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == modal) modal.style.display = 'none';
    });
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    // Ação de Cadastro
    signupFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                // Cria um documento no Firestore para o novo usuário
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: email,
                    role: 'guest' // Todo novo usuário é 'guest' por padrão
                });
                modal.style.display = 'none';
                signupFormEl.reset();
                alert('Cadastro realizado com sucesso!');
            })
            .catch(error => {
                console.error("Erro no cadastro:", error);
                alert("Erro ao cadastrar: " + error.message);
            });
    });

    // Ação de Login
    loginFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                modal.style.display = 'none';
                loginFormEl.reset();
            })
            .catch(error => {
                console.error("Erro no login:", error);
                alert("Erro ao fazer login: " + error.message);
            });
    });
});