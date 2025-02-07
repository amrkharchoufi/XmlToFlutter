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
        if (!response.ok) {
          throw new Error('Failed to load XSLT file');
        }
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
    // Ensure components exist before processing
    if (xsltContent && Array.isArray(components) && components.length > 0) {
      generateAndTransformXML();
    }
  }, [components, xsltContent]);

  const generateAndTransformXML = async () => {
    try {
      const generatedXml = generateXML();
      setXmlCode(generatedXml); // Update XML code state
      console.log('Generated XML:', generatedXml);

      // Validate XML before transformation
      const isValid = await validateXML(generatedXml);
      if (!isValid) {
        setValidationError('XML is invalid. Please check the structure.');
        return; // Stop processing if XML is invalid
      }

      setValidationError(null); // Clear error if XML is valid

      const transformedCode = await transformXML(generatedXml);
      setFlutterCode(transformedCode); // Update Flutter code state
    } catch (error) {
      console.error('Error during XML generation or transformation:', error);
      setValidationError('An error occurred. Check the console for details.');
    }
  };

  const generateXML = () => {
    const processComponent = (component) => {
      switch (component.type) {
        case 'Column':
          return `<Column mainAxisAlignment="${component.properties.mainAxisAlignment}" crossAxisAlignment="${component.properties.crossAxisAlignment}" backgroundColor="${component.properties.backgroundColor}">
${component.children.map((child) => processComponent(child)).join('\n')}
</Column>`;
        case 'Row':
          return `<Row mainAxisAlignment="${component.properties.mainAxisAlignment}" crossAxisAlignment="${component.properties.crossAxisAlignment}" backgroundColor="${component.properties.backgroundColor}">
${component.children.map((child) => processComponent(child)).join('\n')}
</Row>`;
        case 'Text':
          return `<Text value="${component.text.replace(/"/g, '&quot;')}" fontSize="${component.properties.fontSize}" color="${component.properties.textColor}" />`;
        case 'Button':
          return `<Button text="${component.text.replace(/"/g, '&quot;')}" color="${component.properties.buttonColor}" />`;
        case 'Input':
          return `<Input placeholder="${component.placeholder.replace(/"/g, '&quot;')}" backgroundColor="${component.properties.inputColor}" textColor="${component.properties.textColor}" fontSize="${component.properties.fontSize}" />`;
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
    if (!xsltContent) {
      throw new Error('XSLT content is not loaded');
    }

    try {
      // Perform XSLT transformation
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const xsltDoc = parser.parseFromString(xsltContent, 'application/xml');

      const processor = new XSLTProcessor();
      processor.importStylesheet(xsltDoc);

      const resultDoc = processor.transformToDocument(xmlDoc);

      // Extract text content and remove HTML wrapper
      let result = resultDoc.documentElement.textContent;

      // Clean up extra whitespace
      result = result
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Remove leading/trailing whitespace

      return result;
    } catch (error) {
      console.error('XSLT Transformation Error:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  return (
    <div className="code-generator">
      <h4>Generated Flutter Code:</h4>
      <pre>{flutterCode}</pre>
      <h4>Generated XML:</h4>
      <pre>{xmlCode}</pre>
      {validationError && (
        <div className="validation-error">
          <strong>Validation Error:</strong> {validationError}
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;
