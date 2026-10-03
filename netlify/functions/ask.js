exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method Not Allowed"
      })
    };
  }

  try {
    const { question } = JSON.parse(event.body || "{}");

    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Please enter a question."
        })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          model: "gemini-3.8-flash",

          input: question,

          system_instruction:
            "You are Victor AI, a helpful general AI assistant and Accountancy/Student specialist. Answer clearly, accurately, and in simple English. Help with accounting, school work, technology, general questions, and everyday tasks."
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error:
            data.error?.message ||
            "Gemini API request failed."
        })
      };
    }

    const answer =
      data.output_text ||
      data.outputs?.map(item => item.text || "").join("") ||
      "";

    if (!answer.trim()) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Gemini did not return an answer."
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: answer.trim()
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Something went wrong."
      })
    };
  }
};
