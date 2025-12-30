// public/embed.js - This is the actual embed script

(function() {
  'use strict';

  // Configuration defaults
  const defaults = {
    chatbotId: null,
    baseUrl: 'http://localhost:3000',
    config: {
      showButton: true,
      autoOpen: false,
      delay: 1000,
      position: 'bottom-right',
      buttonColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      buttonSize: 'medium'
    }
  };

  // State management
  const state = {
    isInitialized: false,
    isOpen: false,
    messages: [],
    conversationId: null,
    chatbotConfig: null
  };

  // Widget HTML template
  const getWidgetHTML = () => `
    <div id="chatbot-widget-container">
      <!-- Widget Button -->
      <div id="chatbot-widget-button" style="
        position: fixed;
        ${getPosition()};
        width: ${getButtonSize()};
        height: ${getButtonSize()};
        border-radius: ${getButtonShape()};
        background-color: ${window.chatbotConfig.config.buttonColor};
        color: ${window.chatbotConfig.config.buttonTextColor};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      ">
        💬
      </div>

      <!-- Chat Container -->
      <div id="chatbot-container" style="
        position: fixed;
        ${getPosition(true)};
        width: 380px;
        height: 600px;
        max-height: 80vh;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: none;
        flex-direction: column;
        z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Header -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div id="chatbot-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
              🤖
            </div>
            <div>
              <div id="chatbot-name" style="font-weight: 600; font-size: 16px;">Assistant</div>
              <div style="font-size: 12px; color: #6b7280;">Online</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="chatbot-minimize" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #6b7280; padding: 4px;">−</button>
            <button id="chatbot-close" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #6b7280; padding: 4px;">×</button>
          </div>
        </div>

        <!-- Messages Container -->
        <div id="chatbot-messages" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;"></div>

        <!-- Input Area -->
        <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
          <form id="chatbot-form" style="display: flex; gap: 8px;">
            <input id="chatbot-input" type="text" placeholder="Type your message..." style="
              flex: 1;
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 24px;
              font-size: 14px;
              outline: none;
              font-family: inherit;
            ">
            <button type="submit" style="
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: inherit;
            ">→</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Helper functions
  function getPosition(isContainer = false) {
    const pos = window.chatbotConfig.config.position;
    const offset = isContainer ? '90px' : '20px';
    
    switch(pos) {
      case 'bottom-left':
        return `bottom: ${offset}; left: 20px;`;
      case 'top-right':
        return `top: ${offset}; right: 20px;`;
      case 'top-left':
        return `top: ${offset}; left: 20px;`;
      default: // bottom-right
        return `bottom: ${offset}; right: 20px;`;
    }
  }

  function getButtonSize() {
    switch(window.chatbotConfig.config.buttonSize) {
      case 'small': return '50px';
      case 'large': return '70px';
      default: return '60px';
    }
  }

  function getButtonShape() {
    return window.chatbotConfig.config.buttonSize === 'large' ? '12px' : '50%';
  }

  let instance = null;

  // Main Chatbot class
  class ChatbotWidget {
    constructor() {
      this.elements = {};
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      
      // Inject widget
      this.injectWidget();
      
      // Initialize event listeners
      this.initEventListeners();
      
      // Auto-open if configured
      if (window.chatbotConfig.config.autoOpen) {
        setTimeout(() => this.openChat(), window.chatbotConfig.config.delay);
      }
      
      this.initialized = true;
      console.log('Chatbot widget initialized');
    }

    injectWidget() {
      // Create and inject widget HTML
      const container = document.createElement('div');
      container.innerHTML = getWidgetHTML();
      document.body.appendChild(container.firstElementChild);
      
      // Store element references
      this.elements = {
        container: document.getElementById('chatbot-widget-container'),
        button: document.getElementById('chatbot-widget-button'),
        chatContainer: document.getElementById('chatbot-container'),
        messages: document.getElementById('chatbot-messages'),
        input: document.getElementById('chatbot-input'),
        form: document.getElementById('chatbot-form'),
        minimize: document.getElementById('chatbot-minimize'),
        close: document.getElementById('chatbot-close'),
        avatar: document.getElementById('chatbot-avatar'),
        name: document.getElementById('chatbot-name')
      };

      // Show button if configured
      if (window.chatbotConfig.config.showButton) {
        this.elements.button.style.display = 'flex';
      } else {
        this.elements.button.style.display = 'none';
      }
    }

    initEventListeners() {
      // Toggle chat
      this.elements.button.addEventListener('click', () => this.toggleChat());
      
      // Minimize
      this.elements.minimize.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimizeChat();
      });
      
      // Close
      this.elements.close.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeChat();
      });
      
      // Form submit
      this.elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    toggleChat() {
      if (this.elements.chatContainer.style.display === 'flex') {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      this.elements.chatContainer.style.display = 'flex';
      this.elements.button.style.display = 'none';
      this.elements.input.focus();
    }

    closeChat() {
      this.elements.chatContainer.style.display = 'none';
      this.elements.button.style.display = 'flex';
    }

    minimizeChat() {
      this.elements.chatContainer.style.height = '60px';
      this.elements.messages.style.display = 'none';
      this.elements.form.style.display = 'none';
    }

    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message) return;

      // Add user message
      this.addMessage('user', message);
      this.elements.input.value = '';

      try {
        // Send to your API
        const response = await fetch(`${window.chatbotConfig.baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbotId: window.chatbotConfig.chatbotId,
            message,
            conversationId: state.conversationId,
            context: {
              url: window.location.href,
              referrer: document.referrer
            }
          })
        });

        const data = await response.json();
        
        if (data.message) {
          this.addMessage('bot', data.message);
          if (data.conversationId) {
            state.conversationId = data.conversationId;
          }
        }
      } catch (error) {
        console.error('Chat error:', error);
        this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
      }
    }

    addMessage(type, content) {
      const messageElement = document.createElement('div');
      messageElement.style.cssText = `
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 18px;
        background: ${type === 'user' ? window.chatbotConfig.config.buttonColor : '#f3f4f6'};
        color: ${type === 'user' ? 'white' : '#1f2937'};
        align-self: ${type === 'user' ? 'flex-end' : 'flex-start'};
        word-wrap: break-word;
        margin-bottom: 8px;
      `;
      messageElement.textContent = content;
      
      this.elements.messages.appendChild(messageElement);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
  }

  // Global chatbot object
  const init = (config) => {
    // Extract config properties that might be at top level or in config object
    const { 
      chatbotId, 
      baseUrl, 
      config: nestedConfig,
      ...topLevelConfig 
    } = config;

    window.chatbotConfig = {
      ...defaults,
      chatbotId: chatbotId || defaults.chatbotId,
      baseUrl: baseUrl || defaults.baseUrl,
      config: {
        ...defaults.config,
        ...topLevelConfig,
        ...nestedConfig
      }
    };
    
    const startInstance = () => {
      if (!instance) {
        instance = new ChatbotWidget();
        instance.init();
      }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startInstance);
    } else {
      startInstance();
    }
  };

  // Store reference to existing queue
  const queue = window.chatbot && window.chatbot.q ? window.chatbot.q : [];

  // Define global chatbot function
  window.chatbot = function() {
    const args = Array.prototype.slice.call(arguments);
    const command = args[0];
    
    if (command === 'init') {
      init(args[1]);
    } else if (instance && typeof instance[command + 'Chat'] === 'function') {
      instance[command + 'Chat']();
    } else if (instance && typeof instance[command] === 'function') {
      instance[command]();
    }
  };

  // Process queued commands
  queue.forEach(args => {
    window.chatbot.apply(null, args);
  });

  // Auto-initialize if config is set via data attributes
  document.addEventListener('DOMContentLoaded', function() {
    const script = document.currentScript;
    if (script) {
      const chatbotId = script.getAttribute('data-chatbot-id');
      const baseUrl = script.getAttribute('data-base-url');
      
      if (chatbotId) {
        window.chatbot('init', {
          chatbotId,
          baseUrl: baseUrl || defaults.baseUrl,
          config: defaults.config
        });
      }
    }
  });

})();