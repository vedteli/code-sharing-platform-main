import { useEffect, useState } from 'react';
import { getLatestCode } from '../api/code';

export default function CodeAPI() {
  const [code, setCode] = useState<string>('Loading...');

  useEffect(() => {
    getLatestCode().then(setCode);
  }, []);

  return (
    <pre style={{
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      fontFamily: 'monospace',
      margin: 0,
      padding: '1rem'
    }}>
      {code}
    </pre>
  );
}
