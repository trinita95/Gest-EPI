import app from "./apps";

const port = process.env.SERVER_PORT || 5500;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  
});
