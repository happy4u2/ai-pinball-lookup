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
    },
    body: JSON.stringify(body),
  };
}
