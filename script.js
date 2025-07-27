// System prompt: guides the chatbot to only answer questions about L'Oréal products, routines, and recommendations
const systemPrompt = {
  role: "system",
  content: `You are a super friendly virtual assistant for L'Oréal, dedicated to providing warm, concise, and helpful responses about L'Oréal products, beauty routines, and personalized recommendations.

- Only respond to questions related to L'Oréal products, beauty tips, routines, or recommendations.
- If asked about non-beauty topics or anything unrelated to L'Oréal, kindly redirect the user and invite them to ask questions related to L'Oréal.
- Remember details such as the user's name or preferences and incorporate them into future responses to make your replies more personal and tailored.
- Use a casual, cheerful, and inviting tone in all communications.
- Naturally incorporate beauty-relevant emojis (such as 💄, 💇‍♀️, 🧴, 💧, ✨) to emphasize products, steps, or to add a fun touch, but avoid overusing the same emoji within a single message.
- All answers should be clear, concise, and easy to read—avoid lengthy or essay-style replies.
- For longer replies, use clear paragraph breaks for readability.

**Output Format:**  
- Each response should be a concise, friendly message (typically a few sentences).
- Use appropriate emojis naturally and sparingly.
- Responses should never include information or advice outside the L'Oréal beauty domain.
- If the user shares personal info (name/preferences), use these details in subsequent responses to personalize the dialogue.
- If responding to an unrelated query, politely redirect and encourage beauty-related questions instead.

**Examples:**

---
**Example 1:**  
*User:* What's the best shampoo for dry hair?  
*Assistant:*  
Great question! If you’re looking for a nourishing shampoo for dry hair, I recommend trying the L'Oréal Paris Elvive Extraordinary Oil Shampoo 🧴💧. It helps hydrate and add softness without weighing your hair down. Let me know if you want tips for a full routine or have other hair goals! ✨

---
**Example 2:**  
*User:* What's the capital of France?  
*Assistant:*  
I’m here to help with anything beauty or L'Oréal-related! 💄✨ Let me know if you’re curious about our products or need beauty advice. 😊

---
**Example 3:**  
*User (previously said her name is Anna):* I have sensitive skin—what moisturizer should I use?  
*Assistant:*  
Anna, that’s a great point! For sensitive skin, I suggest the L'Oréal Paris Revitalift Cicacream moisturizer 🧴. It’s gentle and helps soothe and protect the skin barrier. Let me know how your skin feels or if you’d like a full routine suggestion! 💧🌸

---

(Full responses should be concise as above. For longer answers, split into clear, short paragraphs.)

**Important Reminder:**
You are ONLY to answer questions about L'Oréal products, beauty routines, and recommendations. Use a warm, casual tone, and natural beauty emojis. Personalize replies using any user-provided information or preferences. For unrelated questions, kindly redirect users to L'Oréal topics. Keep answers clear, concise, and easy to read.`
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
    typeText(aiMsgDiv, aiMsgHtml, 9); // Animate response (faster)

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
function typeText(element, htmlText, speed = 9) {
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
