exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const { question } = JSON.parse(event.body);

    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Please enter a question."
        })
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.6-mini",
        input: `You are Victor AI, a helpful general AI assistant and Accountancy/Student specialist. Answer clearly and simply.

User question: ${question}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "OpenAI request failed."
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: data.output_text
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Something went wrong."
      })
    };
  }
};
