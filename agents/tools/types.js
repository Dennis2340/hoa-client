/**
 * Tool Types and Interfaces for GovVerify Agent
 * Defines the structure for tools, handlers, and contexts
 */

/**
 * @typedef {Object} ToolDefinition
 * @property {string} type - The type of tool (always "function")
 * @property {Object} function - The function definition
 * @property {string} function.name - The name of the function
 * @property {string} function.description - Description of what the function does
 * @property {Object} function.parameters - JSON Schema for parameters
 */

/**
 * @typedef {Object} LocationContext
 * @property {boolean} [hasLocation] - Whether location is available
 * @property {number} [latitude] - Latitude coordinate
 * @property {number} [longitude] - Longitude coordinate
 * @property {string} [locationDescription] - Human-readable location description
 */

/**
 * @typedef {Object} MediaContext
 * @property {boolean} hasMedia - Whether media is present
 * @property {string} [mediaType] - Type of media (image, video, document)
 * @property {string} [mediaUrl] - URL to access the media
 * @property {string} [caption] - Caption attached to the media
 */

/**
 * @typedef {Object} VerificationContext
 * @property {string} [verificationId] - ID of ongoing verification
 * @property {string} [documentType] - Type of document being verified
 * @property {string} [status] - Current status of verification
 * @property {string} [description] - Description of verification request
 */

/**
 * @typedef {Object} ToolContext
 * @property {string} currentUserPhone - E164 formatted phone number of current user
 * @property {LocationContext} [currentLocationContext] - Location information if available
 * @property {MediaContext} [currentMediaContext] - Media information if available
 * @property {VerificationContext} [currentVerificationContext] - Verification context if available
 * @property {Function} sendWhatsAppMessage - Function to send WhatsApp messages
 */

/**
 * @callback ToolHandler
 * @param {Object} args - Arguments passed to the tool
 * @param {ToolContext} context - Context information for the tool
 * @returns {Promise<Object>} Result of the tool execution
 */

module.exports = {};
