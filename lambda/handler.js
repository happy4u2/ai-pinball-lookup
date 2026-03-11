/*
========================================================
AI Pinball Lookup Service
AWS Lambda Handler

This Lambda acts as the central API router for the
SwissPinball AI backend.

Responsibilities:
1. Machine lookup via OPDB
2. Machine metadata enrichment
3. IPDB manual discovery
4. Cache management
5. Customer CRUD API

Architecture flow:

Client
  ↓
API Gateway
  ↓
Lambda handler
  ↓
Route dispatcher
  ↓
Services (OPDB / metadata / cache / customer)

========================================================
*/

/*
========================================================
Service Imports
Each service encapsulates a specific responsibility.
========================================================
*/

// OPDB search service (typeahead)
import { opdbService } from "./scripts/opdbService.js";

// OPDB machine detail lookup
import { opdbDetailService } from "./scripts/opdbDetailService.js";

// Normalizes OPDB response into internal machine schema
import { normalizeMachine } from "./scripts/normalizeMachine.js";

// Cache read/write
import { getCachedMachine, saveCachedMachine } from "./scripts/cacheService.js";

// Resolves ambiguous machine matches
import { resolveMatch } from "./scripts/resolveMatch.js";

// Metadata storage
import { getMetadata, saveMetadata } from "./scripts/metadataService.js";

// Creates an empty metadata structure for new machines
import { createMetadataShell } from "./scripts/metadataMapper.js";

// Combines OPDB machine data + internal metadata
import { mergeMachineData } from "./scripts/mergeMachineData.js";

// Builds consistent metadata IDs
import { buildMachineId } from "./scripts/metadataKeys.js";

// Scrapes IPDB for manuals
import { discoverIpdbManuals } from "./scripts/ipdbManualService.js";

// Updates metadata fields
import { updateMetadataRecord } from "./scripts/updateMetadataRecord.js";

