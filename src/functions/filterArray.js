const { app } = require('@azure/functions');

// Define the HTTP trigger for the Azure Function with configuration.
app.http('filterArray', {
    methods: ['GET', 'POST'],  // Allow both GET and POST requests (POST is used here).
    authLevel: 'anonymous',    // No authentication required, accessible publicly.
    handler: async (request, context) => {
        // Log the URL of the request to the Azure Function's context for debugging.
        context.log(`Http function processed request for url "${request.url}"`);

        // Read and parse the JSON body from the HTTP request.
        const data = await request.json();

        // Extract and convert the base array from JSON objects to an array of strings.
        // Map each object in the base array to its value property.
        const base = (data.base || []).map(item => item.value);

        // Extract the array of checks from the request data.
        const checks = data.check || [];

        // Function to extract email values from an array of objects.
        // Each object in the array has a structure of { "value": "email" }.
        const extractValues = (checkValues) => {
            return checkValues.map(item => item.value);
        };

        // Function to calculate differences between the base array and check arrays.
        // Returns the results in an array of objects, preserving the structure.
        const calculateDifferences = (checkValues, base) => {
            const checkEmails = extractValues(checkValues);
            return {
                inCheckNotInBase: checkEmails.filter(email => !base.includes(email)).map(email => ({ value: email })),
                inBaseNotInCheck: base.filter(email => !checkEmails.includes(email)).map(email => ({ value: email }))
            };
        };

        // Initialize a results object to store the output for each check.
        let results = {};
        // Iterate over each check provided in the request.
        checks.forEach(check => {
            // Use the checkName as the key and store the difference calculation results as the value.
            results[check.checkName] = calculateDifferences(check.checkValues, base);
        });

        // Return the results as a JSON response with appropriate headers.
        return {
            body: JSON.stringify(results), // Convert the results object to a JSON string.
            headers: {
                'Content-Type': 'application/json' // Set content type to application/json to inform the client.
            }
        };
    }
});
