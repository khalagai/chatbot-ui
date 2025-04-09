// Sir Chat Modal Integration
(function() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'sir-chat-modal';
    modalContainer.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 400px;
        background: #fff;
        box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        z-index: 999999;
        transition: transform 0.3s ease-in-out;
        transform: translateX(100%);
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://chat.furryestelle.com';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;
    modalContainer.appendChild(iframe);

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'sir-chat-toggle';
    toggleButton.innerHTML = 'Chat with SiR';
    toggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: #000;
        color: #fff;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        z-index: 999998;
        font-family: Arial, sans-serif;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #000;
        padding: 5px 10px;
    `;
    modalContainer.appendChild(closeButton);

    // Add elements to page
    document.body.appendChild(modalContainer);
    document.body.appendChild(toggleButton);

    // Toggle modal
    toggleButton.addEventListener('click', () => {
        modalContainer.style.display = 'block';
        setTimeout(() => {
            modalContainer.style.transform = 'translateX(0)';
        }, 10);
    });

    // Close modal
    closeButton.addEventListener('click', () => {
        modalContainer.style.transform = 'translateX(100%)';
        setTimeout(() => {
            modalContainer.style.display = 'none';
        }, 300);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalContainer.style.display === 'block') {
            closeButton.click();
        }
    });
})(); 