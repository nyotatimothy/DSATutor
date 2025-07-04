'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';

export default function TestApiPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testApi = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      
      if (response.ok) {
        setApiData(data);
      } else {
        setError(`API Error: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test API Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testApi} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test /api/courses'}
          </Button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {apiData && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 