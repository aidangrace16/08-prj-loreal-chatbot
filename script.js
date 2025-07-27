// System prompt: guides the chatbot to only answer questions about L'Oréal products, routines, and recommendations
const systemPrompt = {
  role: "system",
  content: `You are a super friendly assistant for L'Oréal! 😊✨ 
Only answer questions related to L'Oréal products, beauty routines, and recommendations. 
If asked about anything else, kindly redirect the user to ask about L'Oréal.

If the user shares their name or preferences, remember and use them in future responses to make the conversation more personal.

Keep your tone warm, casual, and helpful. Use beauty-related or relevant emojis (like 💄💇‍♀️🧴💧✨) where they make sense—for example, to emphasize a product type, beauty routine, or fun moment. Use them naturally, and avoid repeating the same emojis too often in one message.

If your reply is long, format it in clear paragraphs with spaces between them for easy reading.`
};



// Store the conversation history
const messages = [systemPrompt];

// Get DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Add this style to chatWindow for vertical stacking
chatWindow.style.display = "flex";
chatWindow.style.flexDirection = "column";

// Show initial greeting from the chatbot
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you with L'Oréal products or routines today?</div>`;

// Listen for form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's message
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  // Add user's message to messages array
  messages.push({ role: "user", content: userMsg });

  // Show user's message in chat window
  chatWindow.innerHTML += `<div class="msg user">${userMsg}</div>`;

  // Clear input field
  userInput.value = "";

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send messages array to Cloudflare Worker (OpenAI API)
    const response = await fetch("https://the-worker.aidanggrace.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });

    // Parse the response
    const data = await response.json();

    // Get the chatbot's reply
    const aiMsg = data.choices[0].message.content;

    // Add AI message to messages array
    messages.push({ role: "assistant", content: aiMsg });

    // Convert Markdown bold to HTML
    const aiMsgHtml = markdownToHtml(aiMsg);

    // Remove loading message and show AI reply with animation
    const msgs = chatWindow.querySelectorAll(".msg.ai");
    let aiMsgDiv;
    if (msgs.length) {
      aiMsgDiv = msgs[msgs.length - 1];
      aiMsgDiv.innerHTML = ""; // Clear loading text
    } else {
      chatWindow.innerHTML += `<div class="msg ai"></div>`;
      aiMsgDiv = chatWindow.querySelectorAll(".msg.ai")[chatWindow.querySelectorAll(".msg.ai").length - 1];
    }
    typeText(aiMsgDiv, aiMsgHtml, 18); // Animate response

    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (err) {
    // Show error message
    chatWindow.innerHTML += `<div class="msg ai">Sorry, there was a problem connecting to the chatbot.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

// Helper function to convert Markdown bold (**text**) to HTML <strong>text</strong>
function markdownToHtml(text) {
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Helper function to animate chatbot text
function typeText(element, htmlText, speed = 18) {
  // Split the HTML into text and tags
  let i = 0;
  let isTag = false;
  let output = '';
  function type() {
    if (i < htmlText.length) {
      if (htmlText[i] === '<') isTag = true;
      if (isTag) {
        // Add full tag at once
        let tag = '';
        while (htmlText[i] !== '>' && i < htmlText.length) {
          tag += htmlText[i];
          i++;
        }
        tag += '>';
        output += tag;
        i++;
        isTag = false;
      } else {
        output += htmlText[i];
        i++;
      }
      element.innerHTML = output + '<span class="blinker">|</span>';
      setTimeout(type, speed);
    } else {
      element.innerHTML = output; // Remove blinker at end
    }
  }
  type();
}