// Customer API services
import {
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "./scripts/customerService.js";

/*
========================================================
UTILITY FUNCTIONS
========================================================
*/

/*
Normalize machine name for cache keys.

Example:
"Twilight Zone" → "twilight zone"
*/
function normalizeCacheKey(text) {
  return (text || "").trim().toLowerCase();
}

/*
Normalize API Gateway paths.

API Gateway may prepend stage paths like:
 /prod/machine

This removes "/prod".
*/
function normalizePath(path = "") {
  return path.replace(/^\/prod(?=\/|$)/, "") || "/";
}

/*
Extracts ID from routes like:

/customers/123

baseRoute = "/customers"
returns "123"
*/
function getPathId(path, baseRoute) {
  if (!path.startsWith(baseRoute + "/")) return null;
  return decodeURIComponent(path.slice(baseRoute.length + 1));
}

/*
========================================================
METADATA ENRICHMENT PIPELINE
========================================================

Adds additional metadata to machine results.

Data sources:

1. OPDB
2. Internal metadata store
3. IPDB manuals discovery

Flow:

machine (OPDB)
   ↓
lookup metadata
   ↓
create shell if missing
   ↓
discover manuals
   ↓
merge machine + metadata
   ↓
return enriched result
========================================================
*/

async function enrichWithMetadata(machine) {
  // Build consistent metadata key
  const metadataMachineId = buildMachineId(machine.opdb_id || machine.id);

  // Fetch metadata if it exists
  let metadata = await getMetadata(metadataMachineId);

  /*
  If metadata does not exist,
  create an empty metadata shell.
  */
  if (!metadata) {
    metadata = createMetadataShell(machine);
    metadata = await saveMetadata(metadata);

    console.log("Created metadata shell:", metadataMachineId);
  }

  /*
  Determine if we already have manuals.
  */
  const hasManuals =
    Array.isArray(metadata.manuals) && metadata.manuals.length > 0;

  /*
  Determine IPDB ID.
  */
  const ipdbId =
    metadata.references?.ipdbId || machine.ipdb_id || metadata.ipdbId || null;

  /*
  If manuals are missing and IPDB ID exists,
  attempt to discover manuals from IPDB.
  */
  if (!hasManuals && ipdbId) {
    console.log("Attempting IPDB manual discovery for:", ipdbId);

    const discovery = await discoverIpdbManuals(ipdbId);

    /*
    Update metadata with IPDB results.
    */
    metadata = {
      ...metadata,

      references: {
        ...(metadata.references || {}),
        ipdbId,
        ipdbMachineUrl: discovery.ipdbMachineUrl,
      },

      manuals: discovery.manuals,

      enrichment: {
        ...(metadata.enrichment || {}),
        manualsSource: "ipdb",
        manualsFetchStatus: discovery.manualsFetchStatus,
        manualsFetchedAt: discovery.manualsFetchedAt,
      },
    };

    metadata = await saveMetadata(metadata);

    console.log("IPDB manual discovery status:", discovery.manualsFetchStatus);
  }

  /*
  Merge OPDB machine data with metadata.
  */
  return mergeMachineData(machine, metadata);
}

/*
========================================================
MAIN LAMBDA HANDLER
========================================================
*/

export const handler = async (event) => {
  try {
    console.log("Raw event:", JSON.stringify(event));

    /*
    Parse request body.
    API Gateway may send body as JSON string.
    */

    let body = {};

    if (event.body) {
      body =
        typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }

    /*
    Determine request context.
    */

    const httpMethod =
      event.requestContext?.http?.method || event.httpMethod || "GET";

    const action = body.action || null;

    const rawPath =
      event.rawPath || event.requestContext?.http?.path || event.path || "/";

    const path = normalizePath(rawPath);

    const searchQuery = event.queryStringParameters?.q;

    console.log("ROUTE DEBUG:", { httpMethod, rawPath, path });

    /*
    ==================================================
    CUSTOMER ROUTES
    ==================================================
    */

    /*
    POST /customers
    Create customer
    */
    if (httpMethod === "POST" && path === "/customers") {
      const result = await createCustomer(body);
      return response(201, result);
    }

    /*
    GET /customers
    List customers
    */
    if (httpMethod === "GET" && path === "/customers") {
      const result = await listCustomers();
      return response(200, result);
    }

    /*
    GET /customers/{id}
    Retrieve single customer
    */
    if (httpMethod === "GET" && path.startsWith("/customers/")) {
      const customerId = getPathId(path, "/customers");

      if (!customerId) {
        return response(400, { error: "Missing customerId" });
      }

      const result = await getCustomer(customerId);

      if (!result) {
        return response(404, { error: "Customer not found" });
      }

      return response(200, {
        ok: true,
        customer: result,
      });
    }

    /*
    PUT /customers/{id}
    Update customer
    */
    if (httpMethod === "PUT" && path.startsWith("/customers/")) {
      const customerId = getPathId(path, "/customers");

      if (!customerId) {
        return response(400, { error: "Missing customerId" });
      }

      console.log("Updating customer:", { customerId, body });

      const result = await updateCustomer(customerId, body);

      if (!result) {
        return response(404, { error: "Customer not found" });
      }

      return response(200, result);
    }

    /*
    ==================================================
    MACHINE METADATA UPDATE
    ==================================================
    */

    /*
    POST /machine
    action = updateMetadata

    Used to update machine metadata fields.
    */
    if (
      httpMethod === "POST" &&
      path === "/machine" &&
      action === "updateMetadata"
    ) {
      const metadataMachineId = body.machineId;

      if (!metadataMachineId) {
        return response(400, {
          error: "Missing machineId",
        });
      }

      let metadata = await getMetadata(metadataMachineId);

      if (!metadata) {
        return response(404, {
          error: "Metadata record not found",
          machineId: metadataMachineId,
        });
      }

      metadata = updateMetadataRecord(metadata, body);
      metadata = await saveMetadata(metadata);

      return response(200, {
        ok: true,
        machineId: metadataMachineId,
        updatedMetadata: metadata,
      });
    }

    /*
    ==================================================
    MACHINE ROUTES
    ==================================================
    */

    if (path === "/machine") {
      /*
      Machine lookup parameters
      */

      const machineName =
        body.machineName ||
        event.queryStringParameters?.name ||
        event.queryStringParameters?.machineName;

      const machineId = body.id || event.queryStringParameters?.id;

      /*
      Validate request
      */

      if (!machineName && !machineId && !searchQuery) {
        return response(400, { error: "Missing machineName, id, or q" });
      }

      /*
      ------------------------------------------------
      TYPEAHEAD SEARCH
      ------------------------------------------------
      */

      if (searchQuery) {
        console.log("Typeahead search:", searchQuery);

        const results = await opdbService(searchQuery);

        const suggestions = results.slice(0, 10).map((item) => ({
          id: item.id,
          text: item.text,
          name: item.name,
          supplementary: item.supplementary,
          display: item.display,
        }));

        return response(200, {
          mode: "typeahead",
          query: searchQuery,
          suggestions,
        });
      }

      /*
      ------------------------------------------------
      MACHINE LOOKUP BY ID
      ------------------------------------------------
      */

      if (machineId) {
        const idCacheKey = `id:${machineId}`;

        console.log("Checking ID cache for:", idCacheKey);

        const cached = await getCachedMachine(idCacheKey);

        /*
        Cache hit
        */
        if (cached) {
          console.log("ID cache hit for:", idCacheKey);

          const enrichedMachine = await enrichWithMetadata(cached.result);

          return response(200, {
            mode: "result",
            source: cached.source,
            query: cached.query,
            selectedMatch: cached.selectedMatch,
            result: enrichedMachine,
            cache: {
              hit: true,
              cachedAt: cached.cachedAt,
            },
          });
        }

        /*
        Cache miss → call OPDB
        */

        console.log("Direct machine lookup by ID:", machineId);

        const machineDetails = await opdbDetailService(machineId);

        const normalizedResult = normalizeMachine(machineDetails);

        const enrichedMachine = await enrichWithMetadata(normalizedResult);

        /*
        Save result to cache
        */

        const payload = {
          source: "opdb-machine",
          query: machineDetails.name,
          selectedMatch: {
            id: machineDetails.opdb_id,
            text: machineDetails.name,
            name: machineDetails.name,
            supplementary: null,
            display: machineDetails.display || null,
          },
          result: enrichedMachine,
        };

        await saveCachedMachine(`id:${machineDetails.opdb_id}`, payload);

        console.log(
          "Saved ID-based cache entry:",
          `id:${machineDetails.opdb_id}`,
        );

        return response(200, {
          mode: "result",
          source: payload.source,
          query: machineDetails.name,
          selectedMatch: payload.selectedMatch,
          result: payload.result,
          cache: {
            hit: false,
            cachedAt: null,
          },
        });
      }

      /*
      ------------------------------------------------
      EXACT NAME CACHE LOOKUP
      ------------------------------------------------
      */

      const nameCacheKey = `name:${normalizeCacheKey(machineName)}`;

      console.log("Checking exact-name cache for:", nameCacheKey);

      const cachedByName = await getCachedMachine(nameCacheKey);

      if (cachedByName) {
        console.log("Exact-name cache hit for:", nameCacheKey);

        const enrichedMachine = await enrichWithMetadata(cachedByName.result);

        return response(200, {
          mode: "result",
          source: cachedByName.source,
          query: cachedByName.query,
          selectedMatch: cachedByName.selectedMatch,
          result: enrichedMachine,
          cache: {
            hit: true,
            cachedAt: cachedByName.cachedAt,
          },
        });
      }

      /*
      ------------------------------------------------
      SEARCH OPDB
      ------------------------------------------------
      */

      console.log("Cache miss. Searching OPDB for:", machineName);

      const primaryResults = await opdbService(machineName);

      /*
      Some machines exist with "The" prefix.
      Example:

      "Lost World Jurassic Park"
      vs
      "The Lost World Jurassic Park"

      This performs a secondary search.
      */

      let results = [...primaryResults];

      if (!machineName.toLowerCase().startsWith("the ")) {
        const altQuery = `The ${machineName}`;
        const altResults = await opdbService(altQuery);

        const seen = new Set(results.map((r) => r.id));

        for (const item of altResults) {
          if (!seen.has(item.id)) {
            results.push(item);
            seen.add(item.id);
          }
        }
      }

      /*
      No matches
      */

      if (!results.length) {
        return response(404, {
          mode: "not_found",
          error: "Machine not found",
          query: machineName,
          matches: [],
        });
      }

      /*
      Resolve best match
      */

      const matchResolution = resolveMatch(machineName, results);

      /*
      If ambiguous → return choices
      */

      if (matchResolution.mode === "disambiguation") {
        console.log("Disambiguation required for:", machineName);

        return response(200, {
          mode: "disambiguation",
          query: machineName,
          matches: matchResolution.matches,
          cache: {
            hit: false,
            cachedAt: null,
          },
        });
      }

      /*
      Best match found
      */

      const bestMatch = matchResolution.selectedMatch;

      /*
      Reuse ID cache if possible
      */

      const idCacheKey = `id:${bestMatch.id}`;

      const cached = await getCachedMachine(idCacheKey);

      if (cached) {
        console.log("Reusing ID cache for:", idCacheKey);

        const enrichedMachine = await enrichWithMetadata(cached.result);

        return response(200, {
          mode: "result",
          source: cached.source,
          query: machineName,
          selectedMatch: cached.selectedMatch,
          result: enrichedMachine,
          cache: {
            hit: true,
            cachedAt: cached.cachedAt,
          },
        });
      }

      /*
      Fetch machine details
      */

      const machineDetails = await opdbDetailService(bestMatch.id);

      const normalizedResult = normalizeMachine(machineDetails);

      const enrichedMachine = await enrichWithMetadata(normalizedResult);

      /*
      Save to cache
      */

      const payload = {
        source: "opdb-machine",
        query: bestMatch.name,
        selectedMatch: {
          id: bestMatch.id,
          text: bestMatch.text,
          name: bestMatch.name,
          supplementary: bestMatch.supplementary,
          display: bestMatch.display,
        },
        result: enrichedMachine,
      };

      await saveCachedMachine(`id:${bestMatch.id}`, payload);

      console.log("Saved resolved ID cache entry:", `id:${bestMatch.id}`);

      return response(200, {
        mode: "result",
        source: payload.source,
        query: machineName,
        selectedMatch: payload.selectedMatch,
        result: payload.result,
        cache: {
          hit: false,
          cachedAt: null,
        },
      });
    }

    /*
    ------------------------------------------------
    ROUTE NOT FOUND
    ------------------------------------------------
    */

    return response(404, {
      error: "Route not found",
      method: httpMethod,
      path,
      rawPath,
    });
  } catch (error) {
    console.error("Handler error:", error);

    return response(500, {
      error: "Internal server error",
      message: error.message,
    });
  }
};

/*
========================================================
STANDARD API RESPONSE FORMAT
========================================================
*/

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
