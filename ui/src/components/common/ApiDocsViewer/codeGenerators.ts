import { CodeLanguage, EndpointDefinition } from './types';

export const generateCodeExample = (
  endpoint: EndpointDefinition,
  language: CodeLanguage,
  baseUrl: string,
  apiKey: string
): string => {
  const fullUrl = `${baseUrl}${endpoint.path}`;
  const bodyJson = endpoint.body ? endpoint.body.replace(/\n/g, '').replace(/\s+/g, ' ') : '';

  switch (language) {
    case 'curl':
      return generateCurl(endpoint, fullUrl, apiKey, bodyJson);
    case 'javascript':
      return generateJavaScript(endpoint, fullUrl, apiKey);
    case 'python':
      return generatePython(endpoint, fullUrl, apiKey);
    case 'php':
      return generatePhp(endpoint, fullUrl, apiKey);
    case 'go':
      return generateGo(endpoint, fullUrl, apiKey, bodyJson);
    default:
      return '';
  }
};

const generateCurl = (
  endpoint: EndpointDefinition,
  url: string,
  apiKey: string,
  bodyJson: string
): string => {
  return `curl -X ${endpoint.method} "${url}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}"${
    endpoint.body
      ? ` \\
  -d '${bodyJson}'`
      : ''
  }`;
};

const generateJavaScript = (endpoint: EndpointDefinition, url: string, apiKey: string): string => {
  return `const axios = require('axios');

const response = await axios.${endpoint.method.toLowerCase()}(
  '${url}',${
    endpoint.body
      ? `
  ${endpoint.body},`
      : ''
  }
  {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': '${apiKey}'
    }
  }
);

console.log(response.data);`;
};

const generatePython = (endpoint: EndpointDefinition, url: string, apiKey: string): string => {
  return `import requests

response = requests.${endpoint.method.toLowerCase()}(
    '${url}',${
      endpoint.body
        ? `
    json=${endpoint.body.replace(/"/g, "'")},`
        : ''
    }
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': '${apiKey}'
    }
)

print(response.json())`;
};

const generatePhp = (endpoint: EndpointDefinition, url: string, apiKey: string): string => {
  return `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${url}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${endpoint.method}');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ${apiKey}'
]);${
    endpoint.body
      ? `
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${endpoint.body.replace(/"/g, "'")}));`
      : ''
  }

$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response, true));
?>`;
};

const generateGo = (
  endpoint: EndpointDefinition,
  url: string,
  apiKey: string,
  bodyJson: string
): string => {
  return `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "${url}"${
      endpoint.body
        ? `
    payload := []byte(\`${bodyJson}\`)
    req, _ := http.NewRequest("${endpoint.method}", url, bytes.NewBuffer(payload))`
        : `
    req, _ := http.NewRequest("${endpoint.method}", url, nil)`
    }
    
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Key", "${apiKey}")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;
};
