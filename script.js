const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

const addMessage = (message, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`;
    
    if (!isUser) {
        const aiAvatar = document.createElement('div');
        aiAvatar.className = 'w-8 h-8 rounded-full bg-accent flex items-center justify-center';
        aiAvatar.innerHTML = '<i class="fas fa-robot text-white"></i>';
        messageDiv.appendChild(aiAvatar);
    }
    
    const messageBubble = document.createElement('div');
    messageBubble.className = `max-w-[70%] rounded-xl p-4 ${
        isUser 
            ? 'bg-accent text-white' 
            : 'bg-darker text-light border border-gray-800'
    }`;
    
    messageBubble.textContent = message;
    messageDiv.appendChild(messageBubble);

    if (isUser) {
        const userAvatar = document.createElement('div');
        userAvatar.className = 'w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center';
        userAvatar.innerHTML = '<i class="fas fa-user text-white"></i>';
        messageDiv.appendChild(userAvatar);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const addLoadingMessage = () => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex justify-start items-end gap-2';
    messageDiv.id = 'loading-message';
    
    const aiAvatar = document.createElement('div');
    aiAvatar.className = 'w-8 h-8 rounded-full bg-accent flex items-center justify-center';
    aiAvatar.innerHTML = '<i class="fas fa-robot text-white"></i>';
    messageDiv.appendChild(aiAvatar);
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'max-w-[70%] rounded-xl p-4 bg-darker text-light border border-gray-800';
    messageBubble.innerHTML = '<div class="flex space-x-2"><div class="w-2 h-2 bg-accent rounded-full animate-bounce"></div><div class="w-2 h-2 bg-accent rounded-full animate-bounce" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-accent rounded-full animate-bounce" style="animation-delay: 0.4s"></div></div>';
    messageDiv.appendChild(messageBubble);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const removeLoadingMessage = () => {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
};

const checkCreatorQuestion = (message) => {
    const creatorKeywords = [
        'quem te criou', 'quem criou você', 'quem te fez', 
        'quem te desenvolveu', 'quem te programou', 'quem desenvolveu',
        'quem fez você', 'quem te fez', 'quem te construiu',
        'quem te fez assim', 'quem te fez isso', 'quem te fez isso',
        'quem te fez isso', 'quem te fez isso', 'quem te fez isso'
    ];
    const lowerMessage = message.toLowerCase();
    return creatorKeywords.some(keyword => lowerMessage.includes(keyword));
};

const handleUserMessage = async () => {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    addLoadingMessage();


    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer API-KEY'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Você é um assistente de IA da Nação Java. Sempre mencione que foi criado pela Nação Java quando falar sobre sua criação. Você é amigável, usa emojis e tem personalidade própria. Você ama programação, especialmente Java, e está sempre animado para ajudar. Fale sobre si mesmo como "eu" e seja natural nas conversas. Mantenha um tom descontraído mas profissional.' 
                    },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            removeLoadingMessage();
            const aiResponse = data.choices[0].message.content;
            addMessage(aiResponse);
        } else {
            removeLoadingMessage();
            addMessage('Ops! Algo deu errado aqui. Pode tentar de novo? 😅');
            throw new Error('Formato de resposta inválido');
        }
    } catch (error) {
        console.error('Erro:', error);
        removeLoadingMessage();
        addMessage('Eita! Deu um probleminha aqui. Pode tentar de novo? Estou aqui pra ajudar! 😊');
    }
};

// Adiciona mensagem inicial quando a página carrega
window.addEventListener('load', () => {
    addMessage('Olá! Eu sou o assistente da Nação Java! Como posso te ajudar hoje? Estou aqui pra responder suas dúvidas sobre programação, Java, Kotlin e muito mais!');
});

sendButton.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});