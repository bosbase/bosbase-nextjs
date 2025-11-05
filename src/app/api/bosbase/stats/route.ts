import { NextRequest, NextResponse } from "next/server";
import BosBase from "bosbase";
import { ensureApiCallsCollection } from "@/lib/bosbase/init-collection";

const BOSBASE_URL = process.env.BOSBASE_URL!;
const BOSBASE_EMAIL = process.env.BOSBASE_EMAIL!;
const BOSBASE_PASSWORD = process.env.BOSBASE_PASSWORD!;

async function getBosBaseClient(): Promise<BosBase | null> {
  try {
    if (!BOSBASE_URL || !BOSBASE_EMAIL || !BOSBASE_PASSWORD) {
      console.error("Missing BosBase environment variables. Please set BOSBASE_URL, BOSBASE_EMAIL, and BOSBASE_PASSWORD in .env");
      return null;
    }

    const pb = new BosBase(BOSBASE_URL);
    await pb.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);
    
    // Ensure collection exists before querying
    await ensureApiCallsCollection(pb);
    
    return pb;
  } catch (error) {
    console.error("Failed to initialize BosBase client:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const pb = await getBosBaseClient();
    
    if (!pb) {
      return NextResponse.json(
        {
          totalCalls: 0,
          callsToday: 0,
          callsThisMonth: 0,
        },
        { status: 200 }
      );
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      // Get total calls - use getList with page 1 and perPage 1 to get totalItems
      // Use @rowid for sorting as it's always available
      const totalResult = await pb.collection("api_calls").getList(1, 1, {
        sort: "-@rowid",
      });
      const totalCalls = totalResult.totalItems || 0;

      // Since date filtering on 'created' field is failing, we'll fetch all records
      // and filter them in JavaScript. For large datasets, consider pagination.
      let callsToday = 0;
      let callsThisMonth = 0;
      let lastCallTime: number | undefined = undefined;

      if (totalCalls > 0) {
        try {
          // Fetch all records (or use pagination if needed)
          // Using getFullList to get all records, but with a reasonable batch size
          const allRecords = await pb.collection("api_calls").getFullList({
            batch: 500, // Process in batches of 500
          });

          // Filter records in JavaScript
          const todayTimestamp = today.getTime();
          const monthTimestamp = monthStart.getTime();

          for (const record of allRecords) {
            // Try to get created timestamp from either 'created' or 'timestamp' field
            let recordTime: number | null = null;
            
            if (record.created) {
              recordTime = new Date(record.created).getTime();
            } else if (record.timestamp) {
              recordTime = new Date(record.timestamp).getTime();
            }

            if (recordTime) {
              // Track last call time
              if (!lastCallTime || recordTime > lastCallTime) {
                lastCallTime = recordTime;
              }

              // Count today's calls
              if (recordTime >= todayTimestamp) {
                callsToday++;
              }

              // Count this month's calls
              if (recordTime >= monthTimestamp) {
                callsThisMonth++;
              }
            }
          }
        } catch (fetchError: any) {
          // If fetching all records fails, just return total counts
          console.warn("Failed to fetch all records for filtering:", fetchError.message);
          // Use totalItems as fallback for today/month if we can't filter
          callsToday = 0;
          callsThisMonth = 0;
        }
      }

      return NextResponse.json({
        totalCalls: totalCalls,
        callsToday: callsToday,
        callsThisMonth: callsThisMonth,
        lastCallTime: lastCallTime,
      });
    } catch (collectionError: any) {
      // Collection might not exist yet or there's a query error - return zero stats
      if (collectionError.status === 404 || collectionError.status === 400) {
        console.warn("api_calls collection query error:", collectionError.status, collectionError.message);
        return NextResponse.json(
          {
            totalCalls: 0,
            callsToday: 0,
            callsThisMonth: 0,
          },
          { status: 200 }
        );
      }
      throw collectionError;
    }
  } catch (error: any) {
    console.error("Failed to get stats:", error);
    return NextResponse.json(
      {
        totalCalls: 0,
        callsToday: 0,
        callsThisMonth: 0,
      },
      { status: 200 }
    );
  }
}

