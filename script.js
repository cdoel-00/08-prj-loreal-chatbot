/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const latestQuestion = document.getElementById("latestQuestion");
const sendIcon = sendBtn.querySelector(".material-icons");
const siteHeader = document.querySelector(".site-header");

let userName = "";
const userQuestionHistory = [];

// This array stores the full conversation sent to the OpenAI API.
const messages = [
  {
    role: "system",
    content:
      "You are a L'Oreal-only beauty advisor. Only answer questions about L'Oreal products, L'Oreal brands, L'Oreal routines, and L'Oreal as a company. If a question is not about L'Oreal, respond with exactly: 'I can only help with L'Oreal products and company questions. Please ask me something about L'Oreal.' Keep all answers short, friendly, and practical. When a user name is available, use it naturally.",
  },
];

// Try to detect a name from common phrases such as "my name is Ana".
function getNameFromText(text) {
  const namePatterns = [
    /my name is\s+([a-z][a-z'\-\s]{1,30})/i,
    /i am\s+([a-z][a-z'\-\s]{1,30})/i,
    /i'm\s+([a-z][a-z'\-\s]{1,30})/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleanedName = match[1].trim().split(" ")[0];
      return (
        cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1).toLowerCase()
      );
    }
  }

  return "";
}

// Utility function: add a message bubble into the chat window.
function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("msg", role === "user" ? "user" : "ai");

  const messageText = document.createElement("p");
  messageText.classList.add("msg-text");
  messageText.textContent = text;

  const messageTime = document.createElement("span");
  messageTime.classList.add("msg-time");
  messageTime.textContent = getCurrentTimeLabel();

  msg.appendChild(messageText);
  msg.appendChild(messageTime);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

window.addEventListener("scroll", () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-compact", window.scrollY > 24);
});

// Initial assistant greeting.
addMessage(
  "assistant",
  "Hello. Ask me about products, ingredients, or a routine.",
);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) {
    return;
  }

  latestQuestion.textContent = `Latest question: ${prompt}`;
  addMessage("user", prompt);
  userInput.value = "";

  // Save the last 6 user questions for extra context.
  userQuestionHistory.push(prompt);
  if (userQuestionHistory.length > 6) {
    userQuestionHistory.shift();
  }

  // Save name if user shared it.
  const detectedName = getNameFromText(prompt);
  if (detectedName) {
    userName = detectedName;
  }

  // Add the user's new message to conversation history.
  messages.push({ role: "user", content: prompt });

  try {
    sendBtn.disabled = true;
    sendBtn.setAttribute("aria-busy", "true");
    sendIcon.textContent = "hourglass_top";

    // Build extra memory context for this request.
    const requestMessages = [...messages];

    if (userName) {
      requestMessages.push({
        role: "system",
        content: `User name: ${userName}. Use their name naturally when helpful.`,
      });
    }

    if (userQuestionHistory.length > 0) {
      requestMessages.push({
        role: "system",
        content: `Recent user questions: ${userQuestionHistory.join(" | ")}`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: requestMessages,
        max_completion_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    // As required: read assistant text from data.choices[0].message.content
    const assistantReply = data.choices[0].message.content;
    addMessage("assistant", assistantReply);

    // Save assistant reply so future answers keep conversation context.
    messages.push({ role: "assistant", content: assistantReply });
  } catch (error) {
    addMessage(
      "assistant",
      "I couldn't connect to OpenAI right now. Check your API key and try again.",
    );
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    sendBtn.setAttribute("aria-busy", "false");
    sendIcon.textContent = "send";
    userInput.focus();
  }
});
