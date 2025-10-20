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
    this.dataOffset = 0;
    
    this._parseHeader();
  }

  /**
   * Parse ASAR header
   */
  _parseHeader() {
    try {
      // Read header sizes (12 bytes total)
      const headerSize = this.dataView.getUint32(0, true); // Little endian
      const jsonSize = this.dataView.getUint32(4, true);
      const alignment = this.dataView.getUint32(8, true);
      
      console.log(`📦 [ASAR] Header size: ${headerSize}, JSON size: ${jsonSize}, Alignment: ${alignment}`);
      
      // Read JSON header
      const jsonStart = 16; // After the 3 UInt32LE values + 4 bytes padding
      const jsonEnd = jsonStart + jsonSize;
      const jsonBytes = this.buffer.slice(jsonStart, jsonEnd);
      const jsonText = new TextDecoder('utf-8').decode(jsonBytes);
      
      this.fileTree = JSON.parse(jsonText);
      
      // Calculate data offset (aligned)
      this.dataOffset = 8 + headerSize;
      if (alignment > 0) {
        this.dataOffset = Math.ceil(this.dataOffset / alignment) * alignment;
      }
      
      console.log(`✅ [ASAR] Header parsed, data starts at byte ${this.dataOffset}`);
      console.log(`📁 [ASAR] File tree:`, this.fileTree);
      
    } catch (error) {
      console.error('❌ [ASAR] Failed to parse header:', error);
      throw error;
    }
  }

  /**
   * Get file info from path
   * @param {string} filePath - Path like "assets/audio/music.mp3"
   * @returns {Object|null} File info with {size, offset}
   */
  _getFileInfo(filePath) {
    const parts = filePath.split('/').filter(p => p.length > 0);
    let current = this.fileTree.files;
    
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
    }
    
    return null;
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
