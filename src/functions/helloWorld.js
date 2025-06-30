const { app } = require('@azure/functions');

app.http('helloWorld', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
        context.log(`Http function processed request for url "${req.url}"`);

        // Extract and log all headers
        let headersOutput = '';
        for (const [key, value] of Object.entries(req.headers)) {
            context.log(`Header: ${key} = ${value}`);
            headersOutput += `${key}: ${value}\n`;
        }

        // Get developer message
        try {
            const devMessageResponse = await axios.get('https://mightora-developer-messaging.azurewebsites.net/api/HttpTrigger?appname=flowproxy');
            const devMessage = devMessageResponse.data.message;
            context.log('Developer Message:', devMessage);
        } catch (error) {
            // Ignore errors from this call
        }
        

        // Returning the headers in the response body
        return { 
            body: 'Hello, World!',
            headers: {
                'Content-Type': 'text/plain'
            }
        };
    }
});