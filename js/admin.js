import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- SEÇÃO DE SEGURANÇA E AUTENTICAÇÃO ---
    const logoutButton = document.getElementById('logout-btn-header');

    // Verifica o estado do login. Se não houver usuário, redireciona para a página inicial.
    // Isso impede que não-admins acessem a página digitando o endereço.
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'index.html';
        }
    });

    // Função de logout para o botão no header da página admin
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert('Logout realizado com sucesso.');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Erro no logout:', error);
        });
    });

    // --- LÓGICA DO TEMA DARK/LIGHT ---
    // É importante ter isso aqui também para o tema funcionar na página de admin
    const themeSwitcher = document.getElementById('checkbox');
    const docElement = document.documentElement;
    const applyTheme = (theme) => {
        docElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeSwitcher) {
            themeSwitcher.checked = theme === 'dark';
        }
    };
    if (themeSwitcher) {
        themeSwitcher.addEventListener('change', () => applyTheme(themeSwitcher.checked ? 'dark' : 'light'));
    }
    // Aplica o tema salvo ao carregar a página
    applyTheme(localStorage.getItem('theme') || 'light');


    // --- GERENCIAMENTO DE IMÓVEIS (CRUD) ---
    const addPropertyForm = document.getElementById('add-property-form');
    const propertyListContainer = document.getElementById('property-list');
    const propertiesCollection = collection(db, "properties");

    // FUNÇÃO PARA ADICIONAR IMÓVEL (CREATE)
    addPropertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = addPropertyForm.title.value;
        const location = addPropertyForm.location.value;
        const imageUrl = addPropertyForm['image-url'].value;
        const submitButton = addPropertyForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Adicionando...';

        try {
            // Adiciona o novo documento à coleção "properties" no Firestore
            await addDoc(propertiesCollection, {
                title: title,
                location: location,
                imageUrl: imageUrl,
                createdAt: new Date() // Guarda a data de criação para futura ordenação
            });
            alert('Imóvel adicionado com sucesso!');
            addPropertyForm.reset();
            fetchProperties(); // Atualiza a lista de imóveis na tela
        } catch (error) {
            console.error("Erro ao adicionar documento: ", error);
            alert('Erro ao adicionar imóvel. Verifique o console.');
        } finally {
            // Reabilita o botão após a operação
            submitButton.disabled = false;
            submitButton.textContent = 'Adicionar Imóvel';
        }
    });

    // FUNÇÃO PARA BUSCAR E EXIBIR OS IMÓVEIS (READ)
    const fetchProperties = async () => {
        propertyListContainer.innerHTML = '<p class="loader">Carregando imóveis...</p>';

        try {
            // Cria uma consulta para buscar os imóveis, ordenados pela data de criação mais recente
            const q = query(propertiesCollection, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                propertyListContainer.innerHTML = '<p>Nenhum imóvel cadastrado.</p>';
                return;
            }

            let html = '';
            querySnapshot.forEach((doc) => {
                const property = doc.data();
                // Cria um item na lista para cada imóvel
                html += `
                    <div class="property-list-item" id="item-${doc.id}">
                        <h4>${property.title}</h4>
                        <div class="actions">
                            <button class="delete-btn" data-id="${doc.id}" title="Apagar"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
            propertyListContainer.innerHTML = html;

            // Adiciona os eventos de clique aos botões de apagar DEPOIS de eles serem criados
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm('Tem certeza que deseja apagar este imóvel? Esta ação não pode ser desfeita.')) {
                        await deleteProperty(id);
                    }
                });
            });

        } catch (error) {
            console.error("Erro ao buscar imóveis: ", error);
            propertyListContainer.innerHTML = '<p>Erro ao carregar imóveis. Verifique as permissões e o console.</p>';
        }
    };

    // FUNÇÃO PARA APAGAR IMÓVEL (DELETE)
    const deleteProperty = async (id) => {
        try {
            const propertyDoc = doc(db, "properties", id);
            await deleteDoc(propertyDoc);
            
            // Remove o item da tela imediatamente para uma melhor experiência do usuário
            const itemToRemove = document.getElementById(`item-${id}`);
            if(itemToRemove) itemToRemove.remove();

            alert('Imóvel apagado com sucesso!');

            // Se a lista ficar vazia após a remoção, exibe a mensagem
            if (propertyListContainer.children.length === 0) {
                 propertyListContainer.innerHTML = '<p>Nenhum imóvel cadastrado.</p>';
            }
        } catch (error) {
            console.error("Erro ao apagar imóvel: ", error);
            alert('Erro ao apagar imóvel.');
        }
    };

    // Carrega a lista de imóveis assim que a página de admin é aberta
    fetchProperties();
});