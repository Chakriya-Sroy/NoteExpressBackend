import express from 'express';
import dotev from "dotenv";

dotev.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));    

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


const port=process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;