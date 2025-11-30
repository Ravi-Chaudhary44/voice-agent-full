import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

class FileParser {
  static async parsePDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing error: ${error.message}`);
    }
  }

  static async parseWord(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Word document parsing error: ${error.message}`);
    }
  }

  static async parseFile(buffer, mimetype) {
    switch (mimetype) {
      case 'application/pdf':
        return await this.parsePDF(buffer);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await this.parseWord(buffer);
      default:
        throw new Error('Unsupported file type');
    }
  }
}

export default FileParser;