import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessDocumentRequest {
  fileUrl: string
  fileName: string
  fileType: string
  userId: string
  project?: string
  tags?: string[]
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { fileUrl, fileName, fileType, userId, project = 'default', tags = [] }: ProcessDocumentRequest = await req.json()

    console.log(`Processing document: ${fileName} (${fileType})`)

    // Download the file
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`)
    }

    const fileBuffer = await fileResponse.arrayBuffer()
    let extractedText = ''

    // Enhanced PDF processing
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('Processing PDF document...')
      
      try {
        // Try multiple PDF processing approaches
        extractedText = await processPDFDocument(fileBuffer)
      } catch (pdfError) {
        console.error('PDF processing failed:', pdfError)
        // Fallback: extract any available metadata or return basic info
        extractedText = `PDF Document: ${fileName}\n\nNote: Content extraction failed. Please ensure the PDF is not password-protected and contains readable text.`
      }
    } 
    // Enhanced text file processing
    else if (fileType.startsWith('text/') || fileName.match(/\.(txt|md|csv)$/i)) {
      console.log('Processing text document...')
      const decoder = new TextDecoder('utf-8')
      extractedText = decoder.decode(fileBuffer)
    }
    // Enhanced Word document processing
    else if (fileType.includes('word') || fileName.match(/\.(doc|docx)$/i)) {
      console.log('Processing Word document...')
      try {
        extractedText = await processWordDocument(fileBuffer)
      } catch (wordError) {
        console.error('Word processing failed:', wordError)
        extractedText = `Word Document: ${fileName}\n\nNote: Content extraction failed. Please convert to PDF or text format for better processing.`
      }
    }
    else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    // Enhanced text preprocessing
    const processedContent = preprocessText(extractedText)
    
    if (processedContent.length < 10) {
      throw new Error('Extracted content is too short or empty')
    }

    // Create chunks for better search and retrieval
    const chunks = createTextChunks(processedContent, 1000, 200) // 1000 char chunks with 200 char overlap

    // Store in knowledge base
    const { data: kbEntry, error: kbError } = await supabase
      .from('knowledge_base')
      .insert({
        title: fileName,
        content: processedContent,
        project: project,
        tags: tags,
        file_url: fileUrl,
        file_type: fileType,
        source: 'upload',
        created_by: userId,
        user_id: userId,
        active: true
      })
      .select()
      .single()

    if (kbError) {
      throw new Error(`Failed to save to knowledge base: ${kbError.message}`)
    }

    // Store chunks for better search
    if (chunks.length > 1) {
      const chunkPromises = chunks.map((chunk, index) => 
        supabase.from('document_chunks').insert({
          document_id: kbEntry.id,
          chunk_text: chunk,
          chunk_index: index,
          metadata: {
            file_name: fileName,
            chunk_size: chunk.length,
            total_chunks: chunks.length
          }
        })
      )

      await Promise.all(chunkPromises)
    }

    console.log(`Document processed successfully: ${fileName}`)
    console.log(`Extracted ${processedContent.length} characters in ${chunks.length} chunks`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document processed successfully',
        documentId: kbEntry.id,
        contentLength: processedContent.length,
        chunksCreated: chunks.length,
        preview: processedContent.substring(0, 200) + '...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Document processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Check the document format and try again. Supported formats: PDF, TXT, MD, DOC, DOCX'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Enhanced PDF processing with multiple fallback methods
async function processPDFDocument(buffer: ArrayBuffer): Promise<string> {
  // Method 1: Try to extract text using a simple PDF parser
  try {
    const text = await extractPDFTextSimple(buffer)
    if (text && text.length > 50) {
      return text
    }
  } catch (e) {
    console.log('Simple PDF extraction failed, trying alternative methods...')
  }

  // Method 2: Try to extract text using binary pattern matching
  try {
    const text = await extractPDFTextBinary(buffer)
    if (text && text.length > 20) {
      return text
    }
  } catch (e) {
    console.log('Binary PDF extraction failed...')
  }

  throw new Error('Unable to extract text from PDF using available methods')
}

// Simple PDF text extraction
async function extractPDFTextSimple(buffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer)
  const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
  
  // Look for text content between stream objects
  const textRegex = /BT\s*(.*?)\s*ET/gs
  const matches = text.match(textRegex)
  
  if (matches) {
    let extractedText = matches
      .join(' ')
      .replace(/BT|ET|Tf|TJ|Tj|TD|Td|'|"/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Remove non-printable characters
      .replace(/\s+/g, ' ')
      .trim()
    
    return extractedText
  }
  
  throw new Error('No text content found in PDF')
}

// Binary pattern matching for PDF text extraction
async function extractPDFTextBinary(buffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer)
  let extractedText = ''
  
  // Convert to string and look for readable text patterns
  const text = new TextDecoder('latin1').decode(uint8Array)
  
  // Find text between parentheses (common PDF text encoding)
  const parenthesesRegex = /\((.*?)\)/g
  let match
  const textFragments = []
  
  while ((match = parenthesesRegex.exec(text)) !== null) {
    const fragment = match[1]
    // Filter out likely non-text content
    if (fragment.length > 2 && /[a-zA-Z\s]/.test(fragment)) {
      textFragments.push(fragment)
    }
  }
  
  if (textFragments.length > 0) {
    extractedText = textFragments.join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  if (extractedText.length < 20) {
    throw new Error('Insufficient text extracted from PDF')
  }
  
  return extractedText
}

// Enhanced Word document processing
async function processWordDocument(buffer: ArrayBuffer): Promise<string> {
  // For DOCX files, we can try to extract from the XML structure
  try {
    const uint8Array = new Uint8Array(buffer)
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
    
    // Look for XML text content (DOCX is a ZIP with XML files)
    const xmlTextRegex = /<w:t[^>]*>(.*?)<\/w:t>/gs
    const matches = text.match(xmlTextRegex)
    
    if (matches) {
      const extractedText = matches
        .map(match => match.replace(/<w:t[^>]*>|<\/w:t>/g, ''))
        .join(' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
      
      return extractedText
    }
  } catch (e) {
    console.error('DOCX XML extraction failed:', e)
  }
  
  throw new Error('Unable to extract text from Word document')
}

// Enhanced text preprocessing
function preprocessText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Clean up special characters
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Keep common special characters, replace others with space
      return /[áéíóúñüç]/i.test(char) ? char : ' '
    })
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

// Create overlapping text chunks for better search
function createTextChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  if (text.length <= chunkSize) {
    return [text]
  }

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)

    // Try to break at word boundaries
    if (end < text.length) {
      const lastSpace = chunk.lastIndexOf(' ')
      if (lastSpace > chunkSize * 0.8) { // Only break if we don't lose too much content
        chunk = chunk.slice(0, lastSpace)
      }
    }

    chunks.push(chunk.trim())
    start += chunkSize - overlap
  }

  return chunks.filter(chunk => chunk.length > 50) // Filter out very small chunks
}
