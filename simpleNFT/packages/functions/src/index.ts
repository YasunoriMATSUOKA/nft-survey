import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";

// firebase initialize
admin.initializeApp();
const db = admin.firestore();

// express initialize
const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// Todo: This is not secure!
// cors
app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET");
  response.header("Access-Control-Allow-Headers", "*");
  next();
});
// logger
app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (request) {
    functions.logger.info(`${request.method} ${request.url}`);
    functions.logger.debug("request", {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query
    });
  }
  next();
});
// error handling
app.use((error: express.Errback, request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (error) {
    functions.logger.error("error", error);
    response.status(500).send({"error": error});
  } else {
    next();
  }
});

// api v1
app.get("/v1/tokens/:tokenId", async (request, response) => {
  const tokenId: number = parseInt(request.params.tokenId);
  functions.logger.debug("tokenId", tokenId);
  
  const tokensSnapshot = await db.collection('tokens').where("contractTokenId", "==", tokenId).get();
  if (tokensSnapshot.empty) {
    throw Error("No matching documents!");
  }
  const tokensData = tokensSnapshot.docs.map(doc => doc.data());
  functions.logger.debug("tokens", tokensData);

  const description: string = tokensData[0]["metadataDescription"];
  const externalUrl: string = tokensData[0]["metadataExternalUrl"];
  const imageUrl: string = tokensData[0]["metadataImage"];
  const name: string = tokensData[0]["metadataName"];
  
  const responseJson = {
    description: description,
    external_url: externalUrl,
    image: imageUrl,
    name: name,
  }
  functions.logger.info("responseJson", responseJson);
  response.status(200).send(responseJson);
});

exports.api = functions
  .runWith({memory: "128MB"})
  .region("asia-northeast1")
  .https
  .onRequest(app);
