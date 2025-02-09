import { useState, useEffect } from 'react';
import { validateXML } from '../utils/validateXML'; // Import the validation function

const CodeGenerator = ({ components }) => {
  const [xsltContent, setXsltContent] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [flutterCode, setFlutterCode] = useState('');
  const [xmlCode, setXmlCode] = useState('');

  useEffect(() => {
    // Fetch XSLT content
    fetch('/src/components/flutter-transformer.xslt')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load XSLT file');
        return response.text();
      })
      .then((data) => {
        console.log('XSLT file loaded successfully');
        setXsltContent(data);
      })
      .catch((error) => {
        console.error('Error loading XSLT file:', error);
        setValidationError('Failed to load XSLT file. Check the console for details.');
      });
  }, []);

  useEffect(() => {
    // Track changes in components and regenerate XML
    if (xsltContent && Array.isArray(components)) {
      if (components.length > 0) {
        generateAndTransformXML();
      } else {
        // Clear XML & Flutter code when all components are removed
        setXmlCode('');
        setFlutterCode('');
      }
    }
  }, [components, xsltContent]);

  const generateAndTransformXML = async () => {
    try {
      const generatedXml = generateXML();
      setXmlCode(generatedXml);
      console.log('Generated XML:', generatedXml);

      // Validate XML before transformation
      const isValid = await validateXML(generatedXml);
      if (!isValid) {
        setValidationError('XML is invalid. Please check the structure.');
        return;
      }

      setValidationError(null); // Clear error if XML is valid

      const transformedCode = await transformXML(generatedXml);
      setFlutterCode(transformedCode);
    } catch (error) {
      console.error('Error during XML generation or transformation:', error);
      setValidationError('An error occurred. Check the console for details.');
    }
  };

  const generateXML = () => {
    const processComponent = (component) => {
      if (!component) return ''; // Ensure component exists

      switch (component.type) {
        case 'Column':
          return `<Column mainAxisAlignment="${component.properties.mainAxisAlignment}" crossAxisAlignment="${component.properties.crossAxisAlignment}" backgroundColor="${component.properties.backgroundColor}">
${component.children?.map((child) => processComponent(child)).join('\n') || ''}
</Column>`;
        case 'Row':
          return `<Row mainAxisAlignment="${component.properties.mainAxisAlignment}" crossAxisAlignment="${component.properties.crossAxisAlignment}" backgroundColor="${component.properties.backgroundColor}">
${component.children?.map((child) => processComponent(child)).join('\n') || ''}
</Row>`;
        case 'Text':
          return `<Text value="${component.text?.replace(/"/g, '&quot;')}" fontSize="${component.properties.fontSize}" color="${component.properties.textColor}" />`;
        case 'Button':
          return `<Button text="${component.text?.replace(/"/g, '&quot;')}" color="${component.properties.buttonColor}" />`;
        case 'Input':
          return `<Input placeholder="${component.placeholder?.replace(/"/g, '&quot;')}" backgroundColor="${component.properties.inputColor}" textColor="${component.properties.textColor}" fontSize="${component.properties.fontSize}" />`;
        default:
          return '';
      }
    };

    const xmlContent = components.map((comp) => processComponent(comp)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<UIComponent>
${xmlContent}
</UIComponent>`;
  };

  const transformXML = async (xmlString) => {
    if (!xsltContent) throw new Error('XSLT content is not loaded');
  
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const xsltDoc = parser.parseFromString(xsltContent, 'application/xml');
  
      const processor = new XSLTProcessor();
      processor.importStylesheet(xsltDoc);
  
      const resultDoc = processor.transformToDocument(xmlDoc);
      let result = resultDoc.documentElement.textContent;
  
      // Ensure proper formatting with indentation and new lines
      result = result
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/([{};])/g, '$1\n') // Add new lines after braces and semicolons
        .replace(/\n\s*\n/g, '\n') // Remove excess blank lines
        .trim();
  
      return result;
    } catch (error) {
      console.error('XSLT Transformation Error:', error);
      throw error;
    }
  };
  

  return (
    <div className="code-generator">
     
      <h4>Generated Flutter Code:</h4>
      <pre>{flutterCode || 'No Flutter code available'}</pre>
      <h4>Generated XML:</h4>
      <pre>{xmlCode || 'No components available'}</pre>
      {validationError && (
        <div className="validation-error">
          <strong>Validation Error:</strong> {validationError}
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;
