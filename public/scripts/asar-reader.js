/**
 * 🗃️ Browser-compatible ASAR Archive Reader
 * 
 * ASAR format:
 * - Header size (4 bytes, UInt32LE)
 * - JSON size (4 bytes, UInt32LE)
 * - Alignment (4 bytes, UInt32LE)
 * - JSON header (UTF-8 string)
 * - File data (concatenated)
 * 
 * JSON header structure:
 * {
 *   "files": {
 *     "filename.ext": { "size": 1234, "offset": "0" },
 *     "folder": {
 *       "files": {
 *         "nested.txt": { "size": 567, "offset": "1234" }
 *       }
 *     }
 *   }
 * }
 */

class AsarReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    this.fileTree = null;
    this.normalizedFileTree = null;
    this.dataOffset = 0;
    
    this._parseHeader();
  }

  /**
   * Parse ASAR header
   */
  _parseHeader() {
    try {
  // Desktop ASAR files use Chromium's Pickle format for metadata.
  // Layout is:
  // [0..3]   uint32 payload size of size-pickle (always 4)
  // [4..7]   uint32 header byte length (headerSize)
  // [8..11]  uint32 payload size of header-pickle (aligned string length)
  // [12..15] uint32 JSON string length
  // [16..]   JSON header bytes (with 0-padding to 4-byte boundary)

  const headerSize = this.dataView.getUint32(4, true);
  const headerPayloadSize = this.dataView.getUint32(8, true);
  const jsonLength = this.dataView.getUint32(12, true);

  const jsonStart = 16;
  const jsonEnd = jsonStart + jsonLength;
  const jsonBytes = this.buffer.slice(jsonStart, jsonEnd);
  const headerText = new TextDecoder('utf-8').decode(jsonBytes);

  this.fileTree = JSON.parse(headerText);

  // File data begins immediately after the header pickle (8 + headerSize bytes)
  this.dataOffset = 8 + headerSize;

  // Create normalized file tree for cross-platform path compatibility
  this.normalizedFileTree = this._normalizeFileTree(this.fileTree);

  console.log(`📦 [ASAR] Header size: ${headerSize}, payload size: ${headerPayloadSize}`);
  console.log(`✅ [ASAR] Data starts at byte ${this.dataOffset}`);
  console.log(`📁 [ASAR] File tree:`, this.fileTree);

    } catch (error) {
      console.error('❌ [ASAR] Failed to parse header:', error);
      throw error;
    }
  }

  /**
   * Normalize file tree to use forward slashes
   */
  _normalizeFileTree(node, currentPath = '') {
    if (!node.files) {
      // It's a file, return as-is
      return node;
    }

    // It's a directory, normalize its children
    const normalizedFiles = {};
    
    for (const [key, value] of Object.entries(node.files)) {
      // Normalize the key (replace backslashes with forward slashes)
      const normalizedKey = key.replace(/\\/g, '/');
      normalizedFiles[normalizedKey] = this._normalizeFileTree(value, 
        currentPath ? `${currentPath}/${normalizedKey}` : normalizedKey
      );
    }
    
    return { files: normalizedFiles };
  }

  /**
   * Get file info from path
   * @param {string} filePath - Path like "assets/audio/music.mp3"
   * @returns {Object|null} File info with {size, offset}
   */
  _getFileInfo(filePath) {
    // Normalize path separators - ASAR may contain Windows backslashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(p => p.length > 0);
    let current = this.normalizedFileTree.files;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (!current[part]) {
        return null; // Path not found
      }
      
      if (i === parts.length - 1) {
        // Last part - should be a file
        const info = current[part];
        if (info.files) {
          return null; // It's a directory, not a file
        }
        return info;
      } else {
        // Intermediate part - should be a directory
        if (!current[part].files) {
          return null; // Not a directory
        }
        current = current[part].files;
      }
    }    return null;
  }

  /**
   * Read file data from ASAR
   * @param {string} filePath - Path to file in archive
   * @returns {Uint8Array|null} File data or null if not found
   */
  readFile(filePath) {
    const info = this._getFileInfo(filePath);
    
    if (!info) {
      console.warn(`⚠️  [ASAR] File not found: ${filePath}`);
      return null;
    }
    
    const offset = parseInt(info.offset, 10);
    const size = info.size;
    const start = this.dataOffset + offset;
    const end = start + size;
    
    if (end > this.buffer.byteLength) {
      console.error(`❌ [ASAR] File data out of bounds: ${filePath}`);
      return null;
    }
    
    return this.buffer.slice(start, end);
  }

  /**
   * List all files in archive
   * @returns {string[]} Array of file paths
   */
  listFiles() {
    const files = [];
    
    const traverse = (node, path = '') => {
      if (node.files) {
        // Directory
        for (const [name, child] of Object.entries(node.files)) {
          traverse(child, path ? `${path}/${name}` : name);
        }
      } else {
        // File
        files.push(path);
      }
    };
    
    traverse(this.fileTree);
    return files;
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to file
   * @returns {boolean}
   */
  exists(filePath) {
    return this._getFileInfo(filePath) !== null;
  }

  /**
   * Get file size
   * @param {string} filePath - Path to file
   * @returns {number|null} File size in bytes or null
   */
  getSize(filePath) {
    const info = this._getFileInfo(filePath);
    return info ? info.size : null;
  }
}

// Export for use in asset-loader.js
window.AsarReader = AsarReader;
