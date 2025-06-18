import React, { useState } from 'react';
import Layout from './components/Layout';
import MCRForm from './components/MCRForm';

function App() {
  const [selectedForm, setSelectedForm] = useState('mcr');

  return (
    <Layout onFormSelect={setSelectedForm}>
      {selectedForm === 'mcr' && <MCRForm />}
      {/* Add more forms here as needed */}
    </Layout>
  );
}

export default App;
