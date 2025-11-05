import BosBase from "bosbase";

const BOSBASE_URL = process.env.BOSBASE_URL!;
const BOSBASE_EMAIL = process.env.BOSBASE_EMAIL!;
const BOSBASE_PASSWORD = process.env.BOSBASE_PASSWORD!;

interface GoogleUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/**
 * Get authenticated BosBase client
 */
async function getBosBaseClient(): Promise<BosBase | null> {
  try {
    if (!BOSBASE_URL || !BOSBASE_EMAIL || !BOSBASE_PASSWORD) {
      console.error("Missing BosBase environment variables");
      return null;
    }

    const pb = new BosBase(BOSBASE_URL);
    await pb.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);
    return pb;
  } catch (error) {
    console.error("Failed to initialize BosBase client:", error);
    return null;
  }
}

/**
 * Sync a user from NextAuth (Google) to Bosbase users collection
 * Creates a new user if they don't exist, or updates existing user
 * 
 * Note: This function assumes the "users" collection exists in Bosbase.
 * It should be an auth collection or a base collection with email field.
 */
export async function syncUserToBosbase(user: GoogleUser): Promise<string | null> {
  const pb = await getBosBaseClient();
  if (!pb) {
    return null;
  }

  try {
    // Check if user already exists by email
    // Escape quotes in email for filter query
    const escapedEmail = user.email.replace(/"/g, '\\"');
    
    try {
      const existingUser = await pb.collection("users").getFirstListItem(
        `email = "${escapedEmail}"`
      );

      // User exists, update with latest information
      const updateData: any = {
        name: user.name || existingUser.name,
      };

      // Only update fields that exist and have values
      if (user.image) {
        updateData.avatar_url = user.image;
      }

      // Add google_id field if collection supports it
      updateData.google_id = user.id;
      
      // Set verified status for Google accounts
      updateData.verified = true;

      const updatedUser = await pb.collection("users").update(existingUser.id, updateData);

      console.log(`Updated user ${user.email} in Bosbase`);
      return updatedUser.id;
    } catch (error: any) {
      // User doesn't exist (404), create new user
      if (error.status === 404 || error.status === 400) {
        try {
          const createData: any = {
            email: user.email,
            emailVisibility: true,
            name: user.name || user.email.split("@")[0],
            google_id: user.id,
            verified: true,
          };

          // Add avatar if available
          if (user.image) {
            createData.avatar_url = user.image;
          }

          // For auth collections, we might need password fields
          // Try to create without password first (for OAuth users)
          try {
            const newUser = await pb.collection("users").create(createData);
            console.log(`Created user ${user.email} in Bosbase`);
            return newUser.id;
          } catch (passwordError: any) {
            // If password is required, try with empty password
            if (passwordError.message?.includes("password") || passwordError.status === 400) {
              const newUser = await pb.collection("users").create({
                ...createData,
                password: "",
                passwordConfirm: "",
              });
              console.log(`Created user ${user.email} in Bosbase with empty password`);
              return newUser.id;
            }
            throw passwordError;
          }
        } catch (createError: any) {
          console.error("Failed to create user in Bosbase:", createError);
          // Log the error details for debugging
          if (createError.data) {
            console.error("Validation errors:", createError.data);
          }
          return null;
        }
      } else {
        // Other error (permission, etc.)
        console.error("Failed to check user existence in Bosbase:", error);
        return null;
      }
    }
  } catch (error: any) {
    console.error("Failed to sync user to Bosbase:", error);
    return null;
  }
}

