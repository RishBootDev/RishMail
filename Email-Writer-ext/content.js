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

async function streamResponseToTextbox(url, composeBox) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`API Request Failed: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Focus the compose box
    composeBox.focus();
    
    // Clear existing content (optional - remove if you want to append)
    composeBox.innerHTML = '';
    
    let buffer = '';
    
    while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Split by words to simulate more natural streaming
        const words = buffer.split(/(\s+)/);
        
        // Keep the last incomplete word in buffer
        if (!buffer.endsWith(' ') && !buffer.endsWith('\n')) {
            buffer = words.pop() || '';
        } else {
            buffer = '';
        }
        
        // Insert each word with a small delay for smooth effect
        for (const word of words.slice(0, -1)) {
            if (word) {
                // Insert text into the compose box
                const textNode = document.createTextNode(word);
                composeBox.appendChild(textNode);
                
                // Scroll to keep the latest text visible
                composeBox.scrollTop = composeBox.scrollHeight;
                
                // Small delay between words for smooth streaming effect
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }
    }
    
    // Insert any remaining text in buffer
    if (buffer) {
        const textNode = document.createTextNode(buffer);
        composeBox.appendChild(textNode);
        composeBox.scrollTop = composeBox.scrollHeight;
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) return;

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        let composeBox = null;
        
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
            
            const url = `http://localhost:2030/api/email/create?emailContent=${encodeURIComponent(emailContent)}&tone=${encodeURIComponent(tone)}`;
            
            composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (!composeBox) {
                console.error('Compose box was not found');
                alert('Could not find compose box to insert reply');
                return;
            }

            // Stream the response directly to the textbox
            await streamResponseToTextbox(url, composeBox);
            
        } catch (error) {
            console.error('Error generating reply:', error);
            alert('Failed to generate reply: ' + error.message);
            
            // Clear the compose box on error
            if (composeBox) {
                composeBox.innerHTML = '';
            }
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