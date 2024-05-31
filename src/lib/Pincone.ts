import {Pinecone } from '@pinecone-database/pinecone'
import { DownloadFromS3 } from './S3-Server';
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embedings';
import md5 from 'md5';
import { converttoASCI } from './utils';

let pinecone : Pinecone | null = null

export const getPineconeCLient = async () => {
    if(!pinecone){
        pinecone = new Pinecone({
            apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!
        })
    }
    return pinecone;
}

type PDFPages = {
    pageContent: string,
    metadata: {
        loc: {pageNumber: number}
    }
}

export async function loadS3IntoPineCone(file_key: string){
    // 1. Obtain the PDF -> Download and read pdf
    console.log('Downloading S3 into our filesystem')
    const file_name = await DownloadFromS3(file_key);
    if(!file_name){
        throw new Error("Could not download S3 into our filesystem")
    }
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPages[]


    //2. SPlit the pages in to small chunks of documents.
    const document = await Promise.all(pages.map(page => prepareDocument(page)))

    // 3. Vectorise and embed individual documents
    const vector = await Promise.all(document.flat().map(embedDocument))

    // Upload to Pincone DB
    const client = await getPineconeCLient()
    const pineconeIndex = client.Index('chatpdf')

    console.log('Inserting vectors in to Pincone DB')
    const namespace = converttoASCI(file_key)
    // pineconeIndex.upsert(vector);
}

async function embedDocument(doc : Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)

        return {
            id: hash,
            values:  embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        }
    } catch (error) {
        console.log('Error embedding document',error)
        throw error
    }
} 

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

async function prepareDocument(page : PDFPages){
    let {pageContent, metadata} = page;
    pageContent = pageContent.replace('/\n/g', '');
    // split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ]);
    return docs;
}