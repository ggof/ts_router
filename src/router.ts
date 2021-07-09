import { createServer, IncomingMessage, ServerResponse } from "http";

// const port = 8080

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

type Node = {
  path: String;
  handler: Handler;
  children: Node[];
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Router = { [key in Method]: Node };

const notFoundHandler: Handler = (_, res) => {
  res.writeHead(404, "NOT FOUND");
  res.flushHeaders();
};

const createNode = (
  path: string = "/",
  handler = notFoundHandler,
  children = []
): Node => ({ path, handler, children });


const createRegisterHandler =
  (router: Router) => (method: Method) => (path: string, handler: Handler) =>
    insertNode(path.split("/").filter(Boolean), handler, router[method]);

// recursive function to insert path in provided node and return it
const insertNode = (path: string[], handler: Handler, node: Node): void => {
  if (!path.length) {
    node.handler = handler;
    return;
  }

  const first = path.shift();

  for (const next of node.children) {
    if (next.path === first) {
      // try to insert in this one
      return insertNode(path, handler, next);
    }
  }

  // nothing matches, create a new node, push it to node's children and insert in it
  const next = createNode(first, handler);
  node.children.push(next);
  return insertNode(path, handler, next);
};

const matchRoute = (path: string[], elem: Node): Handler | undefined => {
  // this was the last element
  if (!path.length) {
    return elem.handler;
  }

  const first = path.shift();

  for (const next of elem.children) {
    if (next.path === first) {
      return matchRoute(path, next);
    }
  }
};

export default function createRouter(notFound: Handler = notFoundHandler) {
  const router: Router = {
    GET: createNode(),
    POST: createNode(),
    PUT: createNode(),
    PATCH: createNode(),
    DELETE: createNode(),
  };

  const registerHandler = createRegisterHandler(router);

  const listen = (port: number = 8080) =>
    createServer((req: IncomingMessage, res: ServerResponse) => {
      const { method = "GET", url = "/" } = req;
      const handler =
        matchRoute(url.split("/").filter(Boolean), router[method as Method]) ??
        notFound;
      handler(req, res);
      res.end();
    }).listen(port, () => console.log(`server listening on port ${port}`));

  // const createHandler = (method: string) => (path: string, handler: Handler) =>
  return {
    listen,
    GET: registerHandler("GET"),
    PUT: registerHandler("PUT"),
    POST: registerHandler("POST"),
    PATCH: registerHandler("PATCH"),
    DELETE: registerHandler("DELETE"),
  };
}
