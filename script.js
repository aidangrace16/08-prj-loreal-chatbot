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

    // Remove loading message and show AI reply
    // (Replace last .msg.ai with the actual reply)
    const msgs = chatWindow.querySelectorAll(".msg.ai");
    if (msgs.length) {
      msgs[msgs.length - 1].innerHTML = aiMsgHtml;
    } else {
      chatWindow.innerHTML += `<div class="msg ai">${aiMsgHtml}</div>`;
    }
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
