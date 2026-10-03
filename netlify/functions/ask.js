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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Netlify."
        })
      };
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/interactions";

    let lastError = "Gemini request failed.";

    for (let attempt = 0; attempt < 3; attempt++) {

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          model: "gemini-3.8-flash",

          input: question,

          system_instruction:
            "You are Victor AI, a helpful general AI assistant and Accountancy/Student specialist. Answer clearly, accurately, and in simple English. Help with accounting, school work, technology, general questions, and everyday tasks."
        })
      });

      const data = await response.json();

      if (response.ok) {

        const answer =
          data.output_text ||
          data.steps
            ?.filter(step => step.type === "model_output")
            ?.flatMap(step => step.content || [])
            ?.map(item => item.text || "")
            ?.join("")
            ?.trim();

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
      }

      lastError =
        data.error?.message ||
        "Gemini request failed.";

      const temporaryError =
        response.status === 429 ||
        response.status === 503;

      if (!temporaryError) {
        return {
          statusCode: response.status,
          body: JSON.stringify({
            error: lastError
          })
        };
      }

      if (attempt < 2) {
        const waitTime = 2000 * Math.pow(2, attempt);

        await new Promise(resolve =>
          setTimeout(resolve, waitTime)
        );
      }
    }

    return {
      statusCode: 503,
      body: JSON.stringify({
        error:
          "Gemini is temporarily busy. Please try again in a moment."
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          error.message ||
          "Something went wrong."
      })
    };
  }
};
