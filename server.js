import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const app = express();
const PORT = process.env.PORT || 3001;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBOB_GR3cAzj8XD6vBZGpTEcALLE_j9ofM",
  authDomain: "stackblitz-firebase-demo.firebaseapp.com",
  projectId: "stackblitz-firebase-demo",
  storageBucket: "stackblitz-firebase-demo.appspot.com",
  messagingSenderId: "581786424162",
  appId: "1:581786424162:web:c604c41c0e2665f42487e7"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Enable CORS for all origins
app.use(cors());

// Endpoint to get the latest code snippet
app.get('/code', async (req, res) => {
  try {
    const q = query(
      collection(db, 'codes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send('No code snippets found');
    }

    const latestDoc = querySnapshot.docs[0];
    const codeData = latestDoc.data();

    // Return just the code content as plain text
    res.setHeader('Content-Type', 'text/plain');
    res.send(codeData.content || '');
  } catch (error) {
    console.error('Error fetching latest code:', error);
    res.status(500).send('Error fetching code snippet');
  }
});

// Endpoint to get latest code with metadata (JSON)
app.get('/code/latest', async (req, res) => {
  try {
    const q = query(
      collection(db, 'codes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'No code snippets found' });
    }

    const latestDoc = querySnapshot.docs[0];
    const codeData = latestDoc.data();

    res.json({
      id: latestDoc.id,
      ...codeData
    });
  } catch (error) {
    console.error('Error fetching latest code:', error);
    res.status(500).json({ error: 'Error fetching code snippet' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/code`);
});
