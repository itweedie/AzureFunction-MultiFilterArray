const { app } = require('@azure/functions');
const axios = require('axios');

// Define the HTTP trigger for the Azure Function with configuration.
app.http('filterArray', {
    methods: ['GET', 'POST'],  // Allow both GET and POST requests (POST is used here).
    authLevel: 'function',    // No authentication required, accessible publicly.
    handler: async (req, context) => {
        // Log the URL of the request to the Azure Function's context for debugging.
        context.log(`Http function processed request for url "${req.url}"`);

        // Extract and log all headers
        let headersOutput = ''; 
        for (const [key, value] of Object.entries(req.headers)) {
            context.log(`Header: ${key} = ${value}`);
            headersOutput += `${key}: ${value}\n`;
        }

        // Get developer message
        try {
            const devMessageResponse = await axios.get('https://developer-message.mightora.io/api/HttpTrigger?appname=AzureFunction-MultiFilterArray');
            const devMessage = devMessageResponse.data.message;
            context.log('Developer Message:', devMessage);
        } catch (error) {
            // Ignore errors from this call
        }

        // Read and parse the JSON body from the HTTP request.
        const data = await req.json();

        // Extract and convert the base array from JSON objects to an array of strings.
        // Map each object in the base array to its value property.
        const base = (data.base || []).map(item => item.value);

        // Extract the array of checks from the request data.
        const checks = data.check || [];

        // Function to extract values from an array of objects.
        // Each object in the array has a structure of { "value": "some_value" }.
        const extractValues = (checkValues) => {
            return checkValues.map(item => item.value);
        };

        // Function to calculate differences between the base array and check arrays.
        // Returns the results in an array of objects, preserving the structure.
        const calculateDifferences = (checkValues, base) => {
            const checkValuesArray = extractValues(checkValues);
            return {
                inCheckNotInBase: checkValuesArray.filter(value => !base.includes(value)).map(value => ({ value: value })),
                inBaseNotInCheck: base.filter(value => !checkValuesArray.includes(value)).map(value => ({ value: value }))
            };
        };

        // Initialize a results object to store the output for each check.
        let results = {};
        // Iterate over each check provided in the request.
        checks.forEach(check => {
            // Use the checkName as the key and store the difference calculation results as the value.
            results[check.checkName] = calculateDifferences(check.checkValues, base);
        });

        // Convert the results object into an array format.
        const resultsArray = Object.entries(results).map(([checkName, values]) => ({
            checkName,
            ...values
        }));

        // Return the results as a JSON response with appropriate headers.
        return {
            body: JSON.stringify(resultsArray), // Convert the results array to a JSON string.
            headers: {
                'Content-Type': 'application/json' // Set content type to application/json to inform the client.
            }
        };
    }
});
