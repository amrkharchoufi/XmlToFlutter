import * as xmllint from 'xmllint-wasm';

export const validateXML = async (xmlString) => {
  try {
    // Fetch XSD Schema
    const xsdResponse = await fetch('/src/components/ui-components.xsd');

    // Ensure the response is OK
    if (!xsdResponse.ok) {
      throw new Error(`Failed to load XSD file: ${xsdResponse.status} ${xsdResponse.statusText}`);
    }

    const xsdText = await xsdResponse.text();
    console.log('XSD Schema Response (First 200 chars):', xsdText.substring(0, 200));

    // Check if the response is an error page
    if (xsdText.startsWith('<!DOCTYPE html>') || xsdText.includes('<html')) {
      throw new Error('Invalid XSD file: The server returned an HTML page instead of an XSD schema.');
    }

    // Validate XML using xmllint
    if (xmllint && xmllint.validateXML) {
      const result = xmllint.validateXML({
        xml: xmlString,
        schema: xsdText,
      });

      return result.errors ? false : true;
    } else {
      console.warn('⚠️ xmllint is not available, falling back to basic XML validation.');

      // Fallback: Basic XML parsing validation
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      // Check for parsing errors
      const errors = xmlDoc.getElementsByTagName('parsererror');
      if (errors.length > 0) {
        console.error('XML Validation Error:', errors[0].textContent);
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('XML Validation Error:', error);
    return false;
  }
};
