# Power Automate Integration Guide

## Overview
This guide explains how to integrate the AzureFunction-MultiFilterArray with Microsoft Power Automate using a custom connector.

## Step-by-Step Integration

### 1. Import the Custom Connector

1. **Download the Swagger File**
   - Download `swagger.json` from this repository
   - Save it to your local machine

2. **Create Custom Connector in Power Automate**
   - Go to [Power Automate](https://make.powerautomate.com)
   - Navigate to **Data** → **Custom Connectors**
   - Click **+ New custom connector** → **Import an OpenAPI file**
   - Upload the `swagger.json` file

3. **Configure Connector Settings**
   - **General Tab**: 
     - Update the Host field with your actual Azure Function URL (without /api)
     - Example: `yourfunctionapp.azurewebsites.net`
   - **Security Tab**:
     - Authentication Type: **API Key**
     - Parameter label: `Function Key`
     - Parameter name: `code`
     - Parameter location: **Query**

4. **Test the Connector**
   - Go to the **Test** tab
   - Create a new connection
   - Enter your Azure Function key when prompted
   - Test both operations with sample data

### 2. Using the Connector in Flows

#### Example Flow: Compare Email Lists

**Trigger**: When a new file is added to SharePoint
**Actions**:
1. **Get file content** from SharePoint
2. **Parse JSON** to extract email arrays
3. **Multi Filter Array - Email Array** action
   - Base: Master email list
   - Check: New email list from file
4. **Send email** with results
5. **Update SharePoint list** with differences

#### Example Flow: Data Synchronization

**Trigger**: Scheduled (daily)
**Actions**:
1. **Get data** from System A (e.g., SQL, SharePoint)
2. **Get data** from System B
3. **Multi Filter Array - Filter Array** action
   - Base: System A data
   - Check: System B data
4. **Create items** for missing records
5. **Send notification** with sync results

### 3. Common Use Cases

#### Email List Management
```json
{
  "base": [
    {"value": "admin@company.com"},
    {"value": "user1@company.com"}
  ],
  "check": [
    {
      "checkName": "NewsletterList",
      "checkValues": [
        {"value": "user1@company.com"},
        {"value": "newuser@company.com"}
      ]
    }
  ]
}
```

#### Product Inventory Sync
```json
{
  "base": [
    {"value": "PROD001"},
    {"value": "PROD002"}
  ],
  "check": [
    {
      "checkName": "WarehouseA",
      "checkValues": [
        {"value": "PROD002"},
        {"value": "PROD003"}
      ]
    }
  ]
}
```

#### User Access Comparison
```json
{
  "base": [
    {"value": "john.doe"},
    {"value": "jane.smith"}
  ],
  "check": [
    {
      "checkName": "ActiveDirectory",
      "checkValues": [
        {"value": "jane.smith"},
        {"value": "bob.wilson"}
      ]
    }
  ]
}
```

### 4. Response Handling

The connector returns structured data that can be used in subsequent actions:

```json
{
  "NewsletterList": {
    "inCheckNotInBase": [
      {"value": "newuser@company.com"}
    ],
    "inBaseNotInCheck": [
      {"value": "admin@company.com"}
    ]
  }
}
```

**Using the Response**:
- Access specific results: `body.NewsletterList.inCheckNotInBase`
- Loop through differences: Use **Apply to each** on the arrays
- Count differences: Use `length()` function

### 5. Error Handling

Add error handling to your flows:

1. **Configure run after settings** on actions following the connector
2. **Add parallel branch** for error scenarios
3. **Send notification** or **log errors** to SharePoint/Teams

Common errors:
- Invalid function key
- Malformed JSON request
- Network timeouts
- Function app unavailable

### 6. Performance Considerations

- **Batch Processing**: For large datasets, split into smaller batches
- **Caching**: Store results in variables for reuse within the same flow
- **Scheduling**: Use scheduled flows during off-peak hours for large operations
- **Premium Connectors**: Consider upgrading for better performance and reliability

### 7. Security Best Practices

- **Store function keys** in Azure Key Vault and reference them securely
- **Use least privilege** principle for function app access
- **Monitor usage** through Azure Function logs
- **Rotate keys** regularly
- **Use HTTPS** always (enforced by default)

### 8. Troubleshooting

#### Common Issues:
1. **Connection Test Fails**
   - Verify function key is correct
   - Check function app is running
   - Ensure CORS is configured if needed

2. **Empty Results**
   - Verify input data format matches expected schema
   - Check that arrays contain objects with "value" property

3. **Timeout Errors**
   - Reduce array sizes
   - Consider upgrading to Premium hosting plan
   - Check function app scaling settings

#### Debug Steps:
1. Test function directly with Postman or curl
2. Check Azure Function logs in the portal
3. Verify input JSON format
4. Test with minimal sample data first

### 9. Advanced Scenarios

#### Dynamic Array Names
Use expressions to dynamically set check array names:
```
concat('List_', formatDateTime(utcNow(), 'yyyy-MM-dd'))
```

#### Conditional Processing
Add conditions to only process arrays that meet certain criteria:
```
if(greater(length(variables('inputArray')), 0), 'process', 'skip')
```

#### Result Aggregation
Combine results from multiple comparisons:
```
union(body('FilterArray1'), body('FilterArray2'))
```

## Support

For issues specific to Power Automate integration:
1. Check the [Power Automate Community](https://powerusers.microsoft.com/t5/Microsoft-Power-Automate/ct-p/MPACommunity)
2. Review Azure Function logs for API-specific errors
3. Test the function directly before troubleshooting the connector
4. Ensure your Power Automate plan supports custom connectors
