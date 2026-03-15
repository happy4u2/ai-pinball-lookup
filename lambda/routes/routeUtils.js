export function getPathId(path, baseRoute) {
  if (!path.startsWith(baseRoute + "/")) return null;
  return decodeURIComponent(path.slice(baseRoute.length + 1));
}

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}
