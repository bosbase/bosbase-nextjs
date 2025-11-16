import BosBase from "bosbase";

const BOSBASE_URL = process.env.BOSBASE_URL!;
const BOSBASE_EMAIL = process.env.BOSBASE_EMAIL!;
const BOSBASE_PASSWORD = process.env.BOSBASE_PASSWORD!;

/**
 * Initialize the api_calls collection in BosBase
 * This function will create the collection if it doesn't exist
 */
export async function ensureApiCallsCollection(pb?: BosBase): Promise<boolean> {
  let client = pb;
  
  if (!client) {
    try {
      client = new BosBase(BOSBASE_URL);
      await client.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);
    } catch (error) {
      console.error("Failed to authenticate with BosBase:", error);
      return false;
    }
  }

  try {
    // Try to access the collection to see if it exists
    // Use @rowid for sorting as it's always available
    await client.collection("api_calls").getList(1, 1, {
      sort: "-@rowid",
    });
    
    // Collection exists, check if we need to add missing fields
    try {
      // Get all collections and find api_calls by name
      const collections = await client.collections.getFullList();
      const collection = collections.find((c: any) => c.name === "api_calls");
      
      if (collection) {
        // Use 'fields' property (not 'schema') - BosBase uses 'fields' for collection schema
        const existingFields = collection.fields || [];
        const existingFieldNames = existingFields.map((f: any) => f.name);
        
        // Define required fields with proper structure
        const requiredFields = [
          { name: "endpoint", type: "text", required: true, options: { min: null, max: null, pattern: "" } },
          { name: "method", type: "text", required: true, options: { min: null, max: null, pattern: "" } },
          { name: "model", type: "text", required: false, options: { min: null, max: null, pattern: "" } },
          { name: "prompt", type: "text", required: false, options: { min: null, max: 1000, pattern: "" } },
          { name: "numImages", type: "number", required: false, options: { min: null, max: null } },
          { name: "width", type: "number", required: false, options: { min: null, max: null } },
          { name: "height", type: "number", required: false, options: { min: null, max: null } },
          { name: "success", type: "bool", required: false, options: {} },
          { name: "error", type: "text", required: false, options: { min: null, max: null, pattern: "" } },
          { name: "timestamp", type: "text", required: false, options: { min: null, max: null, pattern: "" } },
          // Note: For autodate fields, onCreate and onUpdate must be direct properties, not nested in options
          { name: "created", type: "autodate", required: false, onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", required: false, onCreate: true, onUpdate: true },
        ];
        
        // Check which fields are missing or need to be updated
        const missingFields = requiredFields.filter(
          (field) => !existingFieldNames.includes(field.name)
        );
        
        // Also check for fields that need to be updated (e.g., success field with wrong required setting)
        let needsUpdate = false;
        const updatedFields = existingFields.map((existingField: any) => {
          const requiredField = requiredFields.find((rf) => rf.name === existingField.name);
          if (requiredField) {
            // Check if the required setting needs to be updated (especially for success field)
            if (requiredField.name === "success" && existingField.required !== requiredField.required) {
              console.log(`Updating ${requiredField.name} field: required from ${existingField.required} to ${requiredField.required}`);
              needsUpdate = true;
              return {
                ...existingField,
                required: requiredField.required,
              };
            }
          }
          return existingField;
        });
        
        // Add missing fields
        if (missingFields.length > 0) {
          for (const missingField of missingFields) {
            updatedFields.push(missingField);
          }
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log(`Adding ${missingFields.length} missing fields and updating fields in api_calls collection`);
          
          // Update the collection with new/updated fields using SDK
          // Preserve all collection properties and only update fields
          await client.collections.update(collection.id, {
            fields: updatedFields,
            // Preserve other collection properties
            indexes: collection.indexes || [],
            listRule: collection.listRule || null,
            viewRule: collection.viewRule || null,
            createRule: collection.createRule || null,
            updateRule: collection.updateRule || null,
            deleteRule: collection.deleteRule || null,
          });
          
          console.log("Successfully updated api_calls collection fields via BosBase SDK");
        }
      }
    } catch (schemaError: any) {
      console.warn("Could not check/update collection schema:", schemaError.message);
      // Continue anyway - collection exists, fields might already be there
    }
    
    return true; // Collection exists
  } catch (error: any) {
    // Collection doesn't exist, try to create it
    if (error.status === 404) {
      try {
        // Create collection using collections service (extends CrudService)
        const collectionData: any = {
          name: "api_calls",
          type: "base",
          fields: [
            {
              name: "endpoint",
              type: "text",
              required: true,
              options: { min: null, max: null, pattern: "" },
            },
            {
              name: "method",
              type: "text",
              required: true,
              options: { min: null, max: null, pattern: "" },
            },
            {
              name: "model",
              type: "text",
              required: false,
              options: { min: null, max: null, pattern: "" },
            },
            {
              name: "prompt",
              type: "text",
              required: false,
              options: { min: null, max: 1000, pattern: "" }, // Increased to 1000 for longer prompts
            },
            {
              name: "numImages",
              type: "number",
              required: false,
              options: { min: null, max: null },
            },
            {
              name: "width",
              type: "number",
              required: false,
              options: { min: null, max: null },
            },
            {
              name: "height",
              type: "number",
              required: false,
              options: { min: null, max: null },
            },
            {
              name: "success",
              type: "bool",
              required: false, // Must be false to allow both true and false values
              options: {},
            },
            {
              name: "error",
              type: "text",
              required: false,
              options: { min: null, max: null, pattern: "" },
            },
            {
              name: "timestamp",
              type: "text",
              required: false,
              options: { min: null, max: null, pattern: "" },
            },
            {
              name: "created",
              type: "autodate",
              required: false,
              onCreate: true,
              onUpdate: false,
            },
            {
              name: "updated",
              type: "autodate",
              required: false,
              onCreate: true,
              onUpdate: true,
            },
          ],
          indexes: [],
          listRule: null,
          viewRule: null,
          createRule: "", // Empty string allows all creates (admin auth required)
          updateRule: null,
          deleteRule: null,
        };

        // Create the collection using the collections service
        await client.collections.create(collectionData);
        
        console.log("Successfully created api_calls collection in BosBase");
        
        // Wait a moment for the collection to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return true;
      } catch (createError: any) {
        console.error("Failed to create api_calls collection:", createError);
        console.error("Please create the collection manually in BosBase admin panel at:", BOSBASE_URL + "_/");
        return false;
      }
    }
    
    // Other error
    console.error("Error checking collection:", error);
    return false;
  }
}

