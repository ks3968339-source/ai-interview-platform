async function listModels() {
    try {
        const key = "AIzaSyB7HHMvZxEFa6ZRhpTImbXF1WQS0fCc_xU";
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if(m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log("-", m.name.replace('models/', ''));
                }
            });
        } else {
            console.log("Error fetching models:", data);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
