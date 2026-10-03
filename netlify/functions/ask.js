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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are Victor AI, a helpful general AI assistant and Accountancy/Student specialist. Answer clearly, accurately, and in simple English. Help with accounting, school work, technology, general questions, and everyday tasks."
              }
            ]
          },

          contents: [
            {
              parts: [
                {
                  text: question
                }
              ]
            }
          ]
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
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) {
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
        answer: answer
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
