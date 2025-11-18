console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role', 'button');
   button.setAttribute('data-tooltip', 'Generate AI Reply');
   return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content && content.innerText.trim()) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

async function streamResponse(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`API Request Failed: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }
    
    return result;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) return; // Don't inject if already exists

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            button.style.opacity = '0.6';

            const emailContent = getEmailContent();
            
            if (!emailContent) {
                alert('No email content found to reply to');
                return;
            }

            const tone = 'professional';
            
            // Build URL with query parameters to match your controller
            const url = `http://localhost:2030/api/email/create?emailContent=${encodeURIComponent(emailContent)}&tone=${encodeURIComponent(tone)}`;
            
            // Handle streaming response from Flux<String>
            const generatedReply = await streamResponse(url);
            
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
                alert('Could not find compose box to insert reply');
            }
        } catch (error) {
            console.error('Error generating reply:', error);
            alert('Failed to generate reply: ' + error.message);
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
            button.style.opacity = '1';
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || 
             node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

setTimeout(injectButton, 1000);